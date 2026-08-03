import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  Copy,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { TEMPLATE_META } from "@/types";
import { formatDate, formatFileSize } from "@/lib/utils";
import { ContractResult } from "@/components/templates/results/contract-result";
import { PaperResult } from "@/components/templates/results/paper-result";
import { FinancialResult } from "@/components/templates/results/financial-result";
import { ResumeResult } from "@/components/templates/results/resume-result";
import { LongreadResult } from "@/components/templates/results/longread-result";
import type { TemplateKey } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AnalyzePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*, documents(*)")
    .eq("id", id)
    .single();

  if (!analysis) notFound();

  const templateKey = analysis.template_key as TemplateKey;
  const meta = TEMPLATE_META[templateKey];
  const loading = analysis.status === "pending" || analysis.status === "processing";

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/history">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span>{meta.icon}</span>
              {meta.label}
            </h1>
            {analysis.documents && (
              <p className="text-sm text-muted-foreground">
                {analysis.documents.filename} ·{" "}
                {formatDate(analysis.created_at)}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {analysis.status === "completed" && (
            <>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" /> 导出
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Copy className="h-4 w-4" /> 复制
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status banners */}
      {loading && (
        <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <p className="text-sm">
              {analysis.status === "pending"
                ? "分析任务已提交，正在排队..."
                : "AI 正在分析你的文档，请稍候..."}
            </p>
          </CardContent>
        </Card>
      )}

      {analysis.status === "error" && (
        <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-medium">分析失败</p>
              <p className="text-xs text-muted-foreground">
                {analysis.error_message || "未知错误，请重试"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {analysis.status === "completed" && analysis.result && (
        <div className="space-y-6">
          <ResultRenderer templateKey={templateKey} data={analysis.result} />
        </div>
      )}

      {/* Footer */}
      <div className="mt-10 pt-6 border-t flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>⚡ 由 {analysis.model_used || "DeepSeek-V3"} 驱动</span>
          {analysis.tokens_used > 0 && (
            <span>消耗 {analysis.tokens_used} tokens</span>
          )}
        </div>
        <span>🔒 你的文档已加密存储，可随时删除</span>
      </div>
    </div>
  );
}

function ResultRenderer({
  templateKey,
  data,
}: {
  templateKey: TemplateKey;
  data: Record<string, unknown>;
}) {
  switch (templateKey) {
    case "contract":
      return <ContractResult data={data} />;
    case "paper":
      return <PaperResult data={data} />;
    case "financial":
      return <FinancialResult data={data} />;
    case "resume":
      return <ResumeResult data={data} />;
    case "longread":
      return <LongreadResult data={data} />;
    default:
      return <pre>{JSON.stringify(data, null, 2)}</pre>;
  }
}
