-- ═══════════════════════════════════════════════════════════════════════════
-- OrchillaLand — Row Level Security policies.
-- Run AFTER database/schema.sql. Safe to re-run (drops policies first).
--
-- Model:
--   • admin (users.role = 'admin')  → full access to every table
--   • student                       → own rows + public catalog content
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Helper: is the current user an admin? ────────────────────────────────────
-- SECURITY DEFINER so it can read users.role without tripping users' own RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Enable RLS on every table.
do $$
declare t text;
begin
  foreach t in array array[
    'users','languages','courses','course_applications','payment_receipts',
    'enrollments','lessons','lesson_access','assignments','assignment_releases',
    'assignment_submissions','course_tests','course_test_questions','course_test_options',
    'course_test_releases','course_test_attempts','course_test_answers','books',
    'book_orders','book_payment_receipts','posts','post_likes','post_comments',
    'course_reviews','notifications'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "admin all" on public.%I;', t);
    execute format(
      'create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin());', t
    );
  end loop;
end$$;

-- ── users ────────────────────────────────────────────────────────────────────
drop policy if exists "users read own" on public.users;
create policy "users read own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users insert own" on public.users;
create policy "users insert own" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users update own" on public.users;
create policy "users update own" on public.users
  for update using (auth.uid() = id);

-- ── Public catalog content (everyone can read) ───────────────────────────────
drop policy if exists "languages read" on public.languages;
create policy "languages read" on public.languages for select using (true);

drop policy if exists "courses read" on public.courses;
create policy "courses read" on public.courses for select using (true);

drop policy if exists "books read" on public.books;
create policy "books read" on public.books for select using (true);

drop policy if exists "posts read published" on public.posts;
create policy "posts read published" on public.posts
  for select using (is_published or public.is_admin());

-- ── course_applications (student owns their own) ─────────────────────────────
drop policy if exists "applications read own" on public.course_applications;
create policy "applications read own" on public.course_applications
  for select using (student_id = auth.uid());

drop policy if exists "applications insert own" on public.course_applications;
create policy "applications insert own" on public.course_applications
  for insert with check (student_id = auth.uid());

-- ── payment_receipts ─────────────────────────────────────────────────────────
drop policy if exists "receipts read own" on public.payment_receipts;
create policy "receipts read own" on public.payment_receipts
  for select using (student_id = auth.uid());

drop policy if exists "receipts insert own" on public.payment_receipts;
create policy "receipts insert own" on public.payment_receipts
  for insert with check (student_id = auth.uid());

-- ── enrollments (read own) ───────────────────────────────────────────────────
drop policy if exists "enrollments read own" on public.enrollments;
create policy "enrollments read own" on public.enrollments
  for select using (student_id = auth.uid());

-- ── lessons + lesson_access ──────────────────────────────────────────────────
drop policy if exists "lessons read published" on public.lessons;
create policy "lessons read published" on public.lessons
  for select using (is_published or public.is_admin());

drop policy if exists "lesson_access read own" on public.lesson_access;
create policy "lesson_access read own" on public.lesson_access
  for select using (
    enrollment_id in (select id from public.enrollments where student_id = auth.uid())
  );

-- ── assignments + releases + submissions ─────────────────────────────────────
drop policy if exists "assignments read" on public.assignments;
create policy "assignments read" on public.assignments
  for select using (is_published or public.is_admin());

drop policy if exists "assignment_releases read own" on public.assignment_releases;
create policy "assignment_releases read own" on public.assignment_releases
  for select using (
    enrollment_id in (select id from public.enrollments where student_id = auth.uid())
  );

drop policy if exists "submissions read own" on public.assignment_submissions;
create policy "submissions read own" on public.assignment_submissions
  for select using (student_id = auth.uid());

drop policy if exists "submissions insert own" on public.assignment_submissions;
create policy "submissions insert own" on public.assignment_submissions
  for insert with check (student_id = auth.uid());

drop policy if exists "submissions update own" on public.assignment_submissions;
create policy "submissions update own" on public.assignment_submissions
  for update using (student_id = auth.uid());

-- ── tests: questions/options readable, attempts/answers owned ────────────────
drop policy if exists "tests read" on public.course_tests;
create policy "tests read" on public.course_tests
  for select using (is_published or public.is_admin());

drop policy if exists "test_questions read" on public.course_test_questions;
create policy "test_questions read" on public.course_test_questions for select using (true);

drop policy if exists "test_options read" on public.course_test_options;
create policy "test_options read" on public.course_test_options for select using (true);

drop policy if exists "test_releases read own" on public.course_test_releases;
create policy "test_releases read own" on public.course_test_releases
  for select using (
    enrollment_id in (select id from public.enrollments where student_id = auth.uid())
  );

drop policy if exists "attempts read own" on public.course_test_attempts;
create policy "attempts read own" on public.course_test_attempts
  for select using (student_id = auth.uid());

drop policy if exists "attempts insert own" on public.course_test_attempts;
create policy "attempts insert own" on public.course_test_attempts
  for insert with check (student_id = auth.uid());

drop policy if exists "answers read own" on public.course_test_answers;
create policy "answers read own" on public.course_test_answers
  for select using (
    attempt_id in (select id from public.course_test_attempts where student_id = auth.uid())
  );

drop policy if exists "answers insert own" on public.course_test_answers;
create policy "answers insert own" on public.course_test_answers
  for insert with check (
    attempt_id in (select id from public.course_test_attempts where student_id = auth.uid())
  );

-- ── books: orders + receipts (student owns) ──────────────────────────────────
drop policy if exists "book_orders read own" on public.book_orders;
create policy "book_orders read own" on public.book_orders
  for select using (student_id = auth.uid());

drop policy if exists "book_orders insert own" on public.book_orders;
create policy "book_orders insert own" on public.book_orders
  for insert with check (student_id = auth.uid());

drop policy if exists "book_receipts read own" on public.book_payment_receipts;
create policy "book_receipts read own" on public.book_payment_receipts
  for select using (
    book_order_id in (select id from public.book_orders where student_id = auth.uid())
  );

drop policy if exists "book_receipts insert own" on public.book_payment_receipts;
create policy "book_receipts insert own" on public.book_payment_receipts
  for insert with check (
    book_order_id in (select id from public.book_orders where student_id = auth.uid())
  );

-- ── posts: likes + comments ──────────────────────────────────────────────────
drop policy if exists "likes read" on public.post_likes;
create policy "likes read" on public.post_likes for select using (true);

drop policy if exists "likes insert own" on public.post_likes;
create policy "likes insert own" on public.post_likes
  for insert with check (user_id = auth.uid());

drop policy if exists "likes delete own" on public.post_likes;
create policy "likes delete own" on public.post_likes
  for delete using (user_id = auth.uid());

drop policy if exists "comments read" on public.post_comments;
create policy "comments read" on public.post_comments for select using (true);

drop policy if exists "comments insert own" on public.post_comments;
create policy "comments insert own" on public.post_comments
  for insert with check (user_id = auth.uid());

-- ── course_reviews ───────────────────────────────────────────────────────────
drop policy if exists "reviews read published" on public.course_reviews;
create policy "reviews read published" on public.course_reviews
  for select using (is_published or student_id = auth.uid() or public.is_admin());

drop policy if exists "reviews insert own" on public.course_reviews;
create policy "reviews insert own" on public.course_reviews
  for insert with check (student_id = auth.uid());

-- ── notifications (read + mark-read own) ─────────────────────────────────────
drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own" on public.notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- Storage policies live in schema.sql (buckets COVER, PDF, receipts).
-- ═══════════════════════════════════════════════════════════════════════════
