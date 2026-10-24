import { signup } from "../login/actions";
import { AuthForm } from "../login/auth-form";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">اعمل حسابك</h1>
      <p className="mt-1 text-sm text-gray-500">الدرس الأول مجاني، ومن غير كارت.</p>
      <AuthForm mode="signup" action={signup} next={next} />
    </main>
  );
}
