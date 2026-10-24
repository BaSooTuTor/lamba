// Paymob transaction webhook (notification_url). Paymob calls this directly, so there is
// no Supabase key; the request is trusted only if its HMAC matches PAYMOB_HMAC_SECRET.
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { hmacStringFromTransaction, verifyHmac } from "../_shared/paymob-hmac.ts";
import { MISSING_HMAC_SECRET, parseReference } from "../_shared/paymob-reference.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const hmac = new URL(req.url).searchParams.get("hmac") ?? "";
  const body = await req.json();
  const tx = body?.obj;
  if (body?.type !== "TRANSACTION" || !tx) {
    return Response.json({ ignored: true });
  }

  const secret = Deno.env.get("PAYMOB_HMAC_SECRET");
  if (!secret) return Response.json({ error: MISSING_HMAC_SECRET }, { status: 500 });

  const ok = await verifyHmac(hmacStringFromTransaction(tx), hmac, secret);
  if (!ok) return Response.json({ error: "Invalid HMAC" }, { status: 401 });

  const { userId, cohort, plan } = parseReference(tx.order?.merchant_order_id);

  const { error } = await supabase.rpc("record_payment", {
    p_transaction_id: String(tx.id),
    p_amount_cents: tx.amount_cents,
    p_plan: plan,
    p_success: tx.success === true,
    p_raw: body,
    p_user_id: userId,
    p_cohort: cohort,
  });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ received: true });
});
