"use server";

import { createClient } from "@/lib/supabase/server";
import { SYSTEMS } from "@/lib/onboarding";

export type WaitlistState = { ok?: boolean; error?: string };

// Wireframe 0.6: anyone can join the waitlist (RLS allows insert only).
export async function joinWaitlist(_: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const contact = String(formData.get("contact") ?? "").trim().slice(0, 120);
  const system = String(formData.get("system") ?? "");
  if (contact.length < 5) return { error: "اكتب رقم موبايل أو إيميل صحيح" };
  const known = SYSTEMS.some((s) => s.id === system) || system === "thanaweya_amma_literary";
  if (!known) return { error: "حصل خطأ، جرّب تاني" };

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({ contact, education_system: system });
  if (error) {
    console.error("waitlist insert failed", error.message);
    return { error: "حصل خطأ، جرّب تاني" };
  }
  return { ok: true };
}
