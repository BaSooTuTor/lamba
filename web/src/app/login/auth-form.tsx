"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "./actions";

type Field = { name: string; label: string; type: string; autoComplete: string; dir?: "ltr" };

const FIELDS: Record<"login" | "signup", Field[]> = {
  signup: [
    { name: "name", label: "الاسم", type: "text", autoComplete: "name" },
    { name: "email", label: "الإيميل", type: "email", autoComplete: "email", dir: "ltr" },
    { name: "password", label: "الباسورد", type: "password", autoComplete: "new-password", dir: "ltr" },
    { name: "phone", label: "رقم الموبايل", type: "tel", autoComplete: "tel", dir: "ltr" },
  ],
  login: [
    { name: "email", label: "الإيميل", type: "email", autoComplete: "email", dir: "ltr" },
    { name: "password", label: "الباسورد", type: "password", autoComplete: "current-password", dir: "ltr" },
  ],
};

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "signup";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const other = mode === "login" ? "/signup" : "/login";
  const otherHref = next ? `${other}?next=${encodeURIComponent(next)}` : other;

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? "/"} />
      {FIELDS[mode].map((f) => (
        <label key={f.name} className="flex flex-col gap-1 text-sm font-semibold">
          {f.label}
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            dir={f.dir}
            required
            className="rounded-lg border border-gray-300 px-3 py-3 text-base font-normal focus:border-accent focus:outline-none"
          />
        </label>
      ))}

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.message && <p className="text-sm text-green-700">{state.message}</p>}

      <button
        disabled={pending}
        className="mt-2 rounded-lg bg-accent px-4 py-3 font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
      >
        {pending ? "لحظة…" : mode === "login" ? "دخول" : "اعمل حساب"}
      </button>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? "معندكش حساب؟ " : "عندك حساب؟ "}
        <Link href={otherHref} className="font-semibold text-accent">
          {mode === "login" ? "اعمل حساب" : "سجّل دخولك"}
        </Link>
      </p>
    </form>
  );
}
