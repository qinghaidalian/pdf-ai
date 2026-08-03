import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { chatWithJSON } from "@/lib/llm/client";

const VALID_TEMPLATES = [
  "contract",
  "paper",
  "financial",
  "resume",
  "longread",
];
const FREE_TEMPLATES = ["contract", "longread"];

export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "请先登录" },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await request.json();
    const { document_id, template_key, input_data } = body;
    if (!document_id || !template_key) {
      return NextResponse.json(
        { error: "INVALID_PARAMS", message: "缺少必要参数" },
        { status: 400 }
      );
    }
    if (!VALID_TEMPLATES.includes(template_key)) {
      return NextResponse.json(
        { error: "INVALID_TEMPLATE", message: "无效的模板" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 3. Verify document ownership
    const { data: doc } = await admin
      .from("documents")
      .select("*")
      .eq("id", document_id)
      .eq("user_id", user.id)
      .single();

    if (!doc) {
      return NextResponse.json(
        { error: "DOCUMENT_NOT_FOUND", message: "文档不存在" },
        { status: 404 }
      );
    }
    if (doc.status !== "ready") {
      return NextResponse.json(
        { error: "DOCUMENT_NOT_READY", message: "文档尚未处理完成" },
        { status: 400 }
      );
    }
    if (!doc.raw_text || doc.raw_text.trim().length === 0) {
      return NextResponse.json(
        { error: "DOCUMENT_EMPTY", message: "PDF 中未检测到可读文本" },
        { status: 400 }
      );
    }

    // 4. Check template access
    const { data: sub } = await admin
      .from("subscriptions")
      .select("plan_tier")
      .eq("user_id", user.id)
      .maybeSingle();
    const plan = sub?.plan_tier || "free";
    if (plan === "free" && !FREE_TEMPLATES.includes(template_key)) {
      return NextResponse.json(
        { error: "TEMPLATE_NOT_AVAILABLE", message: "该模板需要 Pro 订阅，请升级后使用" },
        { status: 403 }
      );
    }

    // 5. Rate limit (free users)
    if (plan === "free") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count } = await admin
        .from("usage_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action", "analysis")
        .gte("created_at", today.toISOString());

      if (count && count >= 3) {
        return NextResponse.json(
          { error: "RATE_LIMITED", message: "今日免费次数已用完，请明天再来或升级 Pro" },
          { status: 429 }
        );
      }
    }

    // 6. Create analysis record
    const { data: analysis, error: analysisErr } = await admin
      .from("analyses")
      .insert({
        user_id: user.id,
        document_id,
        template_key,
        input_data: input_data || null,
        status: "processing",
        model_used: "deepseek-chat",
      })
      .select()
      .single();

    if (analysisErr || !analysis) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "创建分析记录失败" },
        { status: 500 }
      );
    }

    // 7. Run LLM
    try {
      const { systemPrompt, schema } = await getTemplatePrompt(template_key);
      const messages = [
        { role: "system" as const, content: systemPrompt },
        {
          role: "user" as const,
          content: buildUserMessage(doc.raw_text, template_key, input_data),
        },
      ];

      const result = await chatWithJSON<Record<string, unknown>>(messages, {
        temperature: 0.1,
        max_tokens: 4096,
      });

      // Update with result
      await admin
        .from("analyses")
        .update({
          status: "completed",
          result,
          completed_at: new Date().toISOString(),
        })
        .eq("id", analysis.id);

      // Log usage
      await admin.from("usage_logs").insert({
        user_id: user.id,
        action: "analysis",
        tokens_used: 0,
      });

      return NextResponse.json(
        { data: { id: analysis.id, status: "completed" } },
        { status: 201 }
      );
    } catch (llmErr: any) {
      // Update with error
      await admin
        .from("analyses")
        .update({
          status: "error",
          error_message: llmErr.message || "LLM 调用失败",
          completed_at: new Date().toISOString(),
        })
        .eq("id", analysis.id);

      return NextResponse.json(
        { error: "LLM_ERROR", message: "AI 分析失败，请重试" },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// --- Prompt loading (dynamic import to avoid bundling all prompts) ---
async function getTemplatePrompt(key: string): Promise<{
  systemPrompt: string;
  schema: Record<string, unknown>;
}> {
  switch (key) {
    case "contract": {
      const { contractPrompt, contractSchema } = await import(
        "@/lib/llm/prompts/contract"
      );
      return { systemPrompt: contractPrompt, schema: contractSchema };
    }
    case "paper": {
      const { paperPrompt, paperSchema } = await import(
        "@/lib/llm/prompts/paper"
      );
      return { systemPrompt: paperPrompt, schema: paperSchema };
    }
    case "financial": {
      const { financialPrompt, financialSchema } = await import(
        "@/lib/llm/prompts/financial"
      );
      return { systemPrompt: financialPrompt, schema: financialSchema };
    }
    case "resume": {
      const { resumePrompt, resumeSchema } = await import(
        "@/lib/llm/prompts/resume"
      );
      return { systemPrompt: resumePrompt, schema: resumeSchema };
    }
    case "longread": {
      const { longreadPrompt, longreadSchema } = await import(
        "@/lib/llm/prompts/longread"
      );
      return { systemPrompt: longreadPrompt, schema: longreadSchema };
    }
    default:
      throw new Error(`Unknown template: ${key}`);
  }
}

function buildUserMessage(
  rawText: string,
  templateKey: string,
  inputData?: Record<string, unknown> | null
): string {
  const truncated =
    rawText.length > 100000
      ? rawText.slice(0, 100000) + "\n\n[文档过长，已截断前 100000 字符]"
      : rawText;

  let msg = `以下是需要分析的 PDF 文档内容：\n\n---\n${truncated}\n---\n\n`;

  if (templateKey === "resume" && inputData?.jd_text) {
    msg += `岗位描述 (JD)：\n${inputData.jd_text}\n\n`;
  }

  msg += "请开始分析。";
  return msg;
}
