import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { formatArabicDate, planLabel } from "@/lib/cohorts";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../login/actions";

type Subscription = { cohort: string; plan: string; status: string; current_period_end: string };
type Payment = { id: string; amount_cents: number; currency: string; success: boolean; created_at: string };

export default async function BillingPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=/billing");

  // RLS: both tables return only this user's rows.
  const supabase = await createClient();
  const [{ data: subs }, { data: payments }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("cohort, plan, status, current_period_end")
      .order("current_period_end", { ascending: false })
      .returns<Subscription[]>(),
    supabase
      .from("payments")
      .select("id, amount_cents, currency, success, created_at")
      .order("created_at", { ascending: false })
      .returns<Payment[]>(),
  ]);
  const sub = subs?.find((s) => s.status === "active" && new Date(s.current_period_end) >= new Date());

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">اشتراكي</h1>

      {sub ? (
        <section className="mt-4 rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold">باقة الثانوية العامة {sub.cohort}</p>
          <p className="text-sm text-gray-500">{planLabel(sub.cohort, sub.plan)} · دفعة واحدة</p>
          <p className="mt-3 inline-block rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
            سارية
          </p>
          <p className="mt-2">ساري حتى {formatArabicDate(sub.current_period_end)}</p>
          <p className="text-sm text-gray-500">الدور التاني داخل في الباقة</p>
        </section>
      ) : (
        <section className="mt-4 rounded-2xl border border-dashed border-gray-300 p-5">
          <p>معندكش باقة سارية لسه.</p>
          <Link href="/paywall" className="mt-2 inline-block font-semibold text-accent">
            شوف الباقة
          </Link>
        </section>
      )}

      <h2 className="mt-8 font-semibold">سجل المدفوعات</h2>
      <ul className="mt-2 divide-y divide-gray-100 text-sm">
        {(payments ?? []).map((p) => (
          <li key={p.id} className="flex justify-between py-3">
            <span>{formatArabicDate(p.created_at)}</span>
            <span>
              {p.amount_cents / 100} {p.currency === "EGP" ? "ج" : p.currency}
            </span>
            <span className={p.success ? "text-green-700" : "text-red-600"}>{p.success ? "ناجحة" : "فشلت"}</span>
          </li>
        ))}
        {!payments?.length && <li className="py-3 text-gray-500">مفيش مدفوعات لسه</li>}
      </ul>

      <form action={logout} className="mt-10">
        <button className="text-sm text-gray-500 underline">تسجيل الخروج</button>
      </form>
    </main>
  );
}
