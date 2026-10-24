// Mock of the Paymob transaction webhook: receives a payment notification
// and records it through the idempotent record_payment database function.
// The real webhook will verify Paymob's HMAC here before recording.
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

type Notification = {
  transaction_id: string;
  amount_cents: number;
  plan: string;
  success: boolean;
  user_id: string;
  cohort: string;
};

export default {
  // Server-to-server only: callers must send the secret key.
  fetch: withSupabase({ auth: ["secret"] }, async (req, ctx) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const n = (await req.json()) as Notification;
    if (!n.transaction_id || !Number.isInteger(n.amount_cents) || !n.plan || !n.user_id || !n.cohort) {
      return Response.json({ error: "Invalid notification" }, { status: 400 });
    }

    const { data, error } = await ctx.supabaseAdmin.rpc("record_payment", {
      p_transaction_id: n.transaction_id,
      p_amount_cents: n.amount_cents,
      p_plan: n.plan,
      p_success: n.success,
      p_raw: { ...n, mock: true },
      p_user_id: n.user_id,
      p_cohort: n.cohort,
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ payment: data });
  }),
};
