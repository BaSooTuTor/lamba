import { z } from "zod";

// Pure grading rules for the lesson cards. Mastery follows the PRD: a concept counts as
// mastered only when answered correctly before the worked solution is shown.

export function gradeCheck(check: { correct: string; xp: number }, answer: string) {
  const correct = answer === check.correct;
  return { correct, xp: correct ? check.xp : 0 };
}

type Exam<S> = {
  correct: string;
  max_attempts: number;
  xp_first_try: number;
  xp_second_try: number;
  solution: S;
};

export function gradeExam<S>(exam: Exam<S>, answer: string, attempt: number) {
  if (!Number.isInteger(attempt) || attempt < 1 || attempt > exam.max_attempts) {
    throw new Error(`attempt must be 1–${exam.max_attempts}`);
  }
  const correct = answer === exam.correct;
  const last = attempt === exam.max_attempts;
  return {
    correct,
    xp: correct ? (attempt === 1 ? exam.xp_first_try : exam.xp_second_try) : 0,
    finished: correct || last,
    mastered: correct,
    solution: !correct && last ? exam.solution : null,
  };
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// True when the text states the final answer, e.g. "2 A", "2 أمبير" or "= 2".
export function revealsAnswer(text: string, answer: string) {
  // Arabic-Indic digits (٠–٩) and decimal separator count as the same number.
  const normalized = text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/٫/g, ".");
  const n = `(?<![\\d.])${escape(answer)}(?![\\d.])`;
  return new RegExp(`${n}\\s*(A\\b|أمبير|امبير)|=\\s*${n}`).test(normalized);
}

const MAX_LINE = 140;
const line = z
  .string()
  .trim()
  .min(1)
  .max(MAX_LINE)
  .refine((s) => !/[\r\n]/.test(s));

export const TutorFeedbackSchema = z.object({ diagnosis: line, hint: line, try_in_sim: line });

// The model's JSON is untrusted: it must be three short single lines and never give the answer.
export function validateTutorFeedback(value: unknown, answer: string) {
  const parsed = TutorFeedbackSchema.safeParse(value);
  if (!parsed.success) return null;
  const f = parsed.data;
  if ([f.diagnosis, f.hint, f.try_in_sim].some((s) => revealsAnswer(s, answer))) return null;
  return f;
}
