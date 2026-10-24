import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { ONBOARDING_COOKIE, parseAnswers } from "@/lib/onboarding";
import { OnboardingFlow } from "./onboarding-flow";

// Wireframes 0.2–0.6: four quick questions before signup.
export default async function OnboardingPage() {
  if (await getUser()) redirect("/");
  const initial = parseAnswers((await cookies()).get(ONBOARDING_COOKIE)?.value);
  return <OnboardingFlow initial={initial} />;
}
