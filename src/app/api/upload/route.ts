import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parsePDF } from "@/lib/pdf/parser";

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

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "NO_FILE", message: "请上传文件" },
        { status: 400 }
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "INVALID_FILE_TYPE", message: "仅支持 PDF 文件" },
        { status: 400 }
      );
    }
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "FILE_TOO_LARGE", message: "文件大小不能超过 50MB" },
        { status: 400 }
      );
    }

    // 3. Use admin client to insert (bypass RLS for initial insert)
    const admin = createAdminClient();

    // 4. Create document record
    const { data: doc, error: docErr } = await admin
      .from("documents")
      .insert({
        user_id: user.id,
        filename: file.name,
        file_size: file.size,
        status: "processing",
      })
      .select()
      .single();

    if (docErr || !doc) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "创建文档记录失败" },
        { status: 500 }
      );
    }

    // 5. Upload to Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `${user.id}/${doc.id}.pdf`;

    const { error: uploadErr } = await admin.storage
      .from("pdf-documents")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      await admin.from("documents").update({ status: "error", error_message: uploadErr.message }).eq("id", doc.id);
      return NextResponse.json(
        { error: "UPLOAD_FAILED", message: "文件上传失败" },
        { status: 500 }
      );
    }

    // 6. Parse PDF text
    let rawText = "";
    let pageCount = null;
    try {
      const parsed = await parsePDF(buffer);
      rawText = parsed.text;
      pageCount = parsed.pageCount;
    } catch (err: any) {
      console.error("PDF parse error:", err?.message || err);
      // Text extraction failed but file was saved
      rawText = "";
    }

    // 7. Update document
    const { data: updated, error: updateErr } = await admin
      .from("documents")
      .update({
        status: "ready",
        raw_text: rawText,
        page_count: pageCount,
        storage_path: storagePath,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doc.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json(
        { error: "DB_ERROR", message: "更新文档状态失败" },
        { status: 500 }
      );
    }

    // 8. Log usage
    await admin.from("usage_logs").insert({
      user_id: user.id,
      action: "upload",
    });

    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
