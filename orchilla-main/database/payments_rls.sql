-- Run in the Supabase SQL editor.
-- Fixes: course applications, book orders, and payment receipts never save
-- (the storage bucket fills, but the table INSERT is rejected by RLS 42501).
-- A logged-in student must be allowed to create their own rows; the admin
-- (public.users.role = 'admin') can read everything and approve/deny.

-- Admin check (SECURITY DEFINER so it doesn't recurse into users' RLS).
create or replace function public.is_course_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

-- ── course_applications ──────────────────────────────────────────────────────
alter table public.course_applications enable row level security;

drop policy if exists "applications read own or admin" on public.course_applications;
create policy "applications read own or admin" on public.course_applications
  for select using (auth.uid() = student_id or public.is_course_admin());

drop policy if exists "applications insert own" on public.course_applications;
create policy "applications insert own" on public.course_applications
  for insert with check (auth.uid() = student_id);

drop policy if exists "applications admin update" on public.course_applications;
create policy "applications admin update" on public.course_applications
  for update using (public.is_course_admin()) with check (public.is_course_admin());

-- ── book_orders ──────────────────────────────────────────────────────────────
alter table public.book_orders enable row level security;

drop policy if exists "orders read own or admin" on public.book_orders;
create policy "orders read own or admin" on public.book_orders
  for select using (auth.uid() = student_id or public.is_course_admin());

drop policy if exists "orders insert own" on public.book_orders;
create policy "orders insert own" on public.book_orders
  for insert with check (auth.uid() = student_id);

drop policy if exists "orders admin update" on public.book_orders;
create policy "orders admin update" on public.book_orders
  for update using (public.is_course_admin()) with check (public.is_course_admin());

-- ── payment_receipts ─────────────────────────────────────────────────────────
alter table public.payment_receipts enable row level security;

drop policy if exists "receipts read own or admin" on public.payment_receipts;
create policy "receipts read own or admin" on public.payment_receipts
  for select using (auth.uid() = student_id or public.is_course_admin());

drop policy if exists "receipts insert own" on public.payment_receipts;
create policy "receipts insert own" on public.payment_receipts
  for insert with check (auth.uid() = student_id);

drop policy if exists "receipts admin update" on public.payment_receipts;
create policy "receipts admin update" on public.payment_receipts
  for update using (public.is_course_admin()) with check (public.is_course_admin());

-- ── book_payment_receipts (books use their own table; no student_id column,
--    ownership is derived from the linked book_orders row) ──────────────────
alter table public.book_payment_receipts enable row level security;

drop policy if exists "book receipts read own or admin" on public.book_payment_receipts;
create policy "book receipts read own or admin" on public.book_payment_receipts
  for select using (
    public.is_course_admin()
    or exists (select 1 from public.book_orders o where o.id = book_order_id and o.student_id = auth.uid())
  );

drop policy if exists "book receipts insert own" on public.book_payment_receipts;
create policy "book receipts insert own" on public.book_payment_receipts
  for insert with check (
    exists (select 1 from public.book_orders o where o.id = book_order_id and o.student_id = auth.uid())
  );

drop policy if exists "book receipts admin update" on public.book_payment_receipts;
create policy "book receipts admin update" on public.book_payment_receipts
  for update using (public.is_course_admin()) with check (public.is_course_admin());
