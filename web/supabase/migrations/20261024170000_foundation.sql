-- Foundation schema: profiles, lessons, learning data, subscriptions, onboarding.
-- RLS is on everywhere. Subscriptions and payments are written only by the service role.

-- One profile per auth user, created on signup by the trigger below.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text,
  phone text,
  education_system text not null default 'thanaweya_amma',
  grade int,
  track text,
  exam_cohort text not null default '2027',
  payer text,
  parent_phone text,
  xp int not null default 0,
  streak int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

revoke execute on function public.handle_new_user from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lesson content is JSON, not code.
create table public.lessons (
  id text primary key,
  subject text not null,
  chapter text not null,
  "order" int not null,
  title text not null,
  is_free boolean not null default false,
  content jsonb not null default '{}'::jsonb
);

create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  lesson_id text not null references public.lessons on delete cascade,
  card_id text not null,
  answer text,
  is_correct boolean,
  sim_state jsonb,
  prediction text,
  hints_used int not null default 0,
  ai_feedback jsonb,
  created_at timestamptz not null default now()
);

create index attempts_user_lesson_idx on public.attempts (user_id, lesson_id);

create table public.progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  lesson_id text not null references public.lessons on delete cascade,
  concept text not null,
  mastered boolean not null default false,
  review_due date,
  primary key (user_id, lesson_id, concept)
);

-- One pass per student per exam cohort.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  cohort text not null,
  plan text not null,
  status text not null,
  current_period_end timestamptz not null,
  payment_id uuid references public.payments,
  unique (user_id, cohort)
);

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  contact text not null,
  education_system text not null,
  created_at timestamptz not null default now()
);

create table public.interests (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  subject text not null,
  primary key (user_id, subject)
);

-- Payments now belong to a user (null for old anonymous/mock rows).
alter table public.payments
  add constraint payments_user_id_fkey foreign key (user_id) references auth.users on delete set null;

create index payments_user_id_idx on public.payments (user_id);

-- Row level security.
alter table public.profiles enable row level security;
alter table public.lessons enable row level security;
alter table public.attempts enable row level security;
alter table public.progress enable row level security;
alter table public.subscriptions enable row level security;
alter table public.waitlist enable row level security;
alter table public.interests enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "lessons: readable by everyone" on public.lessons
  for select to anon, authenticated using (true);

create policy "attempts: read own" on public.attempts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "attempts: insert own" on public.attempts
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "progress: read own" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "progress: insert own" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "interests: read own" on public.interests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "interests: insert own" on public.interests
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "subscriptions: read own" on public.subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "payments: read own" on public.payments
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "waitlist: anyone can join" on public.waitlist
  for insert to anon, authenticated with check (true);
