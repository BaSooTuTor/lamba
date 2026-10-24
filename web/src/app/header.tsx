import Image from "next/image";
import Link from "next/link";
import { getUser } from "@/lib/auth";

export async function Header() {
  const user = await getUser();
  return (
    <header className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-accent">
        <Image src="/brand/lamba-mark-animated.svg" alt="" width={36} height={36} unoptimized priority />
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
