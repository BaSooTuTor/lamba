import { notFound, redirect } from "next/navigation";
import { getProfile, getUser } from "@/lib/auth";
import { getOffer } from "@/lib/cohorts";
import { MockPayment } from "./mock-payment";

// Dev/demo only: hidden unless ENABLE_MOCK_PAYMENT=true.
export default async function MockPaymentPage() {
  if (process.env.ENABLE_MOCK_PAYMENT !== "true") notFound();
  const user = await getUser();
  if (!user) redirect("/login?next=/mock-payment");

  const profile = await getProfile(user.id);
  const offer = getOffer(profile?.exam_cohort ?? "2027");
  if (!offer) notFound();
  return <MockPayment priceEgp={offer.priceEgp} />;
}
