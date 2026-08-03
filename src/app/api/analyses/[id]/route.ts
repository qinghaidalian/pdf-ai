import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "请先登录" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from("analyses")
      .select(
        `
        id,
        template_key,
        input_data,
        result,
        status,
        model_used,
        tokens_used,
        error_message,
        created_at,
        completed_at,
        documents!inner(id, filename, page_count, file_size)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "ANALYSIS_NOT_FOUND", message: "分析记录不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: data.id,
        document: data.documents,
        template_key: data.template_key,
        input_data: data.input_data,
        result: data.result,
        status: data.status,
        model_used: data.model_used,
        tokens_used: data.tokens_used,
        error_message: data.error_message,
        created_at: data.created_at,
        completed_at: data.completed_at,
      },
    });
  } catch (err) {
    console.error("Analysis detail error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
