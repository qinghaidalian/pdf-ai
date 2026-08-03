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
      .from("documents")
      .select("id, filename, file_size, page_count, status, created_at, updated_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "DOCUMENT_NOT_FOUND", message: "文档不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Document detail error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Soft delete
    const { error } = await admin
      .from("documents")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "DB_ERROR", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { id, deleted: true } });
  } catch (err) {
    console.error("Document delete error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
