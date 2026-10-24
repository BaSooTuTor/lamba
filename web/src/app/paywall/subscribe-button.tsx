"use client";

import { useState } from "react";

// Starts Paymob checkout. The server decides the plan and price.
export function SubscribeButton({ priceEgp }: { priceEgp: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function subscribe() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/checkout", { method: "POST" });
    if (res.status === 401) return window.location.assign("/signup?next=/paywall");
    const body = (await res.json()) as { url?: string; error?: string };
    if (body.url) return window.location.assign(body.url);
    setError(body.error ?? "حصل خطأ، جرّب تاني");
    setPending(false);
  }

  return (
    <>
      <button
        onClick={subscribe}
        disabled={pending}
        className="w-full rounded-lg bg-accent px-4 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {pending ? "بنجهّز الدفع…" : `اشترك بـ ${priceEgp} ج`}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
