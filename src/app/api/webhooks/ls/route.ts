import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/payment/lemonsqueezy";
import { createAdminClient } from "@/lib/supabase/admin";

const LS_BASE = "https://api.lemonsqueezy.com/v1";

/**
 * Lemon Squeezy webhook handler.
 *
 * When a user subscribes and pays, LS sends events here.
 * We update the subscriptions table to activate/upgrade/downgrade.
 *
 * Matching strategy:
 *   order_created → find checkout → extract custom.user_id → update subscription
 *   subscription_payment_success → update by ls_subscription_id
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    // Verify HMAC-X-Signature
    const signature = request.headers.get("x-signature");
    if (!signature || !verifyWebhook(body, signature)) {
      return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventName = event.meta?.event_name as string;
    const eventData = event.data;
    const admin = createAdminClient();

    console.log(`📨 LS Webhook: ${eventName}`);

    if (eventName === "order_created") {
      // An order was created after payment. Extract user_id from checkout custom data.
      const orderId = eventData.id;
      const checkoutId =
        eventData.attributes?.checkout_id ||
        eventData.relationships?.checkout?.data?.id;

      if (checkoutId) {
        // Fetch checkout to get custom data
        const chRes = await fetch(`${LS_BASE}/checkouts/${checkoutId}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          },
        });
        if (chRes.ok) {
          const chJson = await chRes.json();
          const userId = chJson.data?.attributes?.checkout_data?.custom?.user_id;

          if (userId) {
            // Get customer and subscription info
            const customerId =
              eventData.attributes?.customer_id ||
              eventData.relationships?.customer?.data?.id;
            const variantId =
              eventData.attributes?.variant_id ||
              eventData.relationships?.variant?.data?.id;

            await admin
              .from("subscriptions")
              .upsert({
                user_id: userId,
                plan_tier: "pro",
                status: "active",
                ls_customer_id: customerId ? String(customerId) : null,
                ls_variant_id: variantId ? String(variantId) : null,
                updated_at: new Date().toISOString(),
              });
            console.log(`✅ Activated Pro for user ${userId.slice(0, 8)}...`);
          }
        }
      }
    }

    if (eventName === "subscription_updated") {
      const subAttrs = eventData.attributes;
      const renewsAt = subAttrs.renews_at;
      const endsAt = subAttrs.ends_at;
      const cancelAt = subAttrs.cancelled ? new Date().toISOString() : null;
      const status = subAttrs.status === "cancelled" ? "canceled"
        : subAttrs.status === "past_due" ? "past_due"
        : "active";

      // Try to find the subscription by LS subscription ID
      const { data: existing } = await admin
        .from("subscriptions")
        .select("id")
        .eq("ls_subscription_id", String(eventData.id))
        .maybeSingle();

      if (existing) {
        await admin
          .from("subscriptions")
          .update({
            status,
            current_period_end: endsAt || renewsAt,
            cancel_at: cancelAt,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
    }

    if (
      eventName === "subscription_cancelled" ||
      eventName === "subscription_expired"
    ) {
      const subId = eventData.id;
      const { data: existing } = await admin
        .from("subscriptions")
        .select("id")
        .eq("ls_subscription_id", String(subId))
        .maybeSingle();

      if (existing) {
        await admin
          .from("subscriptions")
          .update({
            status: eventName === "subscription_expired" ? "expired" : "canceled",
            plan_tier: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        console.log(`⬇ Downgraded user to free (${eventName})`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "WEBHOOK_ERROR" }, { status: 500 });
  }
}
