create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_admin boolean default false,
  reminder_times text[] default array['09:00', '14:00', '21:00'],
  membership_tier text default 'free',
  created_at timestamptz default now()
);

create table if not exists public.daily_feeds (
  id uuid primary key default gen_random_uuid(),
  feed_date date not null unique,
  title text not null,
  estimate_minutes int not null default 10,
  status text not null default 'published',
  created_at timestamptz default now()
);

create table if not exists public.feed_items (
  id uuid primary key default gen_random_uuid(),
  daily_feed_id uuid references public.daily_feeds(id) on delete cascade,
  category text not null,
  growth_route text not null,
  title text not null,
  node_label text not null,
  summary text not null,
  application text not null,
  body jsonb not null default '[]'::jsonb,
  source_url text,
  minutes int not null default 2,
  tags text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.pmp_questions (
  id uuid primary key default gen_random_uuid(),
  daily_feed_id uuid references public.daily_feeds(id) on delete cascade,
  question_type text not null check (question_type in ('single', 'multiple')),
  stem text not null,
  options jsonb not null,
  answer text[] not null,
  explanation text not null,
  knowledge_area text not null,
  disclaimer text not null default '非官方 PMP 真题，仅作练习',
  created_at timestamptz default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  feed_date date not null,
  feed_item_id uuid references public.feed_items(id) on delete cascade,
  pmp_question_id uuid references public.pmp_questions(id) on delete cascade,
  progress_type text not null check (progress_type in ('read', 'answered')),
  is_correct boolean,
  created_at timestamptz default now()
);

create unique index if not exists user_progress_read_once
on public.user_progress(user_id, feed_item_id, progress_type)
where feed_item_id is not null;

create unique index if not exists user_progress_answer_once
on public.user_progress(user_id, pmp_question_id, progress_type)
where pmp_question_id is not null;

create table if not exists public.wrong_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  pmp_question_id uuid references public.pmp_questions(id) on delete cascade,
  review_stage int not null default 1,
  next_review_at date not null,
  mastered boolean default false,
  created_at timestamptz default now()
);

create unique index if not exists wrong_questions_active_once
on public.wrong_questions(user_id, pmp_question_id)
where mastered = false;

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  checkin_date date not null,
  created_at timestamptz default now(),
  unique(user_id, checkin_date)
);

create table if not exists public.source_logs (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  status text not null,
  detail text,
  created_at timestamptz default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  estimated_cny numeric(8, 4) not null default 0,
  created_at timestamptz default now()
);

alter table public.user_profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.wrong_questions enable row level security;
alter table public.checkins enable row level security;

create policy "users can read own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.user_profiles for update using (auth.uid() = id);
create policy "users can read own progress" on public.user_progress for select using (auth.uid() = user_id);
create policy "users can write own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "users can read own wrong questions" on public.wrong_questions for select using (auth.uid() = user_id);
create policy "users can write own wrong questions" on public.wrong_questions for insert with check (auth.uid() = user_id);
create policy "users can read own checkins" on public.checkins for select using (auth.uid() = user_id);
create policy "users can write own checkins" on public.checkins for insert with check (auth.uid() = user_id);
create policy "users can update own checkins" on public.checkins for update using (auth.uid() = user_id);
