import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

// Wireframe 0.1: first screen for visitors.
export default async function WelcomePage() {
  if (await getUser()) redirect("/");

  const features = [
    "جرّب الدرس بإيدك بمحاكاة تفاعلية",
    "مدرس ذكي بيشرحلك غلطتك إنت",
    "مسائل بنظام الامتحان بعد كل درس",
  ];

  return (
    <main className="flex min-h-[calc(100vh-73px)] flex-col p-6">
      <div className="mt-6 flex flex-col items-center text-center">
        <Image src="/brand/lamba-mark-animated.svg" alt="" width={112} height={112} unoptimized priority />
        <h1 className="mt-4 text-4xl font-bold">لمبة</h1>
        <p className="mt-2 text-lg text-gray-600">لما الفيزيا تنوّر في دماغك</p>
      </div>

      <ol className="mt-10 flex flex-col gap-3">
        {features.map((f, i) => (
          <li key={f} className="flex items-center gap-3 rounded-xl border border-gray-200 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-bold text-accent">
              {i + 1}
            </span>
            <span className="font-semibold">{f}</span>
          </li>
        ))}
      </ol>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Link href="/onboarding" className="rounded-lg bg-accent px-4 py-3 text-center font-semibold text-white">
          يلا نبدأ
        </Link>
        <Link href="/login" className="rounded-lg border border-gray-300 px-4 py-3 text-center font-semibold">
          عندي حساب
        </Link>
        <p className="text-center text-xs text-gray-500">4 أسئلة سريعة، أقل من دقيقة</p>
      </div>
    </main>
  );
}
