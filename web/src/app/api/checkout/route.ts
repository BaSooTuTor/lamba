import { NextResponse, type NextRequest } from "next/server";
import { CURRENT_PLAN, createCheckoutUrl } from "@/lib/paymob";

// Creates a Paymob payment intention and returns the Unified Checkout URL.
export async function POST(req: NextRequest) {
  const appUrl = process.env.APP_URL ?? req.nextUrl.origin;
  // No auth yet, so there is no user id in the reference.
  const reference = `anon:${CURRENT_PLAN.cohort}:${CURRENT_PLAN.plan}:${Date.now()}`;

  try {
    const url = await createCheckoutUrl({
      reference,
      redirectionUrl: `${appUrl}/billing/result`,
      notificationUrl: process.env.PAYMOB_WEBHOOK_URL,
    });
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
