import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, getUser, hasAccess } from "@/lib/auth";
import { listLessons, SUBJECTS, type Subject } from "@/lib/lessons";

export default async function Home({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const [{ subject: requested }, user, lessons] = await Promise.all([searchParams, getUser(), listLessons()]);
  // Visitors start with the welcome screen and onboarding (wireframes 0.1–0.6).
  if (!user) redirect("/welcome");
  const [profile, unlocked] = user
    ? await Promise.all([getProfile(user.id), hasAccess(user.id)])
    : [null, false];

  // Only the subjects of the student's stream (علمي علوم / علمي رياضة); everything before onboarding.
  const track = profile?.track ?? null;
  const visible = lessons.filter((l) => !track || l.streams.includes(track));
  const subjects = SUBJECTS.filter((s) => visible.some((l) => l.subject === s.id));
  const active: Subject = subjects.find((s) => s.id === requested)?.id ?? subjects[0]?.id ?? "physics";

  const subjectLessons = visible.filter((l) => l.subject === active);
  const live = subjectLessons.filter((l) => l.status === "live");
  const soon = subjectLessons.filter((l) => l.status === "coming_soon");
  const chapter = subjectLessons[0]?.chapter ?? "الدروس";

  return (
    <main className="p-6">
      <nav aria-label="المواد" className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {subjects.map((s) => {
          const isActive = s.id === active;
          const isSoon = !visible.some((l) => l.subject === s.id && l.status === "live");
          return (
            <Link
              key={s.id}
              href={`/?subject=${s.id}`}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${
                isActive ? "border-accent bg-accent text-white" : "border-gray-200 text-gray-700"
              }`}
            >
              {s.name}
              {isSoon && <span className={`ms-1 text-xs ${isActive ? "text-white/80" : "text-gray-400"}`}>· قريبًا</span>}
            </Link>
          );
        })}
      </nav>

      <h1 className="mt-6 text-2xl font-bold">{chapter}</h1>

      {live.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-gray-500">{live.length} دروس · الدرس الأول مجاني</p>
          <ol className="mt-6 flex flex-col gap-3">
            {live.map((lesson) => {
              const open = lesson.is_free || unlocked;
              return (
                <li key={lesson.id}>
                  <Link
                    href={open ? `/lesson/${lesson.id}` : `/paywall?lesson=${lesson.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 hover:border-accent"
                  >
                    <span className="font-semibold">
                      {lesson.order}. {lesson.title}
                    </span>
                    <span className={`shrink-0 text-xs font-semibold ${open ? "text-accent" : "text-gray-400"}`}>
                      {lesson.is_free ? "مجاني" : unlocked ? "مفتوح" : "🔒 للمشتركين"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <p className="mt-1 text-sm text-gray-500">المعمل التفاعلي للمادة دي لسه بيتبني.</p>
      )}

      {soon.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {soon.map((lesson) => (
            <li
              key={lesson.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 p-4 text-gray-500"
            >
              <span className="font-semibold">{lesson.title}</span>
              <span className="shrink-0 text-xs font-semibold">قريبًا</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
