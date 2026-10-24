"use client";

import Link from "next/link";
import { useState } from "react";
import type { OhmContent, TutorFeedback } from "@/lib/lesson-content";
import { gradeCheck, gradeExam } from "@/lib/lesson-grading";
import { current, missionMet } from "@/lib/physics/ohm";
import { CircuitSim } from "./circuit-sim";

type Sim = { voltage: number; resistance: number };
type Props = { content: OhmContent; nextLesson: { id: string; title: string } | null };

const btnPrimary =
  "flex h-[52px] w-full items-center justify-center rounded-xl bg-accent text-base font-bold text-white disabled:opacity-40";
const btnSecondary =
  "flex h-[52px] w-full items-center justify-center rounded-xl border-[1.5px] border-[#C9CDD3] text-[15px] font-semibold text-[#1F2328]";
const optionBase = "h-14 w-full rounded-xl px-4 text-right text-base text-[#1F2328]";
const optionOff = `${optionBase} border-[1.5px] border-[#C9CDD3] bg-white`;
const optionOn = `${optionBase} border-2 border-accent bg-[#EEF2FD] font-bold`;
const optionRight = `${optionBase} border-2 border-[#0F7B6C] bg-[#E6F4F1] font-bold`;
const optionWrong = `${optionBase} border-2 border-[#B42318] bg-[#FDECEA] font-bold`;

// The 6-card lesson loop: predict → mission → explain → check → exam (+ tutor) → recap.
// Numbers always come from the physics engine; the tutor uses prewritten feedback.
export function OhmLesson({ content: c, nextLesson }: Props) {
  const [step, setStep] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [sim, setSim] = useState<Sim>(c.mission.start);
  const [missionSim, setMissionSim] = useState<Sim | null>(null);
  const [checkPick, setCheckPick] = useState<string | null>(null);
  const [checkFirstTry, setCheckFirstTry] = useState<boolean | null>(null);
  const [xp, setXp] = useState(0);

  const [examPicks, setExamPicks] = useState<string[]>([]);
  const [examResult, setExamResult] = useState<ReturnType<typeof gradeExam<OhmContent["exam"]["solution"]>> | null>(null);
  const [tutor, setTutor] = useState<TutorFeedback | null>(null);
  const [examSim, setExamSim] = useState<Sim | null>(null);

  const next = () => setStep((s) => s + 1);
  const predictionLabel = c.predict.options.find((o) => o.id === prediction)?.label;
  const simCurrent = current(sim.voltage, sim.resistance);
  const met = missionMet(simCurrent, c.mission.target, c.mission.tolerance);

  const checkResult = checkPick ? gradeCheck(c.check, checkPick) : null;

  function pickCheck(id: string) {
    const result = gradeCheck(c.check, id);
    if (checkFirstTry === null) {
      setCheckFirstTry(result.correct);
      setXp((x) => x + result.xp);
    }
    setCheckPick(id);
  }

  function pickExam(id: string) {
    if (examResult?.finished || examPicks.includes(id)) return;
    const attempt = examPicks.length + 1;
    const result = gradeExam(c.exam, id, attempt);
    setExamPicks([...examPicks, id]);
    setExamResult(result);
    setXp((x) => x + result.xp);
    setExamSim(null);
    setTutor(result.correct || result.finished ? null : (c.exam.fallbacks[id] ?? c.exam.fallbacks["72"]));
  }

  // "جاوب تاني": clear the wrong pick so the student can choose again.
  function retryExam() {
    setExamResult(null);
  }

  const lastExamPick = examPicks[examPicks.length - 1];

  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col gap-5 px-6 pb-8 pt-4 text-[#1F2328]">
      <div className="flex items-center gap-3">
        <Link href="/" aria-label="إغلاق الدرس" className="flex h-11 w-11 items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <div className="grid flex-grow grid-cols-6 gap-1">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`h-1.5 rounded-full ${i <= step ? "bg-accent" : "bg-[#E3E5E9]"}`} />
          ))}
        </div>
        <div className="text-xs text-[#5B616B]">{step + 1} / 6</div>
      </div>

      {step === 0 && (
        <>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-[#5B616B]">{c.predict.kicker}</div>
            <p className="text-[15px] leading-7">{c.predict.intro}</p>
          </div>
          <h1 className="text-xl font-bold leading-relaxed">{c.predict.question}</h1>
          <div className="flex flex-col gap-2.5">
            {c.predict.options.map((o) => (
              <button key={o.id} type="button" onClick={() => setPrediction(o.id)} className={prediction === o.id ? optionOn : optionOff}>
                {o.label}
              </button>
            ))}
          </div>
          <p className="text-[13px] text-[#5B616B]">{c.predict.note}</p>
          <button type="button" disabled={!prediction} onClick={next} className={`mt-auto ${btnPrimary}`}>
            {c.predict.cta}
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-[#5B616B]">{c.mission.kicker}</div>
            <h1 className="text-[22px] font-bold">{c.mission.title}</h1>
            <p className="text-sm leading-7 text-[#5B616B]">{c.mission.body}</p>
          </div>
          <CircuitSim voltage={sim.voltage} resistance={sim.resistance} onChange={setSim} />
          <div
            className={`rounded-xl px-3.5 py-3 text-[15px] ${met ? "bg-[#E6F4F1] font-bold text-[#0F7B6C]" : "bg-[#F2F3F5] font-semibold"}`}
          >
            {met ? c.mission.done : `${c.mission.pending} ${simCurrent.toFixed(1)} أمبير`}
          </div>
          {predictionLabel && (
            <p className="text-[13px] leading-7 text-[#5B616B]">
              توقّعك كان: «{predictionLabel}». {c.mission.prediction_hint}
            </p>
          )}
          <button
            type="button"
            disabled={!met}
            onClick={() => {
              setMissionSim(sim);
              next();
            }}
            className={`mt-auto ${btnPrimary}`}
          >
            {c.mission.cta}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          {prediction === c.predict.expected ? (
            <div className="flex flex-col gap-0.5 rounded-2xl bg-[#E6F4F1] px-3.5 py-3">
              <div className="text-xs font-semibold text-[#0F7B6C]">{c.explain.right_title}</div>
              <div className="text-[15px] font-semibold">{c.explain.right_body}</div>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5 rounded-2xl bg-[#FDF0E8] px-3.5 py-3">
              <div className="text-xs font-semibold text-[#7A2E0B]">{c.explain.wrong_title}</div>
              <div className="text-[15px] font-semibold">{c.explain.wrong_body.replace("{prediction}", predictionLabel ?? "")}</div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-semibold text-[#5B616B]">{c.explain.law_kicker}</div>
            <div className="flex flex-col items-center gap-2.5 rounded-2xl border-2 border-accent px-4 py-[18px]">
              <div dir="ltr" className="text-[34px] font-bold">I = V / R</div>
              <div className="text-center text-sm leading-7 text-[#5B616B]">{c.explain.law_words}</div>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5 text-[15px]">
            {c.explain.relations.map((r) => (
              <li key={r.title} className="flex flex-col gap-0.5 rounded-xl border-[1.5px] border-[#E3E5E9] px-3.5 py-3">
                <span className="font-bold">{r.title}</span>
                <span className="text-[13px] text-[#5B616B]">{r.body}</span>
              </li>
            ))}
          </ul>
          {missionSim && (
            <div className="rounded-xl bg-[#F2F3F5] px-3.5 py-3 text-sm leading-7">
              من مهمتك: لو <bdi dir="ltr">V = {missionSim.voltage}</bdi> و <bdi dir="ltr">R = {missionSim.resistance}</bdi>، يبقى{" "}
              <bdi dir="ltr">
                I = {missionSim.voltage} ÷ {missionSim.resistance}
              </bdi>{" "}
              = <span className="font-bold">{Number(current(missionSim.voltage, missionSim.resistance).toFixed(2))} أمبير</span>.
            </div>
          )}
          <button type="button" onClick={next} className={`mt-auto ${btnPrimary}`}>
            {c.explain.cta}
          </button>
        </>
      )}

      {step === 3 && (
        <>
          <div className="text-xs font-semibold text-[#5B616B]">{c.check.kicker}</div>
          <h1 className="text-xl font-bold leading-relaxed">{c.check.question}</h1>
          <div className="flex flex-col gap-2.5">
            {c.check.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => pickCheck(o.id)}
                className={checkPick !== o.id ? optionOff : o.id === c.check.correct ? optionRight : optionWrong}
              >
                {o.label}
              </button>
            ))}
          </div>
          {checkResult && (
            <div
              className={`flex flex-col gap-1.5 rounded-2xl px-4 py-3.5 ${checkResult.correct ? "bg-[#E6F4F1] text-[#0F5A4F]" : "bg-[#FDF0E8] text-[#7A2E0B]"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{checkResult.correct ? c.check.right_title : c.check.wrong_title}</span>
                {checkResult.correct && checkFirstTry && (
                  <span dir="ltr" className="text-sm font-bold">+{c.check.xp} XP</span>
                )}
              </div>
              <p className="text-sm leading-7">{checkResult.correct ? c.check.right_body : c.check.wrong_body}</p>
            </div>
          )}
          <button type="button" disabled={!checkResult?.correct} onClick={next} className={`mt-auto ${btnPrimary}`}>
            {c.check.cta}
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <div className="text-xs font-semibold text-[#5B616B]">
            {c.exam.kicker} · محاولة {Math.min(examPicks.length + (examResult ? 0 : 1), c.exam.max_attempts)} من {c.exam.max_attempts}
          </div>
          <h1 className="text-[19px] font-bold leading-relaxed">{c.exam.question}</h1>
          <div className="grid grid-cols-2 gap-2.5">
            {c.exam.options.map((o) => {
              const picked = examResult && lastExamPick === o.id;
              const showRight = examResult?.finished && o.id === c.exam.correct;
              return (
                <button
                  key={o.id}
                  type="button"
                  dir="ltr"
                  onClick={() => pickExam(o.id)}
                  className={`text-center text-[17px] ${showRight ? optionRight : picked ? optionWrong : optionOff}`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>

          {examResult?.correct && (
            <div className="flex flex-col gap-1.5 rounded-2xl bg-[#E6F4F1] px-4 py-3.5 text-[#0F5A4F]">
              <div className="flex items-center justify-between">
                <span dir="ltr" className="font-bold">{c.exam.right_title}</span>
                <span dir="ltr" className="text-sm font-bold">+{examResult.xp} XP</span>
              </div>
              <p className="text-sm leading-7">{c.exam.right_body}</p>
            </div>
          )}

          {examResult && !examResult.correct && !examResult.finished && tutor && (
            <>
              <div className="text-[13px] font-semibold text-[#B42318]">{c.exam.wrong_note}</div>
              <section className="flex flex-col gap-3 rounded-2xl border-[1.5px] border-[#D8DBE0] bg-[#FAFAFB] p-4">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- animated SVG, no optimization needed */}
                  <img src="/brand/lamba-tutor.svg" alt="" width={40} height={40} className="h-10 w-10" />
                  <div className="flex flex-col">
                    <div className="text-[15px] font-bold">المدرس الذكي</div>
                    <div className="text-xs text-[#5B616B]">
                      شاف إنك اخترت <bdi dir="ltr">{c.exam.options.find((o) => o.id === lastExamPick)?.label}</bdi>
                    </div>
                  </div>
                </div>
                <p className="text-[15px] leading-8">{tutor.diagnosis}</p>
                <p className="text-[15px] leading-8">{tutor.hint}</p>
                <div className="rounded-[10px] bg-[#EEF2FD] px-3 py-2.5 text-sm leading-7">
                  <span className="font-bold">جرّب:</span> {tutor.try_in_sim}
                </div>
              </section>
              {examSim && (
                <CircuitSim voltage={examSim.voltage} resistance={examSim.resistance} onChange={setExamSim} />
              )}
              <div className="mt-auto flex flex-col gap-2.5">
                {!examSim && (
                  <button type="button" onClick={() => setExamSim(c.exam.preset)} className={btnSecondary}>
                    جرّب في المحاكاة بأرقام السؤال
                  </button>
                )}
                <button type="button" onClick={retryExam} className={btnPrimary}>
                  جاوب تاني
                </button>
                <div className="text-center text-xs text-[#5B616B]">{c.exam.retry_note}</div>
              </div>
            </>
          )}

          {examResult?.solution && (
            <section className="flex flex-col gap-2 rounded-2xl bg-[#FDF0E8] px-4 py-3.5">
              <div className="font-bold text-[#7A2E0B]">الحل خطوة بخطوة</div>
              <ol className="flex flex-col gap-1.5">
                {examResult.solution.map((s, i) => (
                  <li key={s.label} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-[#5B616B]">
                      {i + 1}. {s.label}
                    </span>
                    <span dir="ltr" className="font-bold">{s.math}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {examResult?.finished && (
            <button type="button" onClick={next} className={`mt-auto ${btnPrimary}`}>
              الخلاصة
            </button>
          )}
        </>
      )}

      {step === 5 && (
        <>
          <div className="flex flex-col items-center gap-2 pt-1 text-center">
            <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="26" r="24" fill="#F5B400" fillOpacity="0.35" />
              <circle cx="32" cy="26" r="14" fill="#FFFFFF" stroke="#1F2328" strokeWidth="2.5" />
              <rect x="25" y="42" width="14" height="10" rx="2" fill="none" stroke="#1F2328" strokeWidth="2.5" />
            </svg>
            <h1 className="text-[22px] font-bold">{c.recap.title}</h1>
            <div className="flex flex-wrap justify-center gap-2">
              <Chip ok={checkFirstTry === true} concept={c.recap.check_concept} />
              <Chip ok={examResult?.mastered === true} concept={c.recap.exam_concept} />
            </div>
          </div>
          <div className="rounded-xl border-[1.5px] border-[#E3E5E9] p-3 text-center">
            <div dir="ltr" className="text-xl font-bold">+{xp} XP</div>
            <div className="text-xs text-[#5B616B]">النقط في الدرس ده</div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl bg-[#F2F3F5] px-4 py-3.5">
            <div className="text-xs font-semibold text-[#5B616B]">{c.recap.summary_kicker}</div>
            <div dir="ltr" className="text-right text-lg font-bold">I = V / R</div>
            <ul className="flex list-disc flex-col gap-1 ps-[18px] text-sm leading-7">
              {c.recap.lines.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
          {!(checkFirstTry && examResult?.mastered) && (
            <p className="text-[13px] leading-7 text-[#5B616B]">{c.recap.review_note}</p>
          )}
          <div className="mt-auto flex flex-col gap-2.5">
            {nextLesson && (
              <Link href={`/lesson/${nextLesson.id}`} className={btnPrimary}>
                الدرس التالي: {nextLesson.title}
              </Link>
            )}
            <Link href="/" className={btnSecondary}>
              {c.recap.back}
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

function Chip({ ok, concept }: { ok: boolean; concept: string }) {
  return ok ? (
    <span className="rounded-full bg-[#E6F4F1] px-3 py-1 text-[13px] font-bold text-[#0F7B6C]">فهمت: {concept}</span>
  ) : (
    <span className="rounded-full bg-[#FDF0E8] px-3 py-1 text-[13px] font-bold text-[#7A2E0B]">محتاج مراجعة: {concept}</span>
  );
}
