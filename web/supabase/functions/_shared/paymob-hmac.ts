// Paymob transaction HMAC (HMAC-SHA512 over these fields, in this order).
// Plain TypeScript + Web Crypto so both Next.js (Workers/Node) and Edge Functions (Deno) can import it.
const FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

// Redirection callback: the fields arrive as flat query params ("order", "source_data.pan", ...).
export function hmacStringFromQuery(query: Record<string, string | undefined>): string {
  return FIELDS.map((f) => query[f] ?? "").join("");
}

// Webhook callback: the fields are nested inside the transaction object (`obj`).
// deno-lint-ignore no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hmacStringFromTransaction(obj: any): string {
  return FIELDS.map((f) => {
    const value =
      f === "order" ? obj.order?.id
      : f.startsWith("source_data.") ? obj.source_data?.[f.slice("source_data.".length)]
      : obj[f];
    return value === undefined || value === null ? "" : String(value);
  }).join("");
}

export async function verifyHmac(data: string, hmac: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  const expected = Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");

  const given = hmac.toLowerCase();
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}
