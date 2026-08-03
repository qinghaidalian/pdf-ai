import { createHmac } from "crypto";

const LS_BASE = "https://api.lemonsqueezy.com/v1";

// Securely reads all LS config from env (server-side only)
function getConfig() {
  return {
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
    storeId: process.env.LEMONSQUEEZY_STORE_ID!,
    proMonthlyVariantId: process.env.LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID!,
    proYearlyVariantId: process.env.LEMONSQUEEZY_PRO_YEARLY_VARIANT_ID!,
  };
}

export interface CheckoutSession {
  id: string;
  url: string;
}

/**
 * Create a Lemon Squeezy checkout session for a Pro subscription.
 * The user is redirected to Lemon Squeezy's hosted checkout page.
 */
export async function createCheckout(
  userId: string,
  userEmail: string,
  variantId: string
): Promise<CheckoutSession> {
  const { apiKey, storeId } = getConfig();

  const res = await fetch(`${LS_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            email: userEmail,
            custom: { user_id: userId },
          },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/upload`,
          },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lemon Squeezy checkout error: ${res.status} ${err}`);
  }

  const json = await res.json();
  return {
    id: json.data.id,
    url: json.data.attributes.url,
  };
}

/**
 * Verify that a webhook request genuinely came from Lemon Squeezy.
 * Uses HMAC-SHA256 signature verification.
 */
export function verifyWebhook(body: string, signature: string): boolean {
  const { webhookSecret } = getConfig();
  const hmac = createHmac("sha256", webhookSecret);
  const digest = hmac.update(body).digest("hex");
  return signature === digest;
}

/**
 * Get the LS variant ID for a given plan.
 */
export function getVariantId(plan: "pro_monthly" | "pro_yearly"): string {
  const { proMonthlyVariantId, proYearlyVariantId } = getConfig();
  return plan === "pro_monthly" ? proMonthlyVariantId : proYearlyVariantId;
}
