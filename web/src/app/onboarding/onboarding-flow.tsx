"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import {
  examYear,
  GRADES,
  ONBOARDING_COOKIE,
  ONBOARDING_SUBJECTS,
  SYSTEMS,
  TRACKS,
  type EducationSystem,
  type OnboardingAnswers,
  type OnboardingSubject,
  type Track,
} from "@/lib/onboarding";
import { joinWaitlist, type WaitlistState } from "./actions";

type Step = "system" | "grade" | "subjects" | "parent" | "waitlist";
const NUMBERED: Step[] = ["system", "grade", "subjects", "parent"];

const choice = (active: boolean) =>
  `flex w-full items-center justify-between gap-3 rounded-xl border-2 p-4 text-start ${
    active ? "border-accent bg-accent/5" : "border-gray-200"
  }`;
// 52px option blocks from the wireframes (years, tracks, payer).
const option = (active: boolean) =>
  `h-[52px] rounded-xl px-4 ${active ? "border-2 border-accent bg-accent/5 font-bold" : "border-[1.5px] border-gray-300"}`;
const primary =
  "w-full rounded-lg bg-accent px-4 py-3 text-center font-semibold text-white disabled:opacity-40";

export function OnboardingFlow({ initial }: { initial: OnboardingAnswers | null }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("system");
  const [system, setSystem] = useState<EducationSystem>(initial?.system ?? "thanaweya_amma");
  const [grade, setGrade] = useState<1 | 2 | 3>(initial?.grade ?? 3);
  const [track, setTrack] = useState<Track | null>(initial?.track ?? "science");
  const [subjects, setSubjects] = useState<OnboardingSubject[]>(initial?.subjects ?? ["physics"]);
  const [payer, setPayer] = useState<"parent" | "self">(initial?.payer ?? "parent");
  const [parentName, setParentName] = useState(initial?.parentName ?? "");
  const [parentPhone, setParentPhone] = useState(initial?.parentPhone ?? "");

  const index = NUMBERED.indexOf(step);
  const waitlistFor = system !== "thanaweya_amma" ? system : "thanaweya_amma_literary";
  const waitlistTitle =
    system !== "thanaweya_amma"
      ? `${SYSTEMS.find((s) => s.id === system)?.name} جاية قريب`
      : "دروس الشعبة الأدبي جاية قريب";

  function finish(withParent: boolean) {
    const answers: OnboardingAnswers = {
      system: "thanaweya_amma",
      grade,
      track: grade === 1 ? null : track,
      subjects,
      payer,
      ...(withParent && parentName.trim() ? { parentName: parentName.trim() } : {}),
      ...(withParent && parentPhone.trim() ? { parentPhone: parentPhone.trim() } : {}),
    };
    document.cookie = `${ONBOARDING_COOKIE}=${encodeURIComponent(JSON.stringify(answers))}; path=/; max-age=86400; samesite=lax`;
    router.push("/signup");
  }

  function back() {
    if (step === "waitlist") return setStep(system === "thanaweya_amma" ? "grade" : "system");
    if (index > 0) return setStep(NUMBERED[index - 1]);
    router.push("/welcome");
  }

  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col p-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={back} aria-label="رجوع" className="text-2xl leading-none text-gray-500">
          →
        </button>
        {index >= 0 && (
          <>
            <div className="grid flex-1 grid-cols-4 gap-1">
              {NUMBERED.map((s, i) => (
                <div key={s} className={`h-1.5 rounded-full ${i <= index ? "bg-accent" : "bg-gray-200"}`} />
              ))}
            </div>
            {/* ltr, or RTL bidi shows "1 / 4" as "4 / 1" */}
            <span dir="ltr" className="text-xs text-gray-500">
              {index + 1} / {NUMBERED.length}
            </span>
          </>
        )}
      </div>

      {step === "system" && (
        <>
          <h1 className="mt-6 text-2xl font-bold">بتدرس في أنهي نظام؟</h1>
          <p className="mt-1 text-sm text-gray-500">بنبدأ بالثانوية العامة، وباقي الأنظمة جاية قريب.</p>
          <div className="mt-6 flex flex-col gap-3">
            {SYSTEMS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSystem(s.id);
                  setStep(s.live ? "grade" : "waitlist");
                }}
                className={choice(system === s.id)}
              >
                <span className="flex flex-col">
                  <span className="font-semibold">{s.name}</span>
                  {s.note && <span className="text-xs text-gray-500">{s.note}</span>}
                </span>
                <span className={`shrink-0 text-xs font-semibold ${s.live ? "text-accent" : "text-gray-400"}`}>
                  {s.live ? "متاح" : s.id === "other" ? "قولّنا" : "قريبًا"}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {step === "grade" && (
        <>
          <p className="mt-6 text-xs font-semibold text-gray-500">الثانوية العامة</p>
          <h1 className="mt-1 text-2xl font-bold">إنت في سنة كام؟</h1>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {GRADES.map((g) => (
              <button key={g.id} type="button" onClick={() => setGrade(g.id)} className={option(grade === g.id)}>
                {g.name}
              </button>
            ))}
          </div>

          <h2 className="mt-6 font-semibold">الشعبة</h2>
          {grade === 1 ? (
            <p className="mt-2 rounded-xl bg-gray-100 px-3.5 py-3 text-sm text-gray-500">
              أولى ثانوي لسه مفيهاش شعبة، فهنوريك المواد المشتركة.
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTrack(t.id)}
                  className={`${option(track === t.id)} text-start`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-2 rounded-xl border-[1.5px] border-dashed border-gray-400 px-3.5 py-3">
            <p className="text-sm text-gray-500">امتحانك هيبقى</p>
            <p className="text-lg font-bold">صيف {examYear(grade)}</p>
          </div>

          <div className="mt-auto pt-8">
            <button
              type="button"
              className={primary}
              onClick={() => setStep(grade !== 1 && track === "literary" ? "waitlist" : "subjects")}
            >
              التالي
            </button>
          </div>
        </>
      )}

      {step === "subjects" && (
        <>
          <h1 className="mt-6 text-2xl font-bold">إيه المواد اللي محتاج تفهمها أكتر؟</h1>
          <p className="mt-1 text-sm text-gray-500">
            اختار أكتر من مادة. المواد اللي لسه جاية هنبلغك أول ما تنزل.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            {ONBOARDING_SUBJECTS.filter((s) => s.id !== "programming").map((s) => (
              <SubjectButton key={s.id} id={s.id} subjects={subjects} setSubjects={setSubjects}>
                <span className="font-bold">{s.name}</span>
                <span className={`text-xs ${s.live ? "font-bold text-accent" : "text-gray-500"}`}>
                  {s.live ? "متاح دلوقتي" : s.id === "chemistry" ? "قريبًا · هنبلغك" : "قريبًا"}
                </span>
              </SubjectButton>
            ))}
          </div>
          <h2 className="mt-6 font-bold">مهارة إضافية</h2>
          <SubjectButton id="programming" subjects={subjects} setSubjects={setSubjects} row>
            <span className="flex flex-col items-start">
              <span className="font-bold">البرمجة</span>
              <span className="text-xs text-gray-500" dir="ltr">
                Scratch · Python
              </span>
            </span>
            <span className="text-xs text-gray-500">قريبًا</span>
          </SubjectButton>
          <div className="mt-auto pt-8">
            <button type="button" className={primary} disabled={subjects.length === 0} onClick={() => setStep("parent")}>
              التالي
            </button>
          </div>
        </>
      )}

      {step === "parent" && (
        <>
          <h1 className="mt-6 text-2xl font-bold">مين بيتابع معاك؟</h1>
          <p className="mt-1 text-sm text-gray-500">
            لو حابب، ولي أمرك يوصله تقرير أسبوعي بالدروس اللي خلصتها ومستواك.
          </p>

          <h2 className="mt-6 font-semibold">مين هيدفع الاشتراك؟</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPayer("parent")} className={option(payer === "parent")}>
              ولي أمري
            </button>
            <button type="button" onClick={() => setPayer("self")} className={option(payer === "self")}>
              أنا
            </button>
          </div>

          <label className="mt-6 flex flex-col gap-1 text-sm font-semibold">
            اسم ولي الأمر
            <input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="أ. خالد"
              autoComplete="off"
              className="rounded-lg border border-gray-300 px-3 py-3 text-base font-normal focus:border-accent focus:outline-none"
            />
          </label>
          <label className="mt-4 flex flex-col gap-1 text-sm font-semibold">
            رقم الموبايل (للتقرير الأسبوعي)
            <input
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              type="tel"
              dir="ltr"
              inputMode="tel"
              placeholder="01X XXXX XXXX"
              autoComplete="off"
              className="rounded-lg border border-gray-300 px-3 py-3 text-base font-normal focus:border-accent focus:outline-none"
            />
          </label>
          <p className="mt-3 text-xs text-gray-500">
            مش هنبعت أي حاجة غير التقرير ولينك الدفع لو طلبته. تقدر تلغي ده من الإعدادات.
          </p>

          <div className="mt-auto flex flex-col gap-3 pt-8">
            <button type="button" className={primary} onClick={() => finish(true)}>
              التالي
            </button>
            <button type="button" className="py-2 text-sm font-semibold text-gray-500" onClick={() => finish(false)}>
              تخطّي
            </button>
          </div>
        </>
      )}

      {step === "waitlist" && (
        <Waitlist
          title={waitlistTitle}
          system={waitlistFor}
          onTryThanaweya={() => {
            setSystem("thanaweya_amma");
            if (track === "literary") setTrack("science");
            setStep("grade");
          }}
        />
      )}
    </main>
  );
}

function SubjectButton({
  id,
  subjects,
  setSubjects,
  row = false,
  children,
}: {
  id: OnboardingSubject;
  subjects: OnboardingSubject[];
  setSubjects: React.Dispatch<React.SetStateAction<OnboardingSubject[]>>;
  row?: boolean;
  children: React.ReactNode;
}) {
  const active = subjects.includes(id);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => setSubjects((cur) => (active ? cur.filter((x) => x !== id) : [...cur, id]))}
      className={`${choice(active)} ${row ? "mt-2" : "h-[84px] flex-col items-start justify-center gap-1"}`}
    >
      {children}
    </button>
  );
}

function Waitlist({ title, system, onTryThanaweya }: { title: string; system: string; onTryThanaweya: () => void }) {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, {});

  return (
    <>
      <p className="mt-6 text-sm font-semibold text-accent">قريبًا</p>
      <h1 className="mt-1 text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        سيب رقمك أو إيميلك، وهنبلغك أول ما دروسها تنزل. وكل ما ناس أكتر تسجّل، هنبدأ بيها أسرع.
      </p>

      <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm">
        <p className="font-semibold">اللي هيبقى موجود فيها</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-gray-600">
          <li>
            نفس المحاكاة والمدرس الذكي، على مواد{" "}
            {system === "egyptian_baccalaureate" ? "المسارات" : system === "thanaweya_amma_literary" ? "الأدبي" : "نظامك"}
          </li>
          {system === "egyptian_baccalaureate" && <li>البرمجة بـ Scratch و Python، خطوة بخطوة</li>}
        </ul>
      </div>

      {state.ok ? (
        <p className="mt-6 rounded-xl bg-green-50 p-4 font-semibold text-green-800">تمام، هنبلغك أول ما تنزل.</p>
      ) : (
        <form action={action} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="system" value={system} />
          <label className="flex flex-col gap-1 text-sm font-semibold">
            الموبايل أو الإيميل
            <input
              name="contact"
              dir="ltr"
              required
              autoComplete="email"
              className="rounded-lg border border-gray-300 px-3 py-3 text-base font-normal focus:border-accent focus:outline-none"
            />
          </label>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button disabled={pending} className={primary}>
            {pending ? "لحظة…" : "بلّغني أول ما تنزل"}
          </button>
        </form>
      )}

      <div className="mt-auto pt-8 text-center">
        <button type="button" onClick={onTryThanaweya} className="text-sm font-semibold text-accent underline">
          جرّب دروس الثانوية العامة في الوقت ده
        </button>
        <p className="mt-3 text-xs text-gray-500">
          عندك حساب؟{" "}
          <Link href="/login" className="font-semibold text-accent">
            سجّل دخولك
          </Link>
        </p>
      </div>
    </>
  );
}
