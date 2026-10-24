"use server";

import { gradeCheck, gradeExam } from "@/lib/lesson-grading";
import {
  awardXp,
  currentRun,
  examAttemptsSince,
  hasCorrectAttempt,
  latestSimState,
  openLesson,
  recordAttempt,
  setMastery,
} from "@/lib/lesson-run";
import { PhysicsError, missionMet, validateSimState } from "@/lib/physics/ohm";

type Fail = { ok: false; error: string };

async function open(lessonId: string) {
  const opened = await openLesson(lessonId);
  if ("error" in opened || !opened.content) return null;
  return opened as typeof opened & { content: NonNullable<typeof opened.content> };
}

const failed = (error: string): Fail => ({ ok: false, error });

// Card 1: ungraded prediction. Starts a new run of the lesson.
export async function savePrediction(lessonId: string, prediction: string) {
  const lesson = await open(lessonId);
  if (!lesson) return failed("الدرس مش متاح.");
  if (!lesson.content.predict.options.some((o) => o.id === prediction)) return failed("اختار توقّع.");
  await recordAttempt(lesson.user.id, lessonId, "predict", { answer: prediction, prediction });
  return { ok: true as const };
}

// Card 2: the server recomputes the current from the sliders and checks the mission.
export async function completeMission(lessonId: string, sim: { voltage: number; resistance: number }) {
  const lesson = await open(lessonId);
  if (!lesson) return failed("الدرس مش متاح.");
  const run = await currentRun(lesson.user.id, lessonId);
  try {
    const state = validateSimState(sim);
    const { target, tolerance } = lesson.content.mission;
    const met = missionMet(state.current, target, tolerance);
    await recordAttempt(lesson.user.id, lessonId, "mission", {
      is_correct: met,
      sim_state: state,
      prediction: run?.prediction ?? null,
    });
    return met ? { ok: true as const } : failed("التيار لسه مش 2 أمبير.");
  } catch (error) {
    if (error instanceof PhysicsError) return failed("قيم المحاكاة مش مظبوطة.");
    throw error;
  }
}

// Card 4: concept check. XP once per student, on their first correct answer.
export async function answerCheck(lessonId: string, answer: string) {
  const lesson = await open(lessonId);
  if (!lesson) return failed("الدرس مش متاح.");
  const { check } = lesson.content;
  if (!check.options.some((o) => o.id === answer)) return failed("اختار إجابة.");

  const earnedBefore = await hasCorrectAttempt(lesson.user.id, lessonId, "check");
  const result = gradeCheck(check, answer);
  const run = await currentRun(lesson.user.id, lessonId);
  await recordAttempt(lesson.user.id, lessonId, "check", {
    answer,
    is_correct: result.correct,
    prediction: run?.prediction ?? null,
  });
  const xp = earnedBefore ? 0 : result.xp;
  await awardXp(lesson.user.id, xp);
  return {
    ok: true as const,
    correct: result.correct,
    xp,
    title: result.correct ? check.right_title : check.wrong_title,
    body: result.correct ? check.right_body : check.wrong_body,
  };
}

// Card 5: exam question, two attempts per run. The attempt number comes from the
// database, so the client cannot skip ahead to the solution or replay the first try.
export async function answerExam(lessonId: string, answer: string) {
  const lesson = await open(lessonId);
  if (!lesson) return failed("الدرس مش متاح.");
  const { exam, concept } = lesson.content;
  if (!exam.options.some((o) => o.id === answer)) return failed("اختار إجابة.");

  const userId = lesson.user.id;
  const run = await currentRun(userId, lessonId);
  if (!run) return failed("ابدأ الدرس من الأول.");
  const attempt = (await examAttemptsSince(userId, lessonId, run.created_at)) + 1;
  if (attempt > exam.max_attempts) return failed("خلصت المحاولات.");

  const earnedBefore = await hasCorrectAttempt(userId, lessonId, "exam");
  const result = gradeExam(exam, answer, attempt);
  const attemptId = await recordAttempt(userId, lessonId, "exam", {
    answer,
    is_correct: result.correct,
    prediction: run.prediction,
    sim_state: await latestSimState(userId, lessonId, run.created_at),
    hints_used: attempt - 1,
  });
  const xp = earnedBefore ? 0 : result.xp;
  await awardXp(userId, xp);
  if (result.finished) await setMastery(userId, lessonId, concept, result.mastered);

  return {
    ok: true as const,
    attemptId,
    attempt,
    correct: result.correct,
    finished: result.finished,
    mastered: result.mastered,
    xp,
    solution: result.solution,
    title: result.correct ? exam.right_title : null,
    body: result.correct ? exam.right_body : null,
  };
}
