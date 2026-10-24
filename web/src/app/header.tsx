import Link from "next/link";
import { getUser } from "@/lib/auth";

export async function Header() {
  const user = await getUser();
  return (
    <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      <Link href="/" className="text-2xl font-bold text-accent">
        لمبة
      </Link>
      {user ? (
        <Link href="/billing" className="text-sm font-semibold text-accent">
          حسابي
        </Link>
      ) : (
        <Link href="/login" className="text-sm font-semibold text-accent">
          تسجيل الدخول
        </Link>
      )}
    </header>
  );
}
