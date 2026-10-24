import Link from "next/link";
import { cookies } from "next/headers";
import { ONBOARDING_COOKIE, parseAnswers, summary } from "@/lib/onboarding";
import { signup } from "../login/actions";
import { AuthForm } from "../login/auth-form";

// Wireframe 1: last step of onboarding.
export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const answers = parseAnswers((await cookies()).get(ONBOARDING_COOKIE)?.value);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">آخر خطوة: اعمل حسابك</h1>
      <p className="mt-1 text-sm text-gray-500">وبعدها تبدأ الدرس الأول مجانًا على طول.</p>

      {answers ? (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-accent/5 p-3 text-sm">
          <span className="font-semibold">{summary(answers)}</span>
          <Link href="/onboarding" className="shrink-0 font-semibold text-accent">
            تعديل
          </Link>
        </div>
      ) : (
        <Link href="/onboarding" className="mt-4 block text-sm font-semibold text-accent">
          جاوب على 4 أسئلة الأول عشان نظبطلك الدروس
        </Link>
      )}

      <AuthForm mode="signup" action={signup} next={next} />
    </main>
  );
}
