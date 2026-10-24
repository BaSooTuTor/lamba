import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hmacStringFromQuery, verifyHmac } from "../../../../supabase/functions/_shared/paymob-hmac";

// Paymob redirects here after checkout. The query is trusted only if its HMAC matches;
// a verified success is recorded here too, in case the webhook never arrives.
export default async function BillingResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const valid = await verifyHmac(hmacStringFromQuery(query), query.hmac ?? "", process.env.PAYMOB_HMAC_SECRET ?? "");
  const success = valid && query.success === "true";

  let recordError: string | null = null;
  if (success) {
    const plan = (query.merchant_order_id ?? "").split(":")[2] ?? "unknown";
    const { error } = await supabaseAdmin().rpc("record_payment", {
      p_transaction_id: query.id!,
      p_amount_cents: Number(query.amount_cents),
      p_plan: plan,
      p_success: true,
      p_raw: { source: "redirection", ...query },
    });
    recordError = error?.message ?? null;
  }

  return (
    <main dir="rtl" className="mx-auto max-w-md p-6 font-sans">
      {!valid ? (
        <h1 className="text-2xl font-bold text-red-600">مقدرناش نتأكد من العملية</h1>
      ) : success ? (
        <>
          <h1 className="text-2xl font-bold">تم الدفع ✓</h1>
          <p className="mt-2">اشتراكك ساري حتى 31 أغسطس 2027</p>
          <p className="mt-1 text-sm text-gray-500">
            {(Number(query.amount_cents) / 100).toFixed(2)} {query.currency} · رقم العملية{" "}
            <span dir="ltr">{query.id}</span>
          </p>
          {recordError && <p className="mt-2 text-sm text-red-600">{recordError}</p>}
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-red-600">الدفع ماتمش</h1>
          <p className="mt-2 text-sm text-gray-500">{query["data.message"]}</p>
        </>
      )}
      <Link href="/mock-payment" className="mt-6 inline-block underline">
        رجوع
      </Link>
    </main>
  );
}
