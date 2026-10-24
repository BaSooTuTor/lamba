"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// `values` refills the form after a failed submit (React resets it); never includes the password.
export type AuthState = { error?: string; message?: string; values?: Record<string, string> };

// Only same-site paths, so ?next= cannot send the user to another site
// (browsers read "/\evil.com" as "//evil.com", so backslashes are rejected too).
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  const unsafe = next.startsWith("//") || next.includes("\\") || [...next].some((c) => c.charCodeAt(0) < 0x20);
  return next.startsWith("/") && !unsafe ? next : "/";
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  const values = { name, email, phone };
  if (!name || !email || !phone) return { error: "كمّل كل البيانات", values };
  if (password.length < 6) return { error: "الباسورد لازم يبقى 6 حروف على الأقل", values };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // The on_auth_user_created trigger copies these into profiles.
    options: { data: { name, phone } },
  });
  if (error) return { error: authError(error.code, error.message), values };
  // Email confirmation is on in the project: there is no session until the link is clicked.
  if (!data.session) return { message: "بعتنالك إيميل تأكيد. افتح اللينك وبعدين سجّل دخولك." };

  redirect(safeNext(formData.get("next")));
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: authError(error.code, error.message), values: { email } };

  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function authError(code: string | undefined, message: string) {
  switch (code) {
    case "invalid_credentials":
      return "الإيميل أو الباسورد غلط";
    case "user_already_exists":
    case "email_exists":
      return "الإيميل ده عنده حساب. سجّل دخولك.";
    case "email_not_confirmed":
      return "أكّد إيميلك الأول من اللينك اللي بعتناهولك";
    case "email_address_invalid":
      return "الإيميل ده مش صالح، جرّب إيميل تاني";
    case "weak_password":
      return "الباسورد ضعيف، جرّب واحد أطول";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "محاولات كتير، استنى شوية وجرّب تاني";
  }
  console.error("auth error", code, message);
  return "حصل خطأ، جرّب تاني";
}
