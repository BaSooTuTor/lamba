import { NextResponse } from "next/server";
import { getProfile, getUser } from "@/lib/auth";
import { getOffer } from "@/lib/cohorts";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";

// Mock stand-in for checkout (dev/demo only): the server picks the plan and price, then plays
// Paymob by sending a successful notification to the mock-payment Edge Function.
const enabled = () => process.env.ENABLE_MOCK_PAYMENT === "true";
const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

// The signed-in user's own payments (RLS: payments are readable by their owner only).
export async function GET() {
  if (!enabled()) return notFound();
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "سجّل دخولك الأول" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("id, paymob_transaction_id, amount_cents, currency, plan, success, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data });
}

export async function POST() {
  if (!enabled()) return notFound();
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "سجّل دخولك الأول" }, { status: 401 });

  const profile = await getProfile(user.id);
  const offer = getOffer(profile?.exam_cohort ?? "2027");
  if (!offer) return NextResponse.json({ error: "مفيش باقة متاحة لدفعتك دلوقتي" }, { status: 409 });

  const { data, error } = await supabaseAdmin().functions.invoke("mock-payment", {
    body: {
      transaction_id: `mock_${Date.now()}`,
      amount_cents: offer.amountCents,
      plan: offer.plan,
      success: true,
      user_id: user.id,
      cohort: offer.cohort,
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  return NextResponse.json(data, { status: 201 });
}
