-- Focused fix for student receipt uploads.
-- Run this in the Supabase SQL Editor for the project used by .env.

alter table public.course_applications
  add column if not exists amount numeric,
  add column if not exists receipt_file_name text,
  add column if not exists receipt_url text,
  add column if not exists student_note text;

alter table public.book_orders
  add column if not exists amount numeric,
  add column if not exists receipt_file_name text,
  add column if not exists receipt_url text,
  add column if not exists admin_note text,
  add column if not exists reviewed_at timestamptz;

alter table public.payment_receipts
  add column if not exists book_id uuid,
  add column if not exists book_order_id uuid,
  add column if not exists file_name text,
  add column if not exists file_url text,
  add column if not exists receipt_file_url text,
  add column if not exists storage_bucket text,
  add column if not exists storage_path text,
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

drop policy if exists "Students can update own pending payment receipts" on public.payment_receipts;
create policy "Students can update own pending payment receipts"
on public.payment_receipts
for update
to authenticated
using (student_id = auth.uid() and status = 'pending_approval')
with check (student_id = auth.uid());

alter table public.course_applications enable row level security;

drop policy if exists "Students can read own course applications" on public.course_applications;
create policy "Students can read own course applications"
on public.course_applications
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "Students can create own course applications" on public.course_applications;
create policy "Students can create own course applications"
on public.course_applications
for insert
to authenticated
with check (student_id = auth.uid());

alter table public.book_orders enable row level security;

drop policy if exists "Students can read own book orders" on public.book_orders;
create policy "Students can read own book orders"
on public.book_orders
for select
to authenticated
using (student_id = auth.uid());

drop policy if exists "Students can create own book orders" on public.book_orders;
create policy "Students can create own book orders"
on public.book_orders
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
