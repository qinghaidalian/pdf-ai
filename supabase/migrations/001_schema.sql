-- ============================================
-- PDF AI v1.0 — 完整数据库 Schema
-- ============================================

-- 1. profiles — 用户资料表 (扩展 auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- 2. documents — 用户上传的文档
-- ============================================
CREATE TYPE public.document_status AS ENUM (
  'uploading', 'processing', 'ready', 'error', 'deleted'
);

CREATE TABLE public.documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  file_size     INTEGER NOT NULL,
  page_count    INTEGER,
  storage_path  TEXT NOT NULL DEFAULT '',
  raw_text      TEXT,
  status        public.document_status NOT NULL DEFAULT 'uploading',
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_created ON public.documents(created_at DESC);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own documents"
  ON public.documents FOR ALL
  USING (auth.uid() = user_id);


-- ============================================
-- 3. chunks — 文本分块（RAG 检索，v1.5 启用）
-- ============================================
CREATE TABLE public.chunks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  page_number   INTEGER,
  chunk_index   INTEGER NOT NULL,
  embedding     VECTOR(1536),
  token_count   INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chunks_document ON public.chunks(document_id);

ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own chunks"
  ON public.chunks FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.documents
    WHERE documents.id = chunks.document_id
    AND documents.user_id = auth.uid()
  ));


-- ============================================
-- 4. analyses — 分析记录
-- ============================================
CREATE TYPE public.analysis_status AS ENUM (
  'pending', 'processing', 'completed', 'error'
);
CREATE TYPE public.template_key AS ENUM (
  'contract', 'paper', 'financial', 'resume', 'longread'
);

CREATE TABLE public.analyses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id   UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  template_key  public.template_key NOT NULL,
  input_data    JSONB,
  result        JSONB,
  status        public.analysis_status NOT NULL DEFAULT 'pending',
  model_used    TEXT,
  tokens_used   INTEGER,
  error_message TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

CREATE INDEX idx_analyses_user ON public.analyses(user_id);
CREATE INDEX idx_analyses_document ON public.analyses(document_id);
CREATE INDEX idx_analyses_template ON public.analyses(template_key);
CREATE INDEX idx_analyses_created ON public.analyses(created_at DESC);

ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own analyses"
  ON public.analyses FOR ALL
  USING (auth.uid() = user_id);


-- ============================================
-- 5. subscriptions — 订阅管理
-- ============================================
CREATE TYPE public.plan_tier AS ENUM ('free', 'pro', 'team');
CREATE TYPE public.subscription_status AS ENUM (
  'active', 'past_due', 'canceled', 'expired', 'trialing'
);

CREATE TABLE public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier             public.plan_tier NOT NULL DEFAULT 'free',
  status                public.subscription_status NOT NULL DEFAULT 'active',
  ls_subscription_id    TEXT,
  ls_customer_id        TEXT,
  ls_variant_id         TEXT,
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  cancel_at             TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 新用户注册时自动创建免费订阅
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan_tier, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_subscription();


-- ============================================
-- 6. usage_logs — 用量记录
-- ============================================
CREATE TABLE public.usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  tokens_used   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_usage_user_date ON public.usage_logs(user_id, created_at DESC);

ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own usage"
  ON public.usage_logs FOR SELECT
  USING (auth.uid() = user_id);


-- ============================================
-- 7. Storage 存储桶策略
-- ============================================
-- 文件路径格式: {user_id}/{document_id}.pdf
-- storage.foldername(name)[1] 取第一级目录 = user_id

CREATE POLICY "Users can read own files"
  ON storage.objects FOR SELECT
  USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files"
  ON storage.objects FOR INSERT
  WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  USING (auth.uid()::text = (storage.foldername(name))[1]);
