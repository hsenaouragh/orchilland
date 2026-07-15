-- Run in the Supabase SQL editor.
-- Lets a logged-in student submit an assignment (written answer and/or file)
-- and lets the admin read/grade it. Without these, the file uploads to the
-- "submissions" bucket but the row insert is rejected by RLS (42501).

-- Admin check (safe to re-run; also defined in payments_rls.sql).
create or replace function public.is_course_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- ── assignment_submissions ───────────────────────────────────────────────────
alter table public.assignment_submissions enable row level security;

drop policy if exists "asub read own or admin" on public.assignment_submissions;
create policy "asub read own or admin" on public.assignment_submissions
  for select using (auth.uid() = student_id or public.is_course_admin());

drop policy if exists "asub insert own" on public.assignment_submissions;
create policy "asub insert own" on public.assignment_submissions
  for insert with check (auth.uid() = student_id);

drop policy if exists "asub update own" on public.assignment_submissions;
create policy "asub update own" on public.assignment_submissions
  for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- Admin can grade (update) any submission.
drop policy if exists "asub admin update" on public.assignment_submissions;
create policy "asub admin update" on public.assignment_submissions
  for update using (public.is_course_admin()) with check (public.is_course_admin());

-- ── storage: "assignments" bucket ────────────────────────────────────────────
-- Students upload to assignments/<their-uid>/... ; anyone signed in can read.
drop policy if exists "assignments upload own" on storage.objects;
create policy "assignments upload own" on storage.objects
  for insert with check (
    bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assignments update own" on storage.objects;
create policy "assignments update own" on storage.objects
  for update using (
    bucket_id = 'assignments' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assignments read" on storage.objects;
create policy "assignments read" on storage.objects
  for select using (bucket_id = 'assignments');
