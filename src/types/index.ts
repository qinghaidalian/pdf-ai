export type TemplateKey =
  | "contract"
  | "paper"
  | "financial"
  | "resume"
  | "longread";

export type AnalysisStatus = "pending" | "processing" | "completed" | "error";
export type DocumentStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "error"
  | "deleted";
export type PlanTier = "free" | "pro" | "team";

export interface Document {
  id: string;
  filename: string;
  file_size: number;
  page_count: number | null;
  status: DocumentStatus;
  created_at: string;
}

export interface Analysis {
  id: string;
  document_id: string;
  template_key: TemplateKey;
  input_data: Record<string, unknown> | null;
  result: Record<string, unknown> | null;
  status: AnalysisStatus;
  model_used: string;
  tokens_used: number;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface UsageQuota {
  plan: PlanTier;
  daily: {
    analyses_used: number;
    analyses_limit: number;
  };
}

export const TEMPLATE_META: Record<
  TemplateKey,
  { icon: string; label: string; desc: string; free: boolean }
> = {
  contract: {
    icon: "📋",
    label: "合同体检",
    desc: "20 项风险检查，异常条款标红，含修改建议",
    free: true,
  },
  paper: {
    icon: "📄",
    label: "论文拆解",
    desc: "背景→方法→结果→局限，结构化解读",
    free: false,
  },
  financial: {
    icon: "📊",
    label: "财报速读",
    desc: "核心财务指标 + 同比变化 + 风险提示",
    free: false,
  },
  resume: {
    icon: "💼",
    label: "简历快筛",
    desc: "匹配度评分 + 亮点/疑点 + 面试建议",
    free: false,
  },
  longread: {
    icon: "📖",
    label: "长文精读",
    desc: "三句话摘要 + 思维导图 + 行动启发",
    free: true,
  },
};
