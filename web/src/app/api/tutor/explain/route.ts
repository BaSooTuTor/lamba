import { NextResponse, type NextRequest } from "next/server";
import { openLesson } from "@/lib/lesson-run";
import { PhysicsError, validateSimState, type SimState } from "@/lib/physics/ohm";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { explainMistake } from "@/lib/tutor";

// Explains a wrong exam answer (card 5). Signed-in only, and only for the student's own
// wrong attempt; the question, options and correct answer come from the database, not
// the client. One AI call per attempt: a repeat returns the stored feedback.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    lessonId?: unknown;
    attemptId?: unknown;
    sim?: { voltage?: unknown; resistance?: unknown };
  } | null;
  if (typeof body?.lessonId !== "string" || typeof body.attemptId !== "string") {
    return NextResponse.json({ error: "طلب مش مظبوط" }, { status: 400 });
  }

  const opened = await openLesson(body.lessonId);
  if ("error" in opened) {
    const status = opened.error === "signed_out" ? 401 : opened.error === "locked" ? 403 : 404;
    return NextResponse.json({ error: "سجّل دخولك الأول" }, { status });
  }
  if (!opened.content) return NextResponse.json({ error: "الدرس مش متاح" }, { status: 404 });

  const admin = supabaseAdmin();
  const { data: attempt } = await admin
    .from("attempts")
    .select("id, answer, is_correct, prediction, sim_state, ai_feedback")
    .eq("id", body.attemptId)
    .eq("user_id", opened.user.id)
    .eq("lesson_id", body.lessonId)
    .eq("card_id", "exam")
    .maybeSingle();
  if (!attempt || attempt.is_correct !== false) {
    return NextResponse.json({ error: "مفيش محاولة غلط" }, { status: 404 });
  }
  if (attempt.ai_feedback) return NextResponse.json(attempt.ai_feedback);

  let sim: SimState | null = null;
  try {
    const raw = body.sim ?? (attempt.sim_state as { voltage?: unknown; resistance?: unknown } | null);
    if (raw) sim = validateSimState({ voltage: raw.voltage, resistance: raw.resistance });
  } catch (error) {
    if (!(error instanceof PhysicsError)) throw error;
  }

  const { exam, predict } = opened.content;
  const fallback = exam.fallbacks[attempt.answer ?? ""] ?? exam.fallbacks["72"];
  const prediction = predict.options.find((o) => o.id === attempt.prediction)?.label ?? null;
  const { feedback, source } = await explainMistake(
    { question: exam.question, options: exam.options, chosen: attempt.answer ?? "", correct: exam.correct, prediction, sim },
    fallback,
  );

  const result = { ...feedback, source, sim: sim && { voltage: sim.voltage, resistance: sim.resistance } };
  await admin.from("attempts").update({ ai_feedback: result }).eq("id", attempt.id);
  return NextResponse.json(result);
}
