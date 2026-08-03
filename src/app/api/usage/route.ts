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

    // Get subscription
    const { data: sub } = await admin
      .from("subscriptions")
      .select("plan_tier, status")
      .eq("user_id", user.id)
      .maybeSingle();

    const plan = sub?.plan_tier || "free";

    // Daily usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: analysesUsed } = await admin
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", "analysis")
      .gte("created_at", today.toISOString());

    const { count: uploadsUsed } = await admin
      .from("usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", "upload")
      .gte("created_at", today.toISOString());

    const LIMITS: Record<string, { analyses: number; uploads: number }> = {
      free: { analyses: 3, uploads: 10 },
      pro: { analyses: 100, uploads: Infinity },
      team: { analyses: 500, uploads: Infinity },
    };

    const limits = LIMITS[plan] || LIMITS.free;

    return NextResponse.json({
      data: {
        plan,
        daily: {
          analyses_used: analysesUsed || 0,
          analyses_limit: limits.analyses,
          uploads_used: uploadsUsed || 0,
          uploads_limit: limits.uploads,
        },
      },
    });
  } catch (err) {
    console.error("Usage error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "服务器内部错误" },
      { status: 500 }
    );
  }
}
