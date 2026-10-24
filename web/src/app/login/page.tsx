import { login } from "./actions";
import { AuthForm } from "./auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">أهلًا بيك تاني</h1>
      <p className="mt-1 text-sm text-gray-500">سجّل دخولك وكمّل من مكان ما وقفت.</p>
      <AuthForm mode="login" action={login} next={next} />
    </main>
  );
}
