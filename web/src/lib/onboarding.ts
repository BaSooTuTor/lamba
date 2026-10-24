// Onboarding answers (wireframes 0.1–0.6). Kept in a short-lived cookie until signup,
// then written to the student's profile. Shared by the client flow and the server.

export const ONBOARDING_COOKIE = "lamba_onboarding";

export type EducationSystem = "thanaweya_amma" | "egyptian_baccalaureate" | "azhar" | "igcse" | "american" | "other";
export type Track = "science" | "math" | "literary";
export type OnboardingSubject = "physics" | "chemistry" | "biology" | "mathematics" | "programming";

export type OnboardingAnswers = {
  system: "thanaweya_amma";
  grade: 1 | 2 | 3;
  track: Track | null; // first year has no track yet
  subjects: OnboardingSubject[];
  payer: "parent" | "self";
  parentName?: string;
  parentPhone?: string;
};

export const SYSTEMS: { id: EducationSystem; name: string; note: string; live: boolean }[] = [
  { id: "thanaweya_amma", name: "الثانوية العامة", note: "النظام المصري العادي", live: true },
  { id: "egyptian_baccalaureate", name: "البكالوريا المصرية", note: "النظام الجديد بالمسارات، وفيه البرمجة", live: false },
  { id: "azhar", name: "الثانوية الأزهرية", note: "", live: false },
  { id: "igcse", name: "IGCSE", note: "الشهادة البريطانية", live: false },
  { id: "american", name: "الدبلومة الأمريكية", note: "", live: false },
  { id: "other", name: "نظام تاني", note: "قولّنا", live: false },
];

export const GRADES: { id: 1 | 2 | 3; name: string }[] = [
  { id: 1, name: "أولى" },
  { id: 2, name: "تانية" },
  { id: 3, name: "تالتة" },
];

export const TRACKS: { id: Track; name: string }[] = [
  { id: "science", name: "علمي علوم" },
  { id: "math", name: "علمي رياضة" },
  { id: "literary", name: "أدبي" },
];

export const ONBOARDING_SUBJECTS: { id: OnboardingSubject; name: string; live: boolean }[] = [
  { id: "physics", name: "فيزيا", live: true },
  { id: "chemistry", name: "كيميا", live: false },
  { id: "biology", name: "أحياء", live: false },
  { id: "mathematics", name: "رياضة", live: false },
  { id: "programming", name: "البرمجة", live: false },
];

// Third secondary sits the exam in summer 2027; each year earlier adds one.
export function examYear(grade: 1 | 2 | 3) {
  return 2027 + (3 - grade);
}

export function summary(a: OnboardingAnswers) {
  const parts = [
    "الثانوية العامة",
    `${GRADES.find((g) => g.id === a.grade)?.name} ثانوي`,
    a.track ? TRACKS.find((t) => t.id === a.track)?.name : null,
    `امتحان ${examYear(a.grade)}`,
  ];
  return parts.filter(Boolean).join(" · ");
}

// The cookie comes from the browser, so every field is checked before use.
export function parseAnswers(raw: string | undefined): OnboardingAnswers | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(decodeURIComponent(raw));
    if (v?.system !== "thanaweya_amma") return null;
    if (![1, 2, 3].includes(v.grade)) return null;
    const track = v.grade === 1 ? null : TRACKS.some((t) => t.id === v.track) ? (v.track as Track) : null;
    const subjects = Array.isArray(v.subjects)
      ? (v.subjects as unknown[]).filter((s): s is OnboardingSubject =>
          ONBOARDING_SUBJECTS.some((o) => o.id === s),
        )
      : [];
    const payer = v.payer === "self" ? "self" : "parent";
    const text = (x: unknown, max: number) => (typeof x === "string" ? x.trim().slice(0, max) : undefined);
    return {
      system: "thanaweya_amma",
      grade: v.grade,
      track,
      subjects,
      payer,
      parentName: text(v.parentName, 80) || undefined,
      parentPhone: text(v.parentPhone, 20) || undefined,
    };
  } catch {
    return null;
  }
}
