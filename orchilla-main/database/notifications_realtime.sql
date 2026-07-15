-- Run in the Supabase SQL editor.
-- Makes the admin get a notification (and a live toast) when a student submits a
-- payment receipt, submits an assignment, or a new user signs up. Students keep
-- getting their own notifications; both apps subscribe to realtime for a toast.

-- New enum value for "new user" notifications (safe if it already exists).
alter type public.notification_type add value if not exists 'account';

-- ── helper: notify every admin ───────────────────────────────────────────────
create or replace function public.notify_admins(p_title text, p_message text, p_type text, p_rel_type text, p_rel_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare a uuid;
begin
  for a in select id from public.users where role = 'admin' loop
    insert into public.notifications (user_id, title, message, type, related_type, related_id, read_at, created_at)
    values (a, p_title, p_message, p_type::notification_type, p_rel_type, p_rel_id, null, now());
  end loop;
end $$;

-- ── receipts (course/offer via payment_receipts, books via book_payment_receipts)
create or replace function public.tg_notify_receipt()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_admins('New payment receipt', 'A student submitted a payment receipt for review.', 'payment', 'payment_receipt', new.id);
  return new;
end $$;

drop trigger if exists on_payment_receipt_insert on public.payment_receipts;
create trigger on_payment_receipt_insert after insert on public.payment_receipts
  for each row execute function public.tg_notify_receipt();

drop trigger if exists on_book_receipt_insert on public.book_payment_receipts;
create trigger on_book_receipt_insert after insert on public.book_payment_receipts
  for each row execute function public.tg_notify_receipt();

-- ── assignment submissions ───────────────────────────────────────────────────
create or replace function public.tg_notify_submission()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify_admins('New assignment submission', 'A student submitted an assignment.', 'assignment', 'assignment_submission', new.id);
  return new;
end $$;

drop trigger if exists on_submission_insert on public.assignment_submissions;
create trigger on_submission_insert after insert on public.assignment_submissions
  for each row execute function public.tg_notify_submission();

-- ── new users ────────────────────────────────────────────────────────────────
create or replace function public.tg_notify_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.role, 'student') <> 'admin' then
    perform public.notify_admins('New user registered', coalesce(new.name, new.email, 'A new student') || ' just signed up.', 'account', 'user', new.id);
  end if;
  return new;
end $$;

drop trigger if exists on_user_insert on public.users;
create trigger on_user_insert after insert on public.users
  for each row execute function public.tg_notify_new_user();

-- ── notifications RLS (own read/update; own-or-admin insert) ──────────────────
alter table public.notifications enable row level security;

drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications insert own or admin" on public.notifications;
create policy "notifications insert own or admin" on public.notifications
  for insert with check (auth.uid() = user_id or public.is_course_admin());

drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── enable realtime on notifications (safe if already added) ──────────────────
do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null;
end $$;
