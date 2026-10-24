import Link from "next/link";
import { getUser, hasAccess } from "@/lib/auth";
import { listLessons } from "@/lib/lessons";

export default async function Home() {
  const [user, lessons] = await Promise.all([getUser(), listLessons()]);
  const unlocked = user ? await hasAccess(user.id) : false;

  return (
    <main className="p-6">
      <p className="text-sm font-semibold text-accent">فيزيا · الفصل 1</p>
      <h1 className="mt-1 text-2xl font-bold">{lessons[0]?.chapter ?? "الدروس"}</h1>
      <p className="mt-1 text-sm text-gray-500">{lessons.length} دروس · الدرس الأول مجاني</p>

      <ol className="mt-6 flex flex-col gap-3">
        {lessons.map((lesson) => {
          const open = lesson.is_free || unlocked;
          return (
            <li key={lesson.id}>
              <Link
                href={open ? `/lesson/${lesson.id}` : `/paywall?lesson=${lesson.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 hover:border-accent"
              >
                <span className="font-semibold">
                  {lesson.order}. {lesson.title}
                </span>
                <span className={`text-xs font-semibold ${open ? "text-accent" : "text-gray-400"}`}>
                  {lesson.is_free ? "مجاني" : unlocked ? "مفتوح" : "🔒 للمشتركين"}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {!user && (
        <Link href="/signup" className="mt-8 block rounded-lg bg-accent px-4 py-3 text-center font-semibold text-white">
          اعمل حساب وابدأ مجانًا
        </Link>
      )}
    </main>
  );
}
