-- ═══════════════════════════════════════════════════════════════════════════
-- OrchillaLand — schema for the admin dashboard (and student app).
-- Run in the Supabase SQL editor. Single instructor = admin (users.role='admin').
-- ═══════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── users (profile mirror of auth.users) ───────────────────────────────────
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  password_hash text,          -- managed by Supabase Auth; kept for schema parity
  phone text,
  avatar_url text,
  role text default 'student',  -- 'student' | 'admin'
  current_level text default 'A1',
  created_at timestamptz default now()
);

-- ── languages ───────────────────────────────────────────────────────────────
create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  flag_url text,
  color text
);

-- ── courses ─────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  language_id uuid references public.languages (id),
  created_by uuid references public.users (id),
  title text not null,
  description text,
  type text,                    -- group | vip | conversation | practice
  level text,
  duration_weeks int,
  price numeric default 0,
  status text default 'available', -- available | not_available | archived
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── course_applications ─────────────────────────────────────────────────────
create table if not exists public.course_applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.users (id),
  course_id uuid references public.courses (id),
  status text default 'pending_payment', -- pending_payment | pending_approval | approved | denied
  admin_note text,
  created_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users (id)
);

-- ── payment_receipts ────────────────────────────────────────────────────────
-- receipt_image holds the PUBLIC URL of the uploaded image (bucket 'receipts').
-- Never store the raw file or only a filename here.
create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.course_applications (id) on delete cascade,
  student_id uuid references public.users (id),
  course_id uuid references public.courses (id),
  receipt_image text,           -- Supabase Storage public URL
  amount numeric,
  status text default 'pending', -- pending | approved | denied
  user_note text,               -- optional message from the student
  uploaded_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.users (id)
);

-- ── enrollments (created only after approval) ───────────────────────────────
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.users (id),
  course_id uuid references public.courses (id),
  application_id uuid references public.course_applications (id),
  status text default 'active', -- active | completed | suspended | denied
  progress_percent int default 0,
  final_grade numeric,
  enrolled_at timestamptz default now(),
  completed_at timestamptz
);

-- ── lessons / lesson_access ─────────────────────────────────────────────────
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  file_url text,
  position int,
  is_published boolean default false,
  release_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.lesson_access (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.enrollments (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  status text default 'available', -- locked | available | completed
  released_at timestamptz,
  completed_at timestamptz
);

-- ── assignments ─────────────────────────────────────────────────────────────
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  title text not null,
  description text,
  file_url text,
  due_at timestamptz,
  is_published boolean default true,
  created_by uuid references public.users (id)
);

create table if not exists public.assignment_releases (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments (id) on delete cascade,
  enrollment_id uuid references public.enrollments (id) on delete cascade,
  released_at timestamptz default now(),
  due_at timestamptz
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid references public.assignments (id) on delete cascade,
  enrollment_id uuid references public.enrollments (id),
  student_id uuid references public.users (id),
  answer_text text,
  file_url text,
  grade numeric,
  feedback text,
  submitted_at timestamptz default now(),
  graded_at timestamptz
);

-- ── course tests ─────────────────────────────────────────────────────────────
create table if not exists public.course_tests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  title text not null,
  description text,
  total_points int,
  is_published boolean default false,
  created_by uuid references public.users (id)
);

create table if not exists public.course_test_questions (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.course_tests (id) on delete cascade,
  question text,
  question_type text, -- mcq | text
  points int default 10,
  position int
);

create table if not exists public.course_test_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.course_test_questions (id) on delete cascade,
  option_text text,
  is_correct boolean default false,
  position int
);

create table if not exists public.course_test_releases (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.course_tests (id) on delete cascade,
  enrollment_id uuid references public.enrollments (id) on delete cascade,
  released_at timestamptz,
  due_at timestamptz
);

create table if not exists public.course_test_attempts (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.course_tests (id) on delete cascade,
  enrollment_id uuid references public.enrollments (id),
  student_id uuid references public.users (id),
  score numeric,
  total_points int,
  grade_percent int,
  submitted_at timestamptz default now()
);

create table if not exists public.course_test_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.course_test_attempts (id) on delete cascade,
  question_id uuid references public.course_test_questions (id),
  selected_option_id uuid references public.course_test_options (id),
  text_answer text,
  is_correct boolean,
  points_awarded numeric
);

-- ── books ─────────────────────────────────────────────────────────────────
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric default 0,
  file_url text,
  cover_url text,
  status text default 'available', -- available | not_available
  created_by uuid references public.users (id),
  created_at timestamptz default now()
);

create table if not exists public.book_orders (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.users (id),
  book_id uuid references public.books (id),
  status text default 'pending_payment', -- pending_payment | pending_approval | approved | denied
  created_at timestamptz default now()
);

create table if not exists public.book_payment_receipts (
  id uuid primary key default gen_random_uuid(),
  book_order_id uuid references public.book_orders (id) on delete cascade,
  receipt_file_url text,
  status text default 'pending', -- pending | approved | denied
  admin_note text,
  uploaded_at timestamptz default now(),
  reviewed_at timestamptz
);

-- ── posts / likes / comments ────────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users (id),
  title text not null,
  content text,
  image_url text,               -- cover (mirrors images[0])
  images jsonb default '[]',    -- all image URLs for the post
  is_published boolean default true,
  created_at timestamptz default now()
);

-- If the posts table already existed without `images`, add it:
alter table public.posts add column if not exists images jsonb default '[]';

create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  user_id uuid references public.users (id),
  created_at timestamptz default now()
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  user_id uuid references public.users (id),
  parent_comment_id uuid references public.post_comments (id),
  content text,
  created_at timestamptz default now()
);

-- ── reviews ─────────────────────────────────────────────────────────────────
create table if not exists public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses (id) on delete cascade,
  student_id uuid references public.users (id),
  enrollment_id uuid references public.enrollments (id),
  rating int,
  comment text,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- ── notifications ────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id),
  title text,
  message text,
  type text, -- payment | enrollment | lesson | test | assignment | post | comment
  related_type text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Storage: PUBLIC bucket `COVER` for admin uploads (covers, book/lesson files…).
-- ═══════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('COVER', 'COVER', true)
on conflict (id) do nothing;

-- Allow authenticated users (the admin) to upload; anyone can read (public bucket).
drop policy if exists "COVER read" on storage.objects;
create policy "COVER read" on storage.objects
  for select using (bucket_id = 'COVER');

drop policy if exists "COVER write" on storage.objects;
create policy "COVER write" on storage.objects
  for insert with check (bucket_id = 'COVER' and auth.role() = 'authenticated');

-- Book PDFs live in their own bucket `PDF` (covers use `COVER`).
insert into storage.buckets (id, name, public)
values ('PDF', 'PDF', true)
on conflict (id) do nothing;

drop policy if exists "PDF read" on storage.objects;
create policy "PDF read" on storage.objects
  for select using (bucket_id = 'PDF');

drop policy if exists "PDF write" on storage.objects;
create policy "PDF write" on storage.objects
  for insert with check (bucket_id = 'PDF' and auth.role() = 'authenticated');

-- Post images live in their own bucket `POSTS`.
insert into storage.buckets (id, name, public)
values ('POSTS', 'POSTS', true)
on conflict (id) do nothing;

drop policy if exists "POSTS read" on storage.objects;
create policy "POSTS read" on storage.objects
  for select using (bucket_id = 'POSTS');

drop policy if exists "POSTS write" on storage.objects;
create policy "POSTS write" on storage.objects
  for insert with check (bucket_id = 'POSTS' and auth.role() = 'authenticated');

-- Payment-receipt images live in their own bucket `receipts`.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

drop policy if exists "receipts read" on storage.objects;
create policy "receipts read" on storage.objects
  for select using (bucket_id = 'receipts');

-- Students upload their own receipts (authenticated).
drop policy if exists "receipts write" on storage.objects;
create policy "receipts write" on storage.objects
  for insert with check (bucket_id = 'receipts' and auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed languages.
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.languages (name, slug, color) values
  ('English', 'english', '#378ADD'),
  ('French', 'french', '#E85D26'),
  ('Italian', 'italian', '#D4537E'),
  ('Korean', 'korean', '#1D9E75')
on conflict do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- Create the admin:
--   1) Supabase Dashboard → Authentication → Add user (email + password).
--   2) Run the line below with that user's id to grant the admin role.
-- update public.users set role = 'admin' where email = 'you@example.com';
-- ═══════════════════════════════════════════════════════════════════════════

-- NOTE: enable Row Level Security and add policies appropriate to your app.
-- With the publishable (anon) key, reads/writes require policies that permit them.
