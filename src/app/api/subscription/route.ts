import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "请先登录" },
        { status: 401 }
      );
    }

    const admin = createAdminClient();

    const { data: sub } = await admin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({
      data: sub || {
        plan_tier: "free",
        status: "active",
      },
    });
  } catch (err) {
    console.error("Subscription error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
