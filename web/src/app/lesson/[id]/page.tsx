import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser, hasAccess } from "@/lib/auth";
import { getLesson } from "@/lib/lessons";

// Placeholder until the lesson engine (6-card loop) lands. The access check is server-side,
// so a locked lesson never renders without an active pass.
export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLesson(id);
  if (!lesson) notFound();

  if (lesson.status === "coming_soon") {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="mt-4 text-gray-500">المعمل ده لسه بيتبني، وهيوصلك أول ما ينزل.</p>
        <Link href={`/?subject=${lesson.subject}`} className="mt-6 inline-block text-accent underline">
          رجوع للدروس
        </Link>
      </main>
    );
  }

  if (!lesson.is_free) {
    const user = await getUser();
    if (!user || !(await hasAccess(user.id))) redirect(`/paywall?lesson=${lesson.id}`);
  }

  return (
    <main className="p-6">
      <p className="text-sm font-semibold text-accent">الدرس {lesson.order}</p>
      <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
      <p className="mt-6 rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
        كروت الدرس جاية قريب: توقّع، تجربة في المحاكاة، شرح، وأسئلة.
      </p>
      <Link href="/" className="mt-6 inline-block text-accent underline">
        رجوع للدروس
      </Link>
    </main>
  );
}
