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
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 50);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const admin = createAdminClient();
    const { data, error, count } = await admin
      .from("documents")
      .select("id, filename, file_size, page_count, status, created_at", {
        count: "exact",
      })
      .eq("user_id", user.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("Documents list error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
