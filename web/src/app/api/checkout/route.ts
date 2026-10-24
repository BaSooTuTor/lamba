import { NextResponse, type NextRequest } from "next/server";
import { getProfile, getUser } from "@/lib/auth";
import { getOffer } from "@/lib/cohorts";
import { createCheckoutUrl } from "@/lib/paymob";
import { supabaseAdmin } from "@/lib/supabase-admin";

// Creates a Paymob payment intention for the signed-in user and returns the Unified Checkout URL.
// The plan and price come from the user's exam cohort and today's date, never from the request.
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "سجّل دخولك الأول" }, { status: 401 });

  const profile = await getProfile(user.id);
  const cohort = profile?.exam_cohort ?? "2027";
  const offer = getOffer(cohort);
  if (!offer) return NextResponse.json({ error: "مفيش باقة متاحة لدفعتك دلوقتي" }, { status: 409 });

  const appUrl = process.env.APP_URL ?? req.nextUrl.origin;
  // Paymob echoes this back as merchant_order_id. Who paid is decided by the checkouts row below.
  const reference = `${user.id}:${offer.cohort}:${offer.plan}:${Date.now()}`;

  // Billing fields come from the profile; Paymob requires all of them, so fall back only when missing.
  const [firstName, ...rest] = (profile?.name ?? "").trim().split(/\s+/);

  try {
    const { url, orderId, intentionId } = await createCheckoutUrl({
      amountCents: offer.amountCents,
      itemName: `باقة لمبة · الثانوية العامة ${offer.cohort} (${offer.label})`,
      billing: {
        first_name: firstName || "طالب",
        last_name: rest.join(" ") || "لمبة",
        email: user.email || "student@example.com",
        phone_number: profile?.phone || "+201000000000",
      },
      reference,
      redirectionUrl: `${appUrl}/billing/result`,
      notificationUrl: process.env.PAYMOB_WEBHOOK_URL,
    });

    // Bind this Paymob order to the student before sending them to pay.
    const { error } = await supabaseAdmin().from("checkouts").insert({
      user_id: user.id,
      cohort: offer.cohort,
      plan: offer.plan,
      amount_cents: offer.amountCents,
      special_reference: reference,
      paymob_order_id: orderId,
      paymob_intention_id: intentionId,
    });
    if (error) {
      console.error("checkout insert failed:", error.message);
      return NextResponse.json({ error: "مقدرناش نبدأ الدفع، جرّب تاني" }, { status: 500 });
    }
    if (!orderId) console.warn("checkout: Paymob returned no intention_order_id; matching by reference only");

    return NextResponse.json({ url });
  } catch (e) {
    // Only the prefix ("Paymob intention failed (400)" / "Missing X"): Paymob's error body can echo billing data.
    console.error("checkout failed:", (e as Error).message.split(":")[0]);
    return NextResponse.json({ error: "مقدرناش نبدأ الدفع، جرّب تاني" }, { status: 502 });
  }
}
