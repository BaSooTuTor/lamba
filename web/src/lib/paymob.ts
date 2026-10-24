import "server-only";

// Paymob Egypt (test or live is decided by the keys).
const INTENTION_URL = "https://accept.paymob.com/v1/intention/";
const CHECKOUT_URL = "https://eg.checkout.paymob.com/";

// MVP: one plan, priced by the server (see PRD pricing windows).
export const CURRENT_PLAN = { cohort: "2027", plan: "full_year", amount_cents: 79900 };

type IntentionInput = {
  reference: string;
  redirectionUrl: string;
  notificationUrl?: string;
};

export async function createCheckoutUrl({ reference, redirectionUrl, notificationUrl }: IntentionInput) {
  const res = await fetch(INTENTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${env("PAYMOB_SECRET_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: CURRENT_PLAN.amount_cents,
      currency: "EGP",
      payment_methods: [Number(env("PAYMOB_CARD_INTEGRATION_ID"))],
      items: [{ name: `Lamba ${CURRENT_PLAN.cohort} ${CURRENT_PLAN.plan}`, amount: CURRENT_PLAN.amount_cents, quantity: 1 }],
      // No real student data yet; Paymob requires billing fields.
      billing_data: {
        first_name: "Lamba",
        last_name: "Student",
        email: "student@example.com",
        phone_number: "+201000000000",
      },
      special_reference: reference,
      redirection_url: redirectionUrl,
      ...(notificationUrl && { notification_url: notificationUrl }),
    }),
  });

  const body = (await res.json()) as { client_secret?: string; detail?: unknown };
  if (!res.ok || !body.client_secret) {
    throw new Error(`Paymob intention failed (${res.status}): ${JSON.stringify(body.detail ?? body)}`);
  }

  const url = new URL(CHECKOUT_URL);
  url.searchParams.set("publicKey", env("PAYMOB_PUBLIC_KEY"));
  url.searchParams.set("clientSecret", body.client_secret);
  return url.toString();
}

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
