import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { createCheckout, getVariantId } from "@/lib/payment/lemonsqueezy";

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "请先登录" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan }: { plan: "pro_monthly" | "pro_yearly" } = body;

    if (!plan || !["pro_monthly", "pro_yearly"].includes(plan)) {
      return NextResponse.json(
        { error: "INVALID_PLAN", message: "无效的套餐类型" },
        { status: 400 }
      );
    }

    const variantId = getVariantId(plan);
    const checkout = await createCheckout(
      user.id,
      user.email || `${user.id}@user.local`,
      variantId
    );

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
