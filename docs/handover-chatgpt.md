# Handover لـ ChatGPT — لمبة (Lamba)

Oct 24, 2026 · @Abdulbasit

الوثيقة دي فيها كل اللي اتقرر لحد دلوقتي في مشروع الفريق في Paymob × ALX EdTech Build Night، عشان ChatGPT يكمّل معانا من غير ما نعيد الشرح.

## 1. تعليمات لـ ChatGPT

إنت داخل في نص هاكاثون مدته 4 ساعات. الفكرة والتسعير والتقنية اتقرروا خلاص، ودورك تساعدنا ننفّذ بسرعة.

- **متفتحش قرارات اتاخدت** (قسم 3) إلا لو فيه مشكلة حقيقية هتمنعنا نعدّي الـ Payment Gate. لو شايف مشكلة، قولها في سطر واقترح بديل.
- **الأولوية المطلقة:** دفعة Paymob Sandbox ناجحة من الأول للآخر. أي فيتشر تاني بعدها.
- **اللغة:** رد بالعامية المصرية، وسيب المصطلحات التقنية بالإنجليزي. الكود والـ Prompts بالإنجليزي، ونصوص الواجهة بالعربي.
- **الأسلوب:** عملي ومباشر، ومن غير مقدمات. لو فيه خطوات، اكتبها مترقمة. ولو فيه كود، اكتبه كامل وجاهز يتنسخ.
- **متفترضش تفاصيل Paymob:** الـ Endpoints وترتيب حقول الـ HMAC لازم تتأكد من developers.paymob.com. ولو مش متأكد من حاجة، قول كده صراحة.
- الوثيقة دي كاملة لوحدها. اللينكات بتاعة claude.ai اللي فيها خاصة، وإنت مش هتقدر تفتحها.

## 2. سياق المسابقة

المسابقة اسمها Paymob × ALX EdTech Build Night. فيها حوالي 40 مشارك، متقسمين فرق من 4 أفراد بشكل عشوائي. كل فريق بيبني منتج في واحد من 4 فرتكالات EdTech، وبعدين يعمل Pitch للمنتج والبزنس موديل.

| البند | التفاصيل |
| --- | --- |
| وقت البناء | 4 ساعات للمنتج والـ Pitch Deck |
| الفرتكال بتاعنا | 01 · High-stakes exam prep (طلاب الثانوية العامة). أقصى حد 3 فرق في الفرتكال |
| القاعدة الثابتة | المنتج لازم يكسب فلوس بـ Payment flow شغال على Paymob Sandbox |
| الـ Payment Gate | قبل نهاية البناء Paymob بيراجعوا Checklist مع كل فريق، وده اللي بيحدد الأهلية للجوايز |
| الـ Standups | Standup 1 لقفل الفكرة (20 ثانية)، و Standup 2 لمتابعة التقدم |
| Swap-and-test | واحد من فريق تاني يجرب المنتج 5 دقايق من غير شرح، وإجاباته بتدخل في سلايد البزنس موديل |
| العرض | 10 دقايق: Pitch من 6 لـ 7 دقايق وأسئلة من 3 لـ 4. لازم Live demo و**دفعة ناجحة قدام الحكام** |
| الجوايز | Best overall · Best use of AI · Best pitch · Best standalone product. جايزة واحدة بس لكل فريق |
| الـ Pitch Template (ALX) | Cover · Problem · Solution · Market · Business model (Revenue / Pricing / Main costs) · Go-to-market · Competition · Team |

**قيود Paymob المهمة**

- الـ Sandbox بيدعم **الدفع مرة واحدة بالكارت بس**. مفيش Subscriptions ولا Split payouts ولا BNPL ولا تقسيط.
- ممنوع: Dropshipping، وبيع Tokens أو Credits بتتصرف على خدمات، وكل أشكال Gaming monetization.
- التسجيل كتاجر بالبطاقة الشخصية بس مينفعش معاه موديل اشتراك.
- الـ MCP بتاع Paymob بيشتغل على الحساب الحقيقي بس، مش على الـ Sandbox.
- عشان نشتغل لايف بعدين، الموقع لازم يبقى فيه: رقم تليفون، وإيميل، وعنوان، وصفحات About و Privacy و Refund و Return، وأسعار حقيقية.

## 3. المنتج والقرارات

**المنتج في جملة:** منصة تعلم تفاعلية بالعربي لطلاب الثانوية العامة، زي Brilliant.org بس على المنهج المصري. بتبسط المواد الصعبة بمحاكاة الطالب يلعب بيها بإيده، ومدرس AI بيشرح لكل طالب غلطته هو بالظبط.

**المشكلة:** الطالب بيحفظ من غير ما يفهم، وبيذاكر لوحده بالليل ومفيش حد يقوله غلط فين. والأهل بيدفعوا دروس خصوصي غالية عشان حد «يفهّم» ابنهم. في 2026 امتحن حوالي 826 ألف طالب ثانوية عامة نظام جديد، وأكتر من 205 ألف منهم مانجحوش من الدور الأول (جريدة الخليج، 29 يوليو 2026).

**المستخدمين:** الطالب هو اللي بيستخدم المنتج (17 سنة، بيذاكر على الموبايل). وولي الأمر هو اللي بيدفع، وبيدفع أصلًا في دروس، وهيبقى متردد يدفع مبلغ كبير لمنصة ميعرفهاش.

**القرارات اللي اتاخدت**

| القرار | ليه |
| --- | --- |
| الفرتكال 01 ومنتج تفاعلي زي Brilliant | الديمو بيبهر بصريًا، وموديل الاشتراك طبيعي فيه |
| نسميها «منصة تعلم تفاعلية»، مش «لعبة» | Paymob مانعين Gaming monetization. الـ XP والـ Streak مش بتتباع |
| مادة واحدة (فيزيا تالتة ثانوي)، وفصل واحد (التيار الكهربي وقانون أوم)، و3 دروس | درس واحد متلمّع أحسن من دروس كتير نص نص في 4 ساعات |
| الـ AI جوهري: بيشرح الغلطة بناءً على اللي الطالب عمله في المحاكاة، وبيولّد مسائل بنظام الامتحان | عشان ننافس على Best use of AI. Brilliant نفسها مفيهاش الميزة دي |
| مفيش اشتراك شهري. الباقة دفعة واحدة مربوطة بدفعة الامتحان | الأهل بيفكروا في الثانوية العامة كسنة واحدة، والـ Sandbox أصلًا بيدعم الدفع مرة واحدة بس |
| الباقة سارية لحد آخر أغسطس مش يوليو | عشان طلاب الدور التاني ميتقفلش عليهم الاشتراك |
| ضمان استرجاع 14 يوم ودرس مجاني أول | عشان يطمّن الأهل قدام المبلغ الكبير |
| Supabase مش Convex | التسجيل جاهز، و Claude Code عارفه كويس، و Postgres مش بيربطنا بمزوّد |
| البناء بـ Claude Code، والداتا على Supabase، والنشر على Cloudflare من أول نص ساعة | الـ Webhook محتاج URL عام |

**قرارات اتاخدت بعد كده**

- **Onboarding من 4 أسئلة قبل التسجيل:** نظام الدراسة، والسنة والشعبة، والمواد، وولي الأمر. الـ MVP للثانوية العامة بس، والأنظمة التانية (البكالوريا المصرية، والأزهرية، و IGCSE، والدبلومة الأمريكية) بتروح لقائمة انتظار.
- **البزنس موديل فيه 4 مصادر:** باقة الدفعة للطالب (MVP)، وترخيص سنوي للسناتر والمدارس يشرحوا بيه بالمحاكاة، والتوسع لأنظمة تانية، ومسار برمجة.
- **البرمجة (Scratch ثم Python):** لأن البكالوريا المصرية فيها البرمجة في أولى ثانوي، وفي تانية ثانوي في مسار الهندسة وعلوم الحاسب. اللغة اختيارنا إحنا، لأن المصادر ماحددتش لغة رسمية.
- **الأدوات:** Supabase و Claude Code و Cloudflare (بدل Vercel).
- **الـ Webhook:** Supabase Edge Function (`paymob-webhook`) بتسجل الدفعة بدالة Postgres (`record_payment`) عشان تبقى Idempotent.

**اسم المنتج: لمبة (Lamba).** استبعدنا «Eduactive» لأنه قريب جدًا من Eduact، ودي شركة EdTech مصرية أبواب اشترتها في سبتمبر 2026. واخترنا «لمبة» لأن «اللمبة نوّرت» تعبير مصري معناه «فهمت»، والديمو نفسه فيه لمبة بتنوّر. واستبعدنا «فهّمني» كمان، لأنه قريب من منصة «فهيم» الموجودة.

## 4. التسعير والدفع

بنبيع «باقة دفعة الامتحان»: دفعة واحدة بالكارت، سارية لحد آخر امتحانات دفعة الطالب بما فيها الدور التاني. السعر بيتحدد بميعاد الشراء، وتاريخ النهاية ثابت لكل دفعة. الطالب بيختار «سنة امتحاني» أول ما يسجل. والأسعار لسه مبدئية.

| وقت الشراء | الباقة | السعر (جنيه) | المبلغ لـ Paymob (قرش) | سارية حتى |
| --- | --- | --- | --- | --- |
| 1 مايو – 31 أغسطس 2026 | early\_bird (حجز مبكر) | 699 | 69900 | 31 أغسطس 2027 |
| 1 سبتمبر 2026 – 28 فبراير 2027 | full\_year (السنة كاملة) | 799 | 79900 | 31 أغسطس 2027 |
| 1 مارس – 31 يوليو 2027 | final\_revision (المراجعة النهائية) | 399 | 39900 | 31 أغسطس 2027 |

النهارده (24 أكتوبر 2026) العرض المتاح هو full\_year بـ 799 ج، والباقة هتبقى سارية حوالي 10 شهور.

```ts
// one-time payments, access tied to exam cohort
export const COHORTS = {
  2027: {
    accessEnd: "2027-08-31", // covers 2nd round exams
    windows: [
      { plan: "early_bird",     from: "2026-05-01", to: "2026-08-31", price: 699 },
      { plan: "full_year",      from: "2026-09-01", to: "2027-02-28", price: 799 },
      { plan: "final_revision", from: "2027-03-01", to: "2027-07-31", price: 399 },
    ],
  },
};
// getOffer(cohort, today) -> active window's plan + price
// on webhook success: current_period_end = COHORTS[cohort].accessEnd
```

**تدفق Paymob**

1. الفرونت يبعت `POST /api/checkout` ومعاه الدفعة بس. السيرفر هو اللي بيحدد الباقة والسعر من التاريخ.
2. السيرفر يعمل Payment Intention بالـ Secret key (الـ Header بيبدأ بـ `Token`). الـ Body فيه: amount بالقرش، و currency EGP، و payment\_methods = Card Integration ID، و items، و billing\_data (فيه رقم تليفون)، و `special_reference = userId:cohort:plan:timestamp`، و notification\_url، و redirection\_url. الرد بيرجّع `client_secret`.
3. نحوّل الطالب لصفحة Unified Checkout بالـ Public key والـ client\_secret.
4. الـ Webhook يتحقق من الـ HMAC. ولو العملية نجحت، يسجل الدفعة ويفعّل الباقة، ويبقى Idempotent على رقم العملية.
5. صفحة الـ Redirection تتحقق من الـ HMAC وتعرض النتيجة. لو الـ Webhook ماوصلش، هي اللي تفعّل الباقة كخطة احتياطية.

المراجع: [Create Intention](https://developers.paymob.com/paymob-docs/developers/intention-apis/create-intention) · [Unified Checkout](https://developers.paymob.com/paymob-docs/developers/checkout-experiences/unified-checkout-redirection)

## 5. الـ MVP والتقنية والـ AI

**المتطلبات:** أي حاجة P0 لازم تشتغل قبل الـ Payment Gate، و P1 لو فضل وقت.

| # | المتطلب | الأولوية |
| --- | --- | --- |
| F1 | تسجيل بالإيميل واختيار «سنة امتحاني» | P0 |
| F2 | خريطة 3 دروس: الأول مجاني، والتاني والتالت مقفولين | P0 |
| F3 | محرك الدرس: 6 كروت ثابتة (توقّع، ثم مهمة في المحاكاة، ثم شرح، ثم سؤال فكرة، ثم سؤال امتحان، ثم خلاصة)، والمحتوى JSON | P0 |
| F4 | محاكاة قانون أوم: Slider للجهد (0 لـ 24 V) وللمقاومة (1 لـ 12 Ω)، واللمبة بتنوّر و I = V/R | P0 |
| F5 | شرح الغلطة بالـ AI | P0 |
| F6 | الـ Paywall: العرض الحالي وسعره وتاريخ نهايته وعدد الشهور | P0 |
| F7 | الدفع على Paymob (قسم 4) | P0 |
| F8 | صفحة «اشتراكي»: الباقة، وتاريخ النهاية، وسجل المدفوعات | P0 |
| F9 | مسائل بنظام الامتحان بيولّدها الـ AI، للمشتركين بس | P1 |
| F10 | Streak و XP (مش بتتباع) | P1 |
| F11 | زرار مخفي بيغيّر «النهارده» عشان الحكام يشوفوا السعر بيتغير | P1 |
| F12 | صفحات السياسات وبيانات التواصل | P1 |

**التقنية:** Next.js (App Router) و TypeScript و Tailwind، والواجهة عربي RTL ومتظبطة على الموبايل الأول. الداتا والتسجيل على Supabase (Postgres + Auth)، والنشر على Cloudflare Workers عن طريق OpenNext. المفاتيح السرية بـ wrangler secret، والتحقق من الـ HMAC بـ Web Crypto. والـ Webhook بتاع Paymob Supabase Edge Function.

| الجدول | الأعمدة |
| --- | --- |
| profiles | id, name, education\_system, grade, track, exam\_cohort, payer, parent\_phone, xp, streak, last\_active\_date |
| lessons | id, subject, chapter, order, is\_free, content (JSON) |
| attempts | user\_id, lesson\_id, card\_id, answer, is\_correct, sim\_state (JSON), prediction, hints\_used, ai\_feedback |
| progress | user\_id, lesson\_id, concept, mastered, review\_due |
| subscriptions | user\_id, cohort, plan, status, current\_period\_end |
| payments | id, user\_id, paymob\_transaction\_id (unique), amount\_cents, plan, success, raw (JSON) |

**الـ APIs:** `GET /api/offer` · `POST /api/checkout` · Supabase Edge Function `paymob-webhook` · `GET /billing/result` · `POST /api/tutor/explain` · `POST /api/practice/generate`

**متغيرات البيئة:** `PAYMOB_SECRET_KEY` · `PAYMOB_PUBLIC_KEY` · `PAYMOB_CARD_INTEGRATION_ID` · `PAYMOB_HMAC_SECRET` · `AI_API_KEY` · `APP_URL` · مفاتيح Supabase

**3 مشاكل في Supabase لازم نخلي بالنا منها**

- نقفل Confirm email من إعدادات Auth، وإلا الديمو هيقف على تأكيد الإيميل.
- لو الـ RLS شغال من غير Policies، الـ Queries هترجع فاضية من غير Error. الحل: الكتابة من السيرفر بالـ Service role key، والقراية من الفرونت بـ Policies بسيطة.
- الـ Service role key والـ Secret key بتاع Paymob يفضلوا على السيرفر بس، ومايظهروش في الفرونت أبدًا.

**تصميم الـ AI**

- **شرح الغلطة (F5):** المدخل هو السؤال، والإجابة الصح، وإجابة الطالب، وقيم المحاكاة (V و R). المخرج JSON بالشكل ده `{diagnosis, hint, try_in_sim}`: بالعامية، وفي 3 سطور بحد أقصى، ومن غير ما يقول الإجابة النهائية.
- **المسائل (F9):** 3 أسئلة اختيار من متعدد، كل واحد معاه الحل خطوة بخطوة. الكود بيحسب الناتج بنفسه بقانون أوم ويقارنه بإجابة الـ AI، وأي مسألة مش مظبوطة ماتظهرش.
- **الحماية:** لو شكل الـ JSON فشل، نعيد مرة واحدة، وبعدها نرجع لشرح جاهز مكتوب مسبقًا. ونخزّن (Cache) ردود أشهر الغلطات عشان الديمو يفضل سريع. ومبنبعتش للـ AI أي بيانات شخصية للطالب.

## 6. الشاشات وبرومبت Claude Code

عملنا Wireframes لـ 8 شاشات موبايل (390×844)، عربي RTL، ولونها الأساسي أزرق `#2F5BEA`. الشاشات بالترتيب:

1. **التسجيل:** العنوان «افهم الفيزيا بإيدك، مش بالحفظ»، وحقول الاسم والإيميل وكلمة السر، واختيار سنة الامتحان (2027 / 2028)، وزرار «ابدأ الدرس المجاني».
2. **خريطة الدروس:** ترحيب بالاسم، و Streak و XP، وتبويبات المواد (فيزيا، والباقي «قريبًا»)، والفصل 1 بشريط تقدم. الدرس 1 مجاني ومعاه زرار «ابدأ»، والدرسين 2 و3 عليهم قفل. وتحت شريط تنقل (الدروس، التقدم، حسابي).
3. **المحاكاة:** شريط تقدم (كارت 2 من 5)، والعنوان «حرّك الجهد وشوف اللمبة». رسم دايرة فيه بطارية ومقاومة ولمبة وأميتر، وقراءة «I = 2.0 A»، و Slider للجهد وللمقاومة، وملاحظة، وزرار «كمّل للسؤال».
4. **السؤال والمدرس الذكي:** السؤال «12 فولت و 6 أوم، التيار؟» والاختيارات 72 و 2 و 0.5 و 18 أمبير. الطالب اختار 72 غلط، وكارت المدرس الذكي بيقول «إنت ضربت الجهد في المقاومة…» ومعاه «جرّب: زوّد المقاومة لـ 12». وتحت زرارين «ارجع للمحاكاة» و «جاوب تاني».
5. **الـ Paywall:** العنوان «كمّل لحد آخر امتحان»، وباقة الثانوية العامة 2027 بـ 799 ج دفعة واحدة، و«ساري حتى 31 أغسطس 2027»، و4 مميزات. ومعاها ضمان الـ 14 يوم، وزرار «اشترك بـ 799 ج»، و «مش دلوقتي».
6. **صفحة الدفع:** شاشة مؤقتة مكان صفحة Paymob الجاهزة (Unified Checkout). احنا مش بنصممها، بس بنحوّل ليها.
7. **تم الاشتراك:** العنوان «تم الاشتراك، واللمبة نوّرت»، وإيصال فيه الباقة والمبلغ والتاريخ ورقم العملية، وزرار «ابدأ درس قانون أوم».
8. **اشتراكي:** كارت الباقة وحالتها «سارية»، والفترة من 24 أكتوبر 2026 لحد 31 أغسطس 2027 مع شريط تقدم، وسجل المدفوعات. ولينكات: طلب استرجاع، والسياسات، وتواصل معانا.

**واتضافت 6 شاشات Onboarding قبل التسجيل:** الترحيب، ونظام الدراسة، والسنة والشعبة (سنة الامتحان بتتحسب لوحدها)، والمواد (ومعاها البرمجة قريبًا)، وولي الأمر، وقائمة الانتظار للأنظمة التانية. وشاشة التسجيل بقت «آخر خطوة: اعمل حسابك» وبتعرض ملخص الإجابات.

**دورة الدرس (اتقررت):** كل درس 6 كروت ثابتة، حوالي 6 دقايق. الطالب بيتوقّع ويجرّب قبل الشرح.

1. مقدمة + توقّع (من غير درجات، التوقّع بيتخزن).
2. مهمة في المحاكاة: «خلّي التيار 2 أمبير بالظبط».
3. الشرح: بيربط بالتوقّع، وبعدين I = V / R.
4. اختبر فهمك: سؤال فكرة.
5. سؤال امتحان بمحاولتين.
6. الخلاصة: الإتقان و XP و Streak، وبعدين الدرس التالي أو الـ Paywall.

لو الإجابة غلط: المدرس الذكي يشرح الغلطة من غير ما يقول الإجابة، وزرار يفتح المحاكاة بأرقام السؤال، وبعدين محاولة تانية، ولو غلط تاني يظهر الحل خطوة بخطوة والمفهوم يتعلّم «محتاج مراجعة». المفهوم يتحسب «اتفهم» بس لما يتجاوب صح من غير الحل. التفاصيل في الـ PRD («دورة الدرس»).

**البرومبت الجاهز لـ Claude Code** (الفريق بيبني بيه):

```text
We are building Lamba (لمبة) for a 4-hour hackathon (Paymob x ALX EdTech Build Night).
Interactive Arabic-first (RTL, mobile-first) learning platform for Egyptian Thanaweya Amma students:
interactive simulations + an AI tutor that explains each student's own mistake.
Scope: Physics, chapter "Electric current & Ohm's law", 3 lessons (lesson 1 free, 2-3 paid).

Stack: Next.js (App Router) + TypeScript + Tailwind + Supabase (auth + Postgres). Deploy on Cloudflare Workers via OpenNext (@opennextjs/cloudflare). Secrets via wrangler; verify HMAC with Web Crypto.
Use Supabase Edge Functions for the Paymob webhook and Postgres functions for idempotent writes.

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
ONBOARDING (before sign-up): welcome; education system (Thanaweya Amma available; Egyptian Baccalaureate, Azhar, IGCSE, American Diploma, other = waitlist); grade + track (exam year computed: grade 3 = 2027); subjects of interest (physics live; others + programming Scratch/Python = coming soon); payer + optional parent phone.
Tables: profiles (+ education_system, grade, track, exam_cohort, payer, parent_phone), lessons, attempts, subscriptions, payments, waitlist, interests.
Use the Paymob skill/docs for exact endpoints and HMAC field order. Never expose secret keys.

Also: footer pages About, Privacy, Refund, Return; contact phone/email; real prices.
Build the payment flow FIRST, then give me a test checklist.
```

## 7. حالة الشغل والخطوات الجاية

التخطيط خلص: الخطة، والـ PRD، والـ Wireframes. الكود لسه مابدأش، وده اللي محتاجين نشتغل عليه دلوقتي.

**اللي اتعمل**

- [x] تحليل متطلبات المسابقة، والعصف الذهني، والرود ماب
- [x] اختيار الفكرة وموديل باقة دفعة الامتحان
- [x] PRD كامل
- [x] Wireframes لـ 8 شاشات
- [x] اختيار Supabase

**الخطوات الجاية بالترتيب**

1. التسجيل في Paymob وناخد الـ Sandbox keys، ونسجل الحساب في فورم الإيفنت بنفس البيانات بالظبط.
2. نعمل مشروع Supabase والجداول، ونقفل Confirm email.
3. Claude Code يعمل الهيكل الأساسي بالبرومبت اللي في قسم 6، وننشر على Cloudflare Workers على طول.
4. نشغّل الدفع من الأول للآخر بكارت الاختبار.
5. نبني الدروس والمحاكاة والمدرس الذكي ورا الـ Paywall.
6. تجميد الفيتشرز، وبعده Payment Gate، وبروفة الـ Pitch.

**الأدوار:** A الدفع والباك إند · B الـ AI · C الدروس والمحاكاة · D الـ Pitch والبزنس وصفحات السياسات.

**الأسئلة المفتوحة**

- [x] اسم المنتج اتقفل: لمبة (Lamba)
- [ ] نسأل Paymob: الباقة اللي بتتدفع مرة واحدة بتتحسب «اشتراك» لو سجلنا بالبطاقة بس؟
- [ ] الأسعار النهائية
- [ ] تاريخ نهاية دفعة 2027 بعد ما جدول الامتحانات يتعلن

**أسئلة متوقعة من الحكام**

- «الطالب بيدفع سنة واحدة بس، هتكسبوا إزاي؟» ← نتوسع لأولى وتانية ثانوي، ونجيب طلاب بتكلفة قليلة عن طريق ترشيح الطلاب لبعض والسناتر.
- «الاشتراك بيتجدد أوتوماتيك؟» ← لأ، دي دفعة واحدة للسنة. والتقسيط و BNPL هنفعّلهم بعد ما نشتغل على الحساب الحقيقي.
- «الفرق بينكم وبين ChatGPT أو Brilliant؟» ← احنا على المنهج المصري وبالعربي، والمدرس الذكي شايف الطالب عمل إيه في المحاكاة.
- «بيانات القُصّر؟» ← ولي الأمر هيبقى صاحب الحساب، وبنجمع أقل داتا ممكنة، ومفيش بيانات شخصية بتروح للـ AI.
