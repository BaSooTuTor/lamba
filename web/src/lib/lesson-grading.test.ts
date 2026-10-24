import { test } from "node:test";
import assert from "node:assert/strict";
import { gradeCheck, gradeExam, revealsAnswer, validateTutorFeedback } from "./lesson-grading";

const exam = {
  correct: "2",
  max_attempts: 2,
  xp_first_try: 30,
  xp_second_try: 15,
  solution: [{ label: "النتيجة", math: "I = 2 A" }],
};

test("check: correct answer earns its XP, a wrong one earns none", () => {
  const check = { correct: "down", xp: 10 };
  assert.deepEqual(gradeCheck(check, "down"), { correct: true, xp: 10 });
  assert.deepEqual(gradeCheck(check, "up"), { correct: false, xp: 0 });
});

test("exam: right on the first try is mastered with full XP", () => {
  assert.deepEqual(gradeExam(exam, "2", 1), {
    correct: true,
    xp: 30,
    finished: true,
    mastered: true,
    solution: null,
  });
});

test("exam: wrong on the first try keeps going, no solution yet", () => {
  assert.deepEqual(gradeExam(exam, "72", 1), {
    correct: false,
    xp: 0,
    finished: false,
    mastered: false,
    solution: null,
  });
});

test("exam: right on the second try is still mastered, with less XP", () => {
  const result = gradeExam(exam, "2", 2);
  assert.equal(result.mastered, true);
  assert.equal(result.xp, 15);
});

test("exam: wrong twice shows the solution and needs review", () => {
  const result = gradeExam(exam, "0.5", 2);
  assert.equal(result.finished, true);
  assert.equal(result.mastered, false);
  assert.deepEqual(result.solution, exam.solution);
});

test("exam: attempts past the limit are rejected", () => {
  assert.throws(() => gradeExam(exam, "2", 3));
  assert.throws(() => gradeExam(exam, "2", 0));
});

test("tutor text that states the answer is caught", () => {
  assert.equal(revealsAnswer("التيار = 2 A", "2"), true);
  assert.equal(revealsAnswer("الإجابة 2 أمبير", "2"), true);
  assert.equal(revealsAnswer("I = 12 / 6 = 2", "2"), true);
  assert.equal(revealsAnswer("التيار ٢ أمبير", "2"), true);
  assert.equal(revealsAnswer("افتح المحاكاة بأرقام السؤال (12 فولت و 6 أوم)", "2"), false);
  assert.equal(revealsAnswer("إنت ضربت الجهد في المقاومة فطلعت 72 A", "2"), false);
});

test("tutor feedback must be three short single lines without the answer", () => {
  const ok = { diagnosis: "إنت ضربت بدل ما تقسم.", hint: "المقاومة مكانها في المقام.", try_in_sim: "جرّب 12 فولت و 6 أوم." };
  assert.deepEqual(validateTutorFeedback(ok, "2"), ok);
  assert.equal(validateTutorFeedback({ ...ok, hint: "الإجابة 2 A" }, "2"), null);
  assert.equal(validateTutorFeedback({ ...ok, diagnosis: "سطر\nسطر تاني" }, "2"), null);
  assert.equal(validateTutorFeedback({ ...ok, hint: "ك".repeat(200) }, "2"), null);
  assert.equal(validateTutorFeedback({ diagnosis: "x" }, "2"), null);
});
