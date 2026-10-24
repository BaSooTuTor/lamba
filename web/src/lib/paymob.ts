import "server-only";

// Paymob Egypt (test or live is decided by the keys).
const INTENTION_URL = "https://accept.paymob.com/v1/intention/";
const CHECKOUT_URL = "https://eg.checkout.paymob.com/";

type BillingData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

type IntentionInput = {
  // Priced by the server from getOffer(), never by the client.
  amountCents: number;
  itemName: string;
  billing: BillingData;
  reference: string;
  redirectionUrl: string;
  notificationUrl?: string;
};

export async function createCheckoutUrl({
  amountCents,
  itemName,
  billing,
  reference,
  redirectionUrl,
  notificationUrl,
}: IntentionInput) {
  const res = await fetch(INTENTION_URL, {
    method: "POST",
    headers: {
      Authorization: `Token ${env("PAYMOB_SECRET_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountCents,
      currency: "EGP",
      payment_methods: [Number(env("PAYMOB_CARD_INTEGRATION_ID"))],
      items: [{ name: itemName, amount: amountCents, quantity: 1 }],
      billing_data: billing,
      special_reference: reference,
      redirection_url: redirectionUrl,
      ...(notificationUrl && { notification_url: notificationUrl }),
    }),
  });

  const body = (await res.json()) as {
    client_secret?: string;
    id?: string;
    // Paymob's order id for this intention; the webhook and redirect carry it under the HMAC.
    intention_order_id?: number | string;
    detail?: unknown;
  };
  if (!res.ok || !body.client_secret) {
    throw new Error(`Paymob intention failed (${res.status}): ${JSON.stringify(body.detail ?? body)}`);
  }

  const url = new URL(CHECKOUT_URL);
  url.searchParams.set("publicKey", env("PAYMOB_PUBLIC_KEY"));
  url.searchParams.set("clientSecret", body.client_secret);
  return {
    url: url.toString(),
    orderId: body.intention_order_id != null ? String(body.intention_order_id) : null,
    intentionId: body.id ?? null,
  };
}

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}
