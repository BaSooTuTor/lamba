// Exam-cohort passes: one payment, valid until the cohort's last exam (second round included).
// The price depends on the purchase date; the end date is fixed per cohort (see PRD pricing).
// Keep accessEnd and prices in sync with record_payment() in supabase/migrations.
export const COHORTS = {
  "2027": {
    accessEnd: "2027-08-31",
    windows: [
      { plan: "early_bird", label: "حجز مبكر", priceEgp: 699, from: "2026-05-01", to: "2026-08-31" },
      { plan: "full_year", label: "السنة كاملة", priceEgp: 799, from: "2026-09-01", to: "2027-02-28" },
      { plan: "final_revision", label: "المراجعة النهائية", priceEgp: 399, from: "2027-03-01", to: "2027-07-31" },
    ],
  },
} as const;

export type Offer = {
  cohort: string;
  plan: string;
  label: string;
  priceEgp: number;
  amountCents: number;
  accessEnd: string;
  monthsLeft: number;
};

// The offer on sale today (Cairo date) for a cohort, or null if nothing is on sale.
export function getOffer(cohort: string, today: Date = new Date()): Offer | null {
  const config = COHORTS[cohort as keyof typeof COHORTS];
  if (!config) return null;

  const day = cairoDate(today);
  const window = config.windows.find((w) => w.from <= day && day <= w.to);
  if (!window) return null;

  return {
    cohort,
    plan: window.plan,
    label: window.label,
    priceEgp: window.priceEgp,
    amountCents: window.priceEgp * 100,
    accessEnd: config.accessEnd,
    monthsLeft: monthsBetween(day, config.accessEnd),
  };
}

// "2027-08-31" -> "31 أغسطس 2027"
export function formatArabicDate(isoDate: string) {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Cairo",
  }).format(new Date(isoDate.length === 10 ? `${isoDate}T12:00:00Z` : isoDate));
}

function cairoDate(date: Date) {
  // en-CA formats as YYYY-MM-DD, so plain string comparison works.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(date);
}

function monthsBetween(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  return Math.max(0, (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0));
}

// "full_year" -> "السنة كاملة"
export function planLabel(cohort: string, plan: string) {
  const config = COHORTS[cohort as keyof typeof COHORTS];
  return config?.windows.find((w) => w.plan === plan)?.label ?? plan;
}
