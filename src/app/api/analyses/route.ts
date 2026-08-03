import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "请先登录" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const templateKey = url.searchParams.get("template_key");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const admin = createAdminClient();
    let query = admin
      .from("analyses")
      .select(
        `
        id,
        template_key,
        status,
        model_used,
        created_at,
        completed_at,
        documents!inner(filename)
      `,
        { count: "exact" }
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (templateKey) {
      query = query.eq("template_key", templateKey);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: error.message },
        { status: 500 }
      );
    }

    const items = (data || []).map((item: any) => ({
      id: item.id,
      document: item.documents
        ? { filename: item.documents.filename }
        : { filename: "未知文档" },
      template_key: item.template_key,
      status: item.status,
      model_used: item.model_used,
      created_at: item.created_at,
      completed_at: item.completed_at,
    }));

    return NextResponse.json({
      data: items,
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Analyses list error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
