"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  paymob_transaction_id: string;
  amount_cents: number;
  currency: string;
  plan: string;
  success: boolean;
  created_at: string;
};

export default function MockPaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/mock-payment");
    const body = (await res.json()) as { payments?: Payment[]; error?: string };
    if (!res.ok) return setError(body.error ?? "حصل خطأ");
    setPayments(body.payments ?? []);
  }

  async function pay() {
    setPaying(true);
    setError(null);
    const res = await fetch("/api/mock-payment", { method: "POST" });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) setError(body.error ?? "حصل خطأ");
    await load();
    setPaying(false);
  }

  async function payWithPaymob() {
    setPaying(true);
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" });
    const body = (await res.json()) as { url?: string; error?: string };
    if (body.url) return window.location.assign(body.url);
    setError(body.error ?? "حصل خطأ");
    setPaying(false);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main dir="rtl" className="mx-auto max-w-md p-6 font-sans">
      <h1 className="text-2xl font-bold">دفع تجريبي (Mock)</h1>
      <p className="mt-2 text-sm text-gray-500">باقة السنة كاملة · 799 ج · من غير Paymob</p>

      <button
        onClick={pay}
        disabled={paying}
        className="mt-6 w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-50"
      >
        {paying ? "جاري الدفع…" : "ادفع 799 ج"}
      </button>

      <button
        onClick={payWithPaymob}
        disabled={paying}
        className="mt-3 w-full rounded-lg border border-current px-4 py-3 disabled:opacity-50"
      >
        ادفع بـ Paymob (Sandbox)
      </button>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <h2 className="mt-8 font-semibold">سجل المدفوعات</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {payments.map((p) => (
          <li key={p.id} className="rounded border p-3">
            <div>{(p.amount_cents / 100).toFixed(2)} {p.currency} · {p.plan}</div>
            <div className="text-gray-500" dir="ltr">{p.paymob_transaction_id}</div>
          </li>
        ))}
        {payments.length === 0 && <li className="text-gray-500">مفيش مدفوعات لسه</li>}
      </ul>
    </main>
  );
}
