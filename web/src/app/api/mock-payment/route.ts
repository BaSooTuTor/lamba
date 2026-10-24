import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Mock stand-in for checkout: the server picks the plan and price, then plays
// Paymob by sending a successful notification to the mock-payment Edge Function.
const MOCK_PLAN = { plan: "full_year", amount_cents: 79900 };

export async function GET() {
  const { data, error } = await supabaseAdmin()
    .from("payments")
    .select("id, paymob_transaction_id, amount_cents, currency, plan, success, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}

export async function POST() {
  const { data, error } = await supabaseAdmin().functions.invoke("mock-payment", {
    body: {
      transaction_id: `mock_${Date.now()}`,
      amount_cents: MOCK_PLAN.amount_cents,
      plan: MOCK_PLAN.plan,
      success: true,
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  return NextResponse.json(data, { status: 201 });
}
