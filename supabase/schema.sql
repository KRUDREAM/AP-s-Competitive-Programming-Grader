-- ==============================================================================
-- CP Grader: Database Schema & Row-Level Security for Supabase (PostgreSQL)
-- Supports C / C++ Competitive Programming, Realtime Leaderboard & Community Hub
-- ==============================================================================

-- 1. PROFILES TABLE (Users & Students)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  name text not null,
  avatar_url text,
  rating integer default 1200,
  tier text default 'Newbie',
  school text,
  role text default 'student' check (role in ('student', 'admin')),
  weekly_xp integer default 0,
  total_xp integer default 0,
  level integer default 1,
  streak_days integer default 1,
  created_at timestamp with time zone default now()
);

-- 2. PROBLEMS TABLE (Verified & Community Problems)
create table if not exists public.problems (
  id text primary key,
  title text not null,
  slug text unique not null,
  difficulty text not null check (difficulty in ('Beginner', 'Easy', 'Medium', 'Hard', 'POSN / Olympic')),
  category text not null,
  statement jsonb not null, -- { description, inputFormat, outputFormat, constraints, notes }
  time_limit_ms integer default 1000,
  memory_limit_mb integer default 64,
  samples jsonb default '[]'::jsonb, -- array of { input, output, explanation }
  author_name text not null,
  author_handle text not null,
  verification_status text default 'pending' check (verification_status in ('verified', 'pending', 'rejected')),
  admin_feedback text,
  solved_count integer default 0,
  total_submissions integer default 0,
  tags text[] default array[]::text[],
  is_weekly_task boolean default false,
  starter_code jsonb default '{"cpp": "", "c": ""}'::jsonb,
  created_at timestamp with time zone default now()
);

-- 3. TEST CASES TABLE (Hidden & Public Test Cases for Grader)
create table if not exists public.test_cases (
  id serial primary key,
  problem_id text references public.problems(id) on delete cascade,
  input text not null,
  output text not null,
  is_hidden boolean default true,
  weight integer default 25,
  explanation text
);

-- 4. SUBMISSIONS TABLE (C/C++ Code Submissions & Verdicts)
create table if not exists public.submissions (
  id text primary key default gen_random_uuid()::text,
  problem_id text references public.problems(id) on delete cascade,
  problem_title text not null,
  user_handle text not null,
  user_name text not null,
  language text not null check (language in ('cpp', 'c')),
  code text not null,
  status text not null check (status in ('AC', 'WA', 'TLE', 'RTE', 'CE', 'Running')),
  score integer default 0,
  execution_time_ms integer default 0,
  memory_used_kb integer default 0,
  test_results jsonb default '[]'::jsonb,
  compile_error text,
  submitted_at timestamp with time zone default now()
);

-- 5. QUESTS & GAMIFICATION TABLE
create table if not exists public.quests (
  id text primary key,
  type text not null check (type in ('daily', 'weekly', 'achievement')),
  title text not null,
  description text not null,
  target integer default 1,
  progress integer default 0,
  xp_reward integer default 100,
  completed boolean default false,
  claimed boolean default false,
  icon text default '⚡'
);

-- 6. DISCUSSIONS TABLE (Q&A Community Forum)
create table if not exists public.discussions (
  id text primary key default gen_random_uuid()::text,
  problem_id text,
  problem_title text,
  title text not null,
  content text not null,
  code_snippet text,
  language text default 'cpp',
  category text not null,
  author_name text not null,
  author_handle text not null,
  author_avatar_url text,
  author_role text default 'student',
  author_school text,
  upvotes integer default 0,
  is_solved boolean default false,
  created_at timestamp with time zone default now()
);

-- 7. DISCUSSION REPLIES TABLE
create table if not exists public.discussion_replies (
  id text primary key default gen_random_uuid()::text,
  discussion_id text references public.discussions(id) on delete cascade,
  author_name text not null,
  author_handle text not null,
  author_avatar_url text,
  author_role text default 'student',
  content text not null,
  code_snippet text,
  is_accepted boolean default false,
  upvotes integer default 0,
  created_at timestamp with time zone default now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.problems enable row level security;
alter table public.test_cases enable row level security;
alter table public.submissions enable row level security;
alter table public.quests enable row level security;
alter table public.discussions enable row level security;
alter table public.discussion_replies enable row level security;

-- Profiles: Public read, User can update own profile
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (true);
create policy "Users can insert profiles" on public.profiles for insert with check (true);

-- Problems: Anyone can read verified AND pending problems (Community problems are open!)
create policy "Problems viewable by everyone" on public.problems for select using (true);
create policy "Anyone can submit community problems" on public.problems for insert with check (true);
create policy "Admins can update problems" on public.problems for update using (true);

-- Test cases: Public read for execution in grader
create policy "Testcases viewable for grading" on public.test_cases for select using (true);
create policy "Anyone can insert test cases" on public.test_cases for insert with check (true);

-- Submissions: Public read leaderboard/audit, Users can insert
create policy "Submissions viewable by everyone" on public.submissions for select using (true);
create policy "Users can submit code" on public.submissions for insert with check (true);

-- Discussions & Replies: Public read & insert
create policy "Discussions viewable by everyone" on public.discussions for select using (true);
create policy "Anyone can ask questions" on public.discussions for insert with check (true);
create policy "Discussions can be updated" on public.discussions for update using (true);

create policy "Replies viewable by everyone" on public.discussion_replies for select using (true);
create policy "Anyone can post replies" on public.discussion_replies for insert with check (true);
create policy "Replies can be updated" on public.discussion_replies for update using (true);

-- Quests: Public read & update
create policy "Quests viewable by everyone" on public.quests for select using (true);
create policy "Quests updatable" on public.quests for update using (true);
