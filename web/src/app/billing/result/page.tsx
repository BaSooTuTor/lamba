import Link from "next/link";
import { getUser } from "@/lib/auth";
import { COHORTS, formatArabicDate } from "@/lib/cohorts";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hmacStringFromQuery, verifyHmac } from "../../../../supabase/functions/_shared/paymob-hmac";
import { MISSING_HMAC_SECRET, parseReference } from "../../../../supabase/functions/_shared/paymob-reference";

// Paymob redirects here after checkout. The query is trusted only if its HMAC matches;
// a verified success is recorded here too, in case the webhook never arrives.
export default async function BillingResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-red-600">مقدرناش نتأكد من العملية</h1>
        <p className="mt-2 text-sm text-gray-500">{MISSING_HMAC_SECRET}</p>
      </main>
    );
  }

  const valid = await verifyHmac(hmacStringFromQuery(query), query.hmac ?? "", secret);
  const success = valid && query.success === "true";
  const { userId, cohort, plan } = parseReference(query.merchant_order_id);
  const accessEnd = COHORTS[cohort as keyof typeof COHORTS]?.accessEnd;

  // merchant_order_id is not covered by the HMAC, so the fallback only records a payment
  // for the user who is signed in here; otherwise the webhook stays the only writer.
  const user = await getUser();
  let recordError: string | null = null;
  if (success && userId && user?.id === userId) {
    const { error } = await supabaseAdmin().rpc("record_payment", {
      p_transaction_id: query.id!,
      p_amount_cents: Number(query.amount_cents),
      p_plan: plan,
      p_success: true,
      p_raw: { source: "redirection", ...query },
      p_user_id: userId,
      p_cohort: cohort,
    });
    if (error) {
      console.error("record_payment failed", error.message);
      recordError = "الدفع نجح بس لسه بنفعّل الباقة. لو الدروس مافتحتش خلال دقيقة كلّمنا.";
    }
  }

  return (
    <main className="p-6">
      {!valid ? (
        <h1 className="text-2xl font-bold text-red-600">مقدرناش نتأكد من العملية</h1>
      ) : success ? (
        <>
          <h1 className="text-2xl font-bold">تم الاشتراك، واللمبة نوّرت</h1>
          {accessEnd && <p className="mt-2">باقتك سارية حتى {formatArabicDate(accessEnd)}. كل الدروس اتفتحت.</p>}
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
      <div className="mt-6 flex flex-col gap-3">
        <Link href="/" className="rounded-lg bg-accent px-4 py-3 text-center font-semibold text-white">
          {success ? "كمّل الدروس" : "رجوع للدروس"}
        </Link>
        <Link href="/billing" className="text-center text-accent underline">
          تفاصيل اشتراكي
        </Link>
      </div>
    </main>
  );
}
