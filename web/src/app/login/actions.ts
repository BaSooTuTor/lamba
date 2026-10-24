"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

// Only same-site paths, so ?next= cannot send the user to another site.
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signup(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name || !email || !phone) return { error: "كمّل كل البيانات" };
  if (password.length < 6) return { error: "الباسورد لازم يبقى 6 حروف على الأقل" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // The on_auth_user_created trigger copies these into profiles.
    options: { data: { name, phone } },
  });
  if (error) return { error: authError(error.message) };
  // Email confirmation is on in the project: there is no session until the link is clicked.
  if (!data.session) return { message: "بعتنالك إيميل تأكيد. افتح اللينك وبعدين سجّل دخولك." };

  redirect(safeNext(formData.get("next")));
}

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: authError(error.message) };

  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function authError(message: string) {
  if (/invalid login credentials/i.test(message)) return "الإيميل أو الباسورد غلط";
  if (/already registered/i.test(message)) return "الإيميل ده عنده حساب. سجّل دخولك.";
  if (/email not confirmed/i.test(message)) return "أكّد إيميلك الأول من اللينك اللي بعتناهولك";
  return "حصل خطأ، جرّب تاني";
}
