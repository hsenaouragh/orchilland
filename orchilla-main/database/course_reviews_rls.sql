-- Run in the Supabase SQL editor.
-- Fixes: editing/deleting a course review failed with
--   "Cannot coerce the result to a single JSON object"
-- because course_reviews has RLS enabled and an INSERT policy, but no
-- UPDATE/DELETE policy — so a student's own edit/delete matched 0 rows.
--
-- These add owner-scoped update + delete. Read and insert already work, so we
-- leave those policies untouched.

alter table public.course_reviews enable row level security;

-- A student can edit only their own review.
drop policy if exists "reviews update own" on public.course_reviews;
create policy "reviews update own" on public.course_reviews
  for update using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- A student can delete only their own review.
drop policy if exists "reviews delete own" on public.course_reviews;
create policy "reviews delete own" on public.course_reviews
  for delete using (auth.uid() = student_id);
