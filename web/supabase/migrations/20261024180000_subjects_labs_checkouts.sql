-- Four-subject vision (docs/labs-handover-v2.md): subjects and streams on lessons,
-- lab state tables for the AI-controlled labs, and a checkouts table that binds
-- each Paymob order to the user who started it.

-- Streams: علمي علوم = science, علمي رياضة = math.
-- (أدبي students go to the waitlist for now, so track stays null for them.)
alter table public.profiles
  add constraint profiles_track_check check (track is null or track in ('science', 'math')),
  add column parent_name text;

alter table public.lessons
  add column streams text[] not null default '{science,math}',
  add column lab_type text check (lab_type in ('circuit', 'titration', 'sarcomere', 'integral')),
  add column status text not null default 'live' check (status in ('live', 'coming_soon'));

grant select (streams, lab_type, status) on public.lessons to anon, authenticated;

-- Reseed with the lesson IDs from the labs handover. No student data exists yet.
delete from public.lessons where id in ('ohm-1', 'ohm-2', 'ohm-3');

insert into public.lessons (id, subject, chapter, "order", title, is_free, streams, lab_type, status, content) values
  ('phy_s3_electric_current_ohm', 'physics', 'التيار الكهربي وقانون أوم', 1,
   'خلّي الكهرباء تمشي قدامك — قانون أوم', true, '{science,math}', 'circuit', 'live',
   '{"placeholder": true, "cards": []}'),
  ('phy_s3_series_parallel', 'physics', 'التيار الكهربي وقانون أوم', 2,
   'التوصيل على التوالي والتوازي', false, '{science,math}', 'circuit', 'live',
   '{"placeholder": true, "cards": []}'),
  ('phy_s3_kirchhoff', 'physics', 'التيار الكهربي وقانون أوم', 3,
   'قانونا كيرشوف', false, '{science,math}', 'circuit', 'live',
   '{"placeholder": true, "cards": []}'),
  ('chem_s3_volumetric_titration', 'chemistry', 'التحليل الكيميائي', 1,
   'عاير المحلول بإيدك واكتشف تركيزه', false, '{science,math}', 'titration', 'coming_soon',
   '{"placeholder": true, "cards": []}'),
  ('bio_s3_muscle_sarcomere', 'biology', 'الدعامة والحركة', 1,
   'شوف العضلة بتنقبض إزاي من جوّه', false, '{science}', 'sarcomere', 'coming_soon',
   '{"placeholder": true, "cards": []}'),
  ('math_s3_definite_integral', 'mathematics', 'التكامل المحدد وتطبيقاته', 1,
   'حرّك حدود التكامل وشوف المساحة بتتغير', false, '{math}', 'integral', 'coming_soon',
   '{"placeholder": true, "cards": []}')
on conflict (id) do nothing;

-- Lab state: one canonical state per student and lesson, versioned so chat and
-- direct manipulation never overwrite each other. Only the server writes.
create table public.lab_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  lesson_id text not null references public.lessons on delete cascade,
  subject text not null,
  state jsonb not null default '{}'::jsonb,
  revision int not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.lab_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.lab_sessions on delete cascade,
  source text not null check (source in ('ui', 'ai')),
  action jsonb not null,
  observation jsonb,
  revision_before int not null,
  revision_after int not null,
  created_at timestamptz not null default now()
);

create index lab_events_session_idx on public.lab_events (session_id, created_at);

alter table public.lab_sessions enable row level security;
alter table public.lab_events enable row level security;

create policy "lab_sessions: read own" on public.lab_sessions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "lab_events: read own" on public.lab_events
  for select to authenticated using (
    exists (select 1 from public.lab_sessions s where s.id = session_id and s.user_id = (select auth.uid()))
  );

-- Checkouts: written by /api/checkout when a Paymob intention is created.
-- The webhook and the redirect page look the payment up here by the HMAC-covered
-- order id, so an edited merchant_order_id can't move a payment to another user.
create table public.checkouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  cohort text not null,
  plan text not null,
  amount_cents integer not null check (amount_cents > 0),
  special_reference text not null unique,
  paymob_order_id text unique,
  paymob_intention_id text,
  created_at timestamptz not null default now()
);

-- No policies: only the service role reads or writes checkouts.
alter table public.checkouts enable row level security;
