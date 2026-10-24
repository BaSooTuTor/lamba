# برومبتات Claude Code

الصقوا البرومبت الأول في أول رسالة.

## 1. الهيكل الأساسي والدفع

```text
We are building Lamba (لمبة) for a 4-hour hackathon (Paymob x ALX EdTech Build Night).
Interactive Arabic-first (RTL, mobile-first) learning platform for Egyptian Thanaweya Amma students:
interactive simulations + an AI tutor that explains each student's own mistake.
Scope: Physics, chapter "Electric current & Ohm's law", 3 lessons (lesson 1 free, 2-3 paid).

Stack: Next.js (App Router) + TypeScript + Tailwind + Supabase (auth + Postgres).
Deploy on Cloudflare Workers via OpenNext (@opennextjs/cloudflare) with wrangler.
Secrets via `wrangler secret put` (local: .dev.vars). Verify Paymob HMAC with Web Crypto (crypto.subtle).
Use Supabase Edge Functions for the Paymob webhook and Postgres functions for idempotent writes.

ONBOARDING (before sign-up, 4 questions):
- Welcome screen.
- Education system: Thanaweya Amma (available); Egyptian Baccalaureate, Azhar, IGCSE,
  American Diploma, Other = "coming soon" -> waitlist screen (save contact + system to `waitlist`).
- Grade (1/2/3 secondary) + track (science / math / literary; none for grade 1).
  Exam cohort computed: grade 3 -> 2027, grade 2 -> 2028, grade 1 -> 2029.
- Subjects of interest: physics live; chemistry, biology, math, programming (Scratch/Python) = coming soon
  (save to `interests`).
- Who pays (me / my parent) + optional parent name and phone for a weekly report.
- Then sign-up screen showing a summary of the answers.

PAYMENTS (Paymob SANDBOX, one-time card payments ONLY, no recurring):
Sell an exam-cohort pass, not a monthly subscription.
- COHORTS config: cohort 2027 accessEnd 2027-08-31; price windows by purchase date:
  early_bird 699 EGP (2026-05-01..2026-08-31), full_year 799 (2026-09-01..2027-02-28),
  final_revision 399 (2027-03-01..2027-07-31). Amounts sent in piasters.
- GET /api/offer: active plan/price/end date/months left for the user's cohort.
- POST /api/checkout {cohort}: server picks plan+price, creates Paymob payment intention
  (env: PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_CARD_INTEGRATION_ID, PAYMOB_HMAC_SECRET),
  special_reference = userId:cohort:plan:timestamp, notification_url {SUPABASE_URL}/functions/v1/paymob-webhook,
  redirection_url /billing/result. Return the Unified Checkout URL (public key + client_secret).
- Supabase Edge Function paymob-webhook: verify HMAC; on success insert payment (unique transaction id)
  and set subscriptions.current_period_end = cohort accessEnd. Idempotent.
- /billing/result: verify HMAC, show result in Arabic (fallback activation if webhook missed).
- Paywall on locked lessons; /billing page with plan, end date, payment history.
Tables: profiles (education_system, grade, track, exam_cohort, payer, parent_phone, xp, streak),
lessons, attempts, subscriptions, payments, waitlist, interests.
Use the Paymob skill/docs for exact endpoints and HMAC field order. Never expose secret keys.

Also: footer pages About, Privacy, Refund, Return; contact phone/email; real prices.
Build the payment flow FIRST, then give me a test checklist.
```

## 2. الدرس التفاعلي والمدرس الذكي

```text
Add the lesson engine and the AI tutor:
1. Lessons are stored as JSON cards: concept -> simulation -> question -> summary (4-6 cards).
2. Ohm's law simulation: sliders for voltage (0-24 V) and resistance (1-12 ohm),
   a bulb whose brightness follows I = V/R, an ammeter readout. Save the student's last V and R.
3. Exam-style multiple-choice question after the simulation.
4. On a wrong answer, POST /api/tutor/explain with question, correct answer, student answer and
   the simulation state. Return strict JSON { diagnosis, hint, try_in_sim } in Egyptian Arabic,
   max 3 lines, never reveal the final answer. Validate JSON; retry once; fall back to a
   pre-written explanation per question. Cache common wrong answers.
5. POST /api/practice/generate (subscribers only): 3 new MCQs on the same concept with
   step-by-step solutions; recompute each answer with Ohm's law in code and drop mismatches.
6. Streak + XP (not purchasable, not spendable).
Seed one realistic demo attempt so the demo never starts empty.
```
