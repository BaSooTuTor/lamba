import "server-only";
import { getUser, hasAccess } from "@/lib/auth";
import { OhmContentSchema, type OhmContent } from "@/lib/lesson-content";
import { getLesson } from "@/lib/lessons";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type CardId = "predict" | "mission" | "check" | "exam";

// The signed-in user, the lesson and its full content, only if the user may open it.
// Content is read with the service role because clients cannot select lessons.content.
export async function openLesson(lessonId: string) {
  const user = await getUser();
  if (!user) return { error: "signed_out" as const };
  const lesson = await getLesson(lessonId);
  if (!lesson || lesson.status !== "live") return { error: "not_found" as const };
  if (!lesson.is_free && !(await hasAccess(user.id))) return { error: "locked" as const };

  const { data } = await supabaseAdmin().from("lessons").select("content").eq("id", lessonId).single();
  const parsed = OhmContentSchema.safeParse(data?.content);
  return { user, lesson, content: parsed.success ? (parsed.data as OhmContent) : null };
}

type AttemptRow = {
  answer?: string | null;
  is_correct?: boolean | null;
  prediction?: string | null;
  sim_state?: unknown;
  hints_used?: number;
  ai_feedback?: unknown;
};

export async function recordAttempt(userId: string, lessonId: string, cardId: CardId, row: AttemptRow) {
  const { data, error } = await supabaseAdmin()
    .from("attempts")
    .insert({ user_id: userId, lesson_id: lessonId, card_id: cardId, ...row })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

// A run starts at the student's latest prediction (card 1); attempts before it belong to
// earlier runs. Returns the start time and the prediction, or null before card 1.
export async function currentRun(userId: string, lessonId: string) {
  const { data } = await supabaseAdmin()
    .from("attempts")
    .select("created_at, prediction")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .eq("card_id", "predict")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as { created_at: string; prediction: string | null } | null;
}

export async function examAttemptsSince(userId: string, lessonId: string, since: string) {
  const { count } = await supabaseAdmin()
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .eq("card_id", "exam")
    .gte("created_at", since);
  return count ?? 0;
}

// The latest sim state the student had in this run (mission card or the inline sim).
export async function latestSimState(userId: string, lessonId: string, since: string) {
  const { data } = await supabaseAdmin()
    .from("attempts")
    .select("sim_state")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .not("sim_state", "is", null)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sim_state ?? null) as unknown;
}

// XP for a card is earned once per student, on their first correct answer ever.
export async function hasCorrectAttempt(userId: string, lessonId: string, cardId: CardId) {
  const { count } = await supabaseAdmin()
    .from("attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .eq("card_id", cardId)
    .eq("is_correct", true);
  return (count ?? 0) > 0;
}

export async function awardXp(userId: string, amount: number) {
  if (amount <= 0) return;
  const { error } = await supabaseAdmin().rpc("award_xp", { p_user_id: userId, p_amount: amount });
  if (error) throw error;
}

export async function setMastery(userId: string, lessonId: string, concept: string, mastered: boolean) {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { error } = await supabaseAdmin()
    .from("progress")
    .upsert(
      { user_id: userId, lesson_id: lessonId, concept, mastered, review_due: mastered ? null : tomorrow },
      { onConflict: "user_id,lesson_id,concept" },
    );
  if (error) throw error;
}
