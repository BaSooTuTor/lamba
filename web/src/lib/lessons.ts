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
  streams: string[];
  lab_type: string | null;
  status: "live" | "coming_soon";
};

export type Subject = "physics" | "chemistry" | "biology" | "mathematics";

// Order and Arabic names of the four subjects (docs/labs-handover-v2.md, section 10).
export const SUBJECTS: { id: Subject; name: string }[] = [
  { id: "physics", name: "فيزياء" },
  { id: "chemistry", name: "كيمياء" },
  { id: "biology", name: "أحياء" },
  { id: "mathematics", name: "رياضيات" },
];

const COLUMNS = 'id, subject, chapter, "order", title, is_free, streams, lab_type, status';

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
