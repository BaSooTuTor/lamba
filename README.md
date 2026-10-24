# لمبة (Lamba) · Paymob × ALX EdTech Build Night

منصة تعلّم تفاعلية بالعربي لطلاب الثانوية العامة (فرتكال 01 · High-stakes exam prep). بتبسّط الفيزيا بمحاكاة يلعبوا بيها، ومدرس AI بيشرح لكل طالب غلطته هو. والطالب بيدفع مرة واحدة على Paymob باقة سارية لحد آخر امتحانات دفعته.

## محتوى الـ Repo

| المسار | المحتوى |
| --- | --- |
| [`docs/PRD.md`](docs/PRD.md) | الـ PRD الكامل: المستخدمين، والنطاق، والمتطلبات، والتسعير، والتقنية، والـ AI، والمخاطر |
| [`docs/handover-chatgpt.md`](docs/handover-chatgpt.md) | ملف Handover كامل لوحده، تلصقه في ChatGPT أو أي مساعد تاني يكمّل منه |
| [`docs/user-journey.png`](docs/user-journey.png) | رحلة الطالب في الديمو |
| [`plan/index.html`](plan/index.html) | خطة الفريق: القواعد، والعصف الذهني، والرود ماب، والـ Payment Gate Checklist |
| [`prompts/claude-code.md`](prompts/claude-code.md) | البرومبتات الجاهزة لـ Claude Code |
| [`wireframes/`](wireframes/) | 8 شاشات Wireframes من Claude Design |

## الخلاصة في سطور

- **المشكلة:** الطالب بيحفظ من غير ما يفهم، وبيذاكر لوحده من غير ما حد يصحح له. فالأهل بيدفعوا دروس خصوصي.
- **الحل:** محاكاة تفاعلية على المنهج المصري، ومدرس AI بيشرح الغلطة بناءً على اللي الطالب عمله في المحاكاة.
- **الدفع:** دفعة واحدة على Paymob Sandbox. الـ Sandbox مفيهوش Subscriptions، فالباقة بتفضل سارية لحد 31 أغسطس 2027، والدور التاني داخل فيها.
- **التقنية:** Next.js و TypeScript و Tailwind و Supabase (Postgres و Auth و Edge Functions)، والنشر على Cloudflare Workers بـ OpenNext.
