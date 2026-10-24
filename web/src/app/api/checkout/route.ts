import { NextResponse, type NextRequest } from "next/server";
import { getProfile, getUser } from "@/lib/auth";
import { getOffer } from "@/lib/cohorts";
import { createCheckoutUrl } from "@/lib/paymob";

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
  // Paymob echoes this back as merchant_order_id; the webhook parses it (see paymob-reference.ts).
  const reference = `${user.id}:${offer.cohort}:${offer.plan}:${Date.now()}`;

  // Billing fields come from the profile; Paymob requires all of them, so fall back only when missing.
  const [firstName, ...rest] = (profile?.name ?? "").trim().split(/\s+/);

  try {
    const url = await createCheckoutUrl({
      amountCents: offer.amountCents,
      itemName: `Lamba ${offer.cohort} ${offer.plan}`,
      billing: {
        first_name: firstName || "Lamba",
        last_name: rest.join(" ") || "Student",
        email: user.email || "student@example.com",
        phone_number: profile?.phone || "+201000000000",
      },
      reference,
      redirectionUrl: `${appUrl}/billing/result`,
      notificationUrl: process.env.PAYMOB_WEBHOOK_URL,
    });
    return NextResponse.json({ url });
  } catch (e) {
    console.error("checkout failed", (e as Error).message);
    return NextResponse.json({ error: "مقدرناش نبدأ الدفع، جرّب تاني" }, { status: 502 });
  }
}
