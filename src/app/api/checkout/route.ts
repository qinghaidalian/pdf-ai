import { NextRequest, NextResponse } from "next/server";
import { createCheckout, getVariantId } from "@/lib/payment/lemonsqueezy";

/**
 * POST /api/checkout
 *
 * Creates a Lemon Squeezy checkout session.
 * Does NOT use Supabase cookie auth or JWT at all.
 * Identity (email + userId) comes from the request body, obtained
 * client-side from the browser's Supabase session.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      plan,
      email,
      userId,
    }: { plan: "pro_monthly" | "pro_yearly"; email: string; userId: string } = body;

    if (!plan || !["pro_monthly", "pro_yearly"].includes(plan)) {
      return NextResponse.json(
        { error: "INVALID_PLAN", message: "无效的套餐类型" },
        { status: 400 }
      );
    }

    if (!email || !userId) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "请先登录" },
        { status: 401 }
      );
    }

    const variantId = getVariantId(plan);
    const checkout = await createCheckout(userId, email, variantId);

    return NextResponse.json({
      data: { url: checkout.url, id: checkout.id },
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "CHECKOUT_FAILED", message: err.message || "创建支付链接失败" },
      { status: 500 }
    );
  }
}
