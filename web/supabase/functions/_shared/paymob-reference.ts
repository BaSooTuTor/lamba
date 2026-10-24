// special_reference (Paymob echoes it back as merchant_order_id) = userId:cohort:plan:timestamp.
// Built in /api/checkout; "anon" means no user. Shared by the webhook and /billing/result.
export function parseReference(reference: string | undefined | null) {
  const [userId, cohort, plan] = (reference ?? "").split(":");
  return {
    userId: userId && userId !== "anon" ? userId : null,
    cohort: cohort || null,
    plan: plan || "unknown",
  };
}

export const MISSING_HMAC_SECRET = "إعدادات الدفع ناقصة: PAYMOB_HMAC_SECRET مش متسجل على السيرفر.";
