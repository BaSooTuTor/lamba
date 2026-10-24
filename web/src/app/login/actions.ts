"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { examYear, ONBOARDING_COOKIE, parseAnswers } from "@/lib/onboarding";
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

  // Onboarding answers (wireframes 0.2–0.5) go into the new profile; RLS allows updating your own row.
  const cookieStore = await cookies();
  const answers = parseAnswers(cookieStore.get(ONBOARDING_COOKIE)?.value);
  if (answers && data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        education_system: answers.system,
        grade: answers.grade,
        track: answers.track === "literary" ? null : answers.track,
        exam_cohort: String(examYear(answers.grade)),
        payer: answers.payer,
        parent_name: answers.parentName ?? null,
        parent_phone: answers.parentPhone ?? null,
      })
      .eq("id", data.user.id);
    if (profileError) console.error("onboarding profile update failed", profileError.message);

    if (answers.subjects.length > 0) {
      const { error: interestsError } = await supabase
        .from("interests")
        .insert(answers.subjects.map((subject) => ({ user_id: data.user!.id, subject })));
      if (interestsError) console.error("onboarding interests insert failed", interestsError.message);
    }
    cookieStore.delete(ONBOARDING_COOKIE);
  }

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
