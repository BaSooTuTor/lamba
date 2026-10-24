import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getUser, hasAccess } from "@/lib/auth";
import { formatArabicDate, getOffer } from "@/lib/cohorts";
import { SubscribeButton } from "./subscribe-button";

export default async function PaywallPage({ searchParams }: { searchParams: Promise<{ lesson?: string }> }) {
  const { lesson } = await searchParams;
  const user = await getUser();
  if (user && (await hasAccess(user.id))) redirect(lesson ? `/lesson/${encodeURIComponent(lesson)}` : "/");

  const profile = user ? await getProfile(user.id) : null;
  const offer = getOffer(profile?.exam_cohort ?? "2027");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">كمّل لحد آخر امتحان</h1>
      <p className="mt-1 text-sm text-gray-500">الدرس ده وكل الدروس اللي بعده للمشتركين.</p>

      {offer ? (
        <section className="mt-6 rounded-2xl border-2 border-accent p-5">
          <p className="text-sm font-semibold text-accent">باقة الثانوية العامة {offer.cohort}</p>
          <p className="mt-1 font-semibold">{offer.label}</p>
          <p className="mt-3">
            <span className="text-4xl font-bold">{offer.priceEgp}</span> جنيه · دفعة واحدة
          </p>
          <p className="mt-3 text-sm">
            ساري حتى {formatArabicDate(offer.accessEnd)}، يعني حوالي {offer.monthsLeft} شهور، والدور التاني داخل فيهم.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-gray-600">
            <li>كل دروس الفيزيا بالمحاكاة</li>
            <li>المدرس الذكي يشرحلك غلطتك أنت</li>
            <li>مسائل جديدة بنظام الامتحان بعد كل درس</li>
          </ul>
          <p className="mt-4 text-xs text-gray-500">استرجاع كامل للفلوس خلال 14 يوم، من غير أسئلة.</p>
          <div className="mt-5">
            <SubscribeButton priceEgp={offer.priceEgp} />
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">الدفع الآمن عن طريق Paymob</p>
        </section>
      ) : (
        <p className="mt-6 text-gray-500">مفيش باقة متاحة لدفعتك دلوقتي.</p>
      )}

      <Link href="/" className="mt-6 block text-center text-sm text-gray-500">
        مش دلوقتي
      </Link>
    </main>
  );
}
