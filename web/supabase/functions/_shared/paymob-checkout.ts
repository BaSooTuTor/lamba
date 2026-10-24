// Finds the checkout a Paymob transaction belongs to. Shared by the webhook (Deno)
// and /billing/result (Next.js).
//
// Lookup order:
// 1. The Paymob order id: covered by the HMAC, so it can't be edited in transit.
// 2. The special_reference echoed back as merchant_order_id: not covered by the HMAC,
//    but it only matches a row our server created, and it contains a random-looking
//    user id + timestamp, so it can't be guessed for another student.
// Nothing is ever granted from a reference that has no checkout row.
import type { SupabaseClient } from "@supabase/supabase-js";

export type CheckoutRow = {
  user_id: string;
  cohort: string;
  plan: string;
  amount_cents: number;
};

const COLUMNS = "user_id, cohort, plan, amount_cents";

export async function findCheckout(
  db: SupabaseClient,
  orderId: string | number | null | undefined,
  reference: string | null | undefined,
): Promise<CheckoutRow | null> {
  if (orderId !== null && orderId !== undefined && String(orderId) !== "") {
    const { data } = await db
      .from("checkouts")
      .select(COLUMNS)
      .eq("paymob_order_id", String(orderId))
      .maybeSingle();
    if (data) return data as CheckoutRow;
  }
  if (reference) {
    const { data } = await db
      .from("checkouts")
      .select(COLUMNS)
      .eq("special_reference", reference)
      .maybeSingle();
    if (data) return data as CheckoutRow;
  }
  return null;
}

// The record_payment arguments for a verified transaction. The pass is only activated
// (p_cohort set) when the paid amount equals what this checkout was priced at.
export function paymentArgs(
  checkout: CheckoutRow | null,
  tx: { id: string | number; amount_cents: number; success: boolean },
  raw: unknown,
) {
  const amountOk = checkout !== null && Number(tx.amount_cents) === checkout.amount_cents;
  return {
    p_transaction_id: String(tx.id),
    p_amount_cents: Number(tx.amount_cents),
    p_plan: checkout?.plan ?? "unknown",
    p_success: tx.success,
    p_raw: raw,
    p_user_id: checkout?.user_id ?? null,
    p_cohort: amountOk ? checkout!.cohort : null,
  };
}
