-- Run this in Supabase SQL Editor before relying on receipt files,
-- full placement-test history, assignment text, or detailed test review.

alter table public.courses
  add column if not exists language text,
  add column if not exists duration text,
  add column if not exists students integer default 0,
  add column if not exists color text;

alter table public.course_applications
  add column if not exists amount numeric,
  add column if not exists receipt_file_name text,
  add column if not exists receipt_url text,
  add column if not exists student_note text;

alter table public.payment_receipts
  add column if not exists book_id uuid,
  add column if not exists book_order_id uuid,
  add column if not exists file_name text,
  add column if not exists file_url text,
  add column if not exists receipt_file_url text,
  add column if not exists storage_bucket text,
  add column if not exists storage_path text,
  add column if not exists created_at timestamptz default now();

alter table public.books
  add column if not exists language text,
  add column if not exists cover_color text,
  add column if not exists file_name text;

alter table public.book_orders
  add column if not exists amount numeric,
  add column if not exists receipt_file_name text,
  add column if not exists receipt_url text,
  add column if not exists admin_note text,
  add column if not exists reviewed_at timestamptz;

alter table public.lessons
  add column if not exists status text default 'available',
  add column if not exists released_at timestamptz,
  add column if not exists file_name text,
  add column if not exists sort_order integer default 0;

alter table public.assignments
  add column if not exists status text default 'available',
  add column if not exists file_name text,
  add column if not exists released_at timestamptz,
  add column if not exists sort_order integer default 0;

alter table public.assignment_submissions
  add column if not exists submission_text text,
  add column if not exists file_name text,
  add column if not exists status text default 'submitted',
  add column if not exists updated_at timestamptz default now();

alter table public.course_tests
  add column if not exists status text default 'available',
  add column if not exists released_at timestamptz,
  add column if not exists sort_order integer default 0;

alter table public.course_test_questions
  add column if not exists type text default 'mcq',
  add column if not exists correct_answer text,
  add column if not exists sort_order integer default 0,
  add column if not exists created_at timestamptz default now();

alter table public.course_test_options
  add column if not exists sort_order integer default 0,
  add column if not exists created_at timestamptz default now();

alter table public.course_test_attempts
  add column if not exists status text default 'graded',
  add column if not exists created_at timestamptz default now();

alter table public.course_test_answers
  add column if not exists student_answer text,
  add column if not exists correct_answer text,
  add column if not exists created_at timestamptz default now();

alter table public.post_comments
  add column if not exists user_name text,
  add column if not exists parent_id uuid;

alter table public.course_reviews
  add column if not exists student_name text;

alter table public.placement_attempts
  add column if not exists language text,
  add column if not exists total integer,
  add column if not exists questions jsonb,
  add column if not exists answers jsonb,
  add column if not exists started_at timestamptz,
  add column if not exists finished_at timestamptz,
  add column if not exists created_at timestamptz default now();

alter table public.placement_questions
  add column if not exists language text,
  add column if not exists type text default 'mcq',
  add column if not exists correct_answer text,
  add column if not exists status text default 'available',
  add column if not exists sort_order integer default 0,
  add column if not exists created_at timestamptz default now();

alter table public.placement_answers
  add column if not exists attempt_id uuid,
  add column if not exists question_id uuid,
  add column if not exists student_answer text,
  add column if not exists correct_answer text,
  add column if not exists is_correct boolean,
  add column if not exists created_at timestamptz default now();

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

alter table public.payment_receipts enable row level security;

drop policy if exists "Students can read own payment receipts" on public.payment_receipts;
create policy "Students can read own payment receipts"
on public.payment_receipts
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "Students can create own payment receipts" on public.payment_receipts;
create policy "Students can create own payment receipts"
on public.payment_receipts
for insert
to authenticated
with check (student_id = auth.uid());

drop policy if exists "Students can upload own payment receipt files" on storage.objects;
drop policy if exists "Students can update own receipt files" on storage.objects;
drop policy if exists "Students can upload own receipt files" on storage.objects;
create policy "Students can upload own receipt files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

create policy "Students can update own receipt files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
)
with check (
  bucket_id = 'receipts'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Students can read own payment receipt files" on storage.objects;
drop policy if exists "Students can read own receipt files" on storage.objects;
create policy "Students can read own receipt files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'receipts'
  and auth.uid() is not null
  and split_part(name, '/', 1) = auth.uid()::text
);

-- Public bucket for profile pictures. avatar_url points at objects in here.
insert into storage.buckets (id, name, public)
values ('pdp', 'pdp', true)
on conflict (id) do nothing;

-- Let a logged-in user manage only their own avatar folder (pdp/<uid>/...).
drop policy if exists "pdp read" on storage.objects;
create policy "pdp read" on storage.objects
  for select using (bucket_id = 'pdp');

drop policy if exists "pdp write own" on storage.objects;
create policy "pdp write own" on storage.objects
  for insert with check (
    bucket_id = 'pdp' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "pdp update own" on storage.objects;
create policy "pdp update own" on storage.objects
  for update using (
    bucket_id = 'pdp' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Profile mirror of auth.users so the admin side can query students directly.
-- Passwords are NOT stored here: Supabase Auth hashes and keeps them in
-- auth.users.encrypted_password. This table only holds queryable profile data.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  phone text,
  avatar_url text,
  role text default 'student',
  current_level text default 'A1',
  created_at timestamptz default now()
);

alter table public.users enable row level security;

-- A user can read/insert/update only their own profile row.
drop policy if exists "users read own" on public.users;
create policy "users read own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users upsert own" on public.users;
create policy "users upsert own" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users update own" on public.users;
create policy "users update own" on public.users
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, email, phone, avatar_url, role, current_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(new.raw_user_meta_data->>'current_level', 'A1')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
