import { z } from "zod";

// Shape of lessons.content for the Ohm's law showcase (migration 20261024190000).
const option = z.object({ id: z.string(), label: z.string() });
const preset = z.object({ voltage: z.number(), resistance: z.number() });
const feedback = z.object({ diagnosis: z.string(), hint: z.string(), try_in_sim: z.string() });

export const OhmContentSchema = z.object({
  version: z.literal(1),
  concept: z.string(),
  next_lesson_id: z.string().nullable(),
  predict: z.object({
    kicker: z.string(),
    intro: z.string(),
    question: z.string(),
    note: z.string(),
    options: z.array(option),
    expected: z.string(),
    cta: z.string(),
  }),
  mission: z.object({
    kicker: z.string(),
    title: z.string(),
    body: z.string(),
    target: z.number(),
    tolerance: z.number(),
    start: preset,
    done: z.string(),
    pending: z.string(),
    prediction_hint: z.string(),
    cta: z.string(),
  }),
  explain: z.object({
    right_title: z.string(),
    right_body: z.string(),
    wrong_title: z.string(),
    wrong_body: z.string(),
    law_kicker: z.string(),
    law_words: z.string(),
    relations: z.array(z.object({ title: z.string(), body: z.string() })),
    cta: z.string(),
  }),
  check: z.object({
    kicker: z.string(),
    question: z.string(),
    options: z.array(option),
    correct: z.string(),
    xp: z.number(),
    right_title: z.string(),
    right_body: z.string(),
    wrong_title: z.string(),
    wrong_body: z.string(),
    cta: z.string(),
  }),
  exam: z.object({
    kicker: z.string(),
    question: z.string(),
    options: z.array(option),
    correct: z.string(),
    max_attempts: z.number(),
    xp_first_try: z.number(),
    xp_second_try: z.number(),
    preset,
    wrong_note: z.string(),
    retry_note: z.string(),
    right_title: z.string(),
    right_body: z.string(),
    fallbacks: z.record(z.string(), feedback),
    solution: z.array(z.object({ label: z.string(), math: z.string() })),
  }),
  recap: z.object({
    title: z.string(),
    check_concept: z.string(),
    exam_concept: z.string(),
    summary_kicker: z.string(),
    lines: z.array(z.string()),
    review_note: z.string(),
    back: z.string(),
  }),
});

export type OhmContent = z.infer<typeof OhmContentSchema>;
export type TutorFeedback = z.infer<typeof feedback>;

// What the browser gets: everything except graded answers, feedback for graded answers,
// tutor fallbacks and the worked solution. The server returns those after each answer.
export function toClientContent(content: OhmContent) {
  const { check, exam } = content;
  return {
    ...content,
    check: { kicker: check.kicker, question: check.question, options: check.options, cta: check.cta },
    exam: {
      kicker: exam.kicker,
      question: exam.question,
      options: exam.options,
      max_attempts: exam.max_attempts,
      preset: exam.preset,
      wrong_note: exam.wrong_note,
      retry_note: exam.retry_note,
    },
  };
}

export type ClientOhmContent = ReturnType<typeof toClientContent>;
