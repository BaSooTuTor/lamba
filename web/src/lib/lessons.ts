import "server-only";
import { createClient } from "@/lib/supabase/server";

// Lesson metadata only; `content` is not readable by clients (see the foundation migration).
export type LessonMeta = {
  id: string;
  subject: string;
  chapter: string;
  order: number;
  title: string;
  is_free: boolean;
};

const COLUMNS = 'id, subject, chapter, "order", title, is_free';

export async function listLessons() {
  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select(COLUMNS).order("order").returns<LessonMeta[]>();
  return data ?? [];
}

export async function getLesson(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("lessons").select(COLUMNS).eq("id", id).maybeSingle<LessonMeta>();
  return data;
}
