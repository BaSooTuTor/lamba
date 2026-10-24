import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  exam_cohort: string;
};

// The signed-in user (verified with Supabase Auth), or null.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, phone, exam_cohort")
    .eq("id", userId)
    .maybeSingle<Profile>();
  return data;
});

// True when the user has an active pass that has not ended yet.
export const hasAccess = cache(async (userId: string) => {
  const supabase = await createClient();
  const { count } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "active")
    .gte("current_period_end", new Date().toISOString());
  return (count ?? 0) > 0;
});
