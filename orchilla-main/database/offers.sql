-- Run in the Supabase SQL editor.
-- Your `offers` table already exists (status is the offer_status enum:
-- active | archived | expired). This adds the columns the offers feature needs
-- and wires up receipts + RLS. Offers = admin bundles of courses at a discount;
-- categories best / hot / vip. Students claim via payment_receipts + "receipts".

-- ── extend the existing offers table ─────────────────────────────────────────
alter table public.offers
  add column if not exists category    text not null default 'best',
  add column if not exists course_ids  uuid[] not null default '{}',   -- bundled courses
  add column if not exists price       numeric default 0,              -- discounted price
  add column if not exists image_url   text,
  add column if not exists color       text,
  add column if not exists created_by  uuid references public.users(id),
  add column if not exists updated_at  timestamptz default now();
-- (title, description, original_price, status, created_at, expires_at already exist)

-- Constrain category to the three categories (skip if it already exists).
do $$
begin
  alter table public.offers add constraint offers_category_check check (category in ('best', 'hot', 'vip'));
exception when duplicate_object then null;
end $$;

-- ── link receipts to an offer (reuse payment_receipts) ───────────────────────
alter table public.payment_receipts
  add column if not exists offer_id uuid references public.offers(id);

-- Offer receipts have no course/application, so those must be nullable.
alter table public.payment_receipts alter column course_id drop not null;
alter table public.payment_receipts alter column application_id drop not null;

-- ── RLS ──────────────────────────────────────────────────────────────────────
-- Admin check (safe to re-run; also defined in payments_rls.sql).
create or replace function public.is_course_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.users where id = auth.uid() and role = 'admin');
$$;

alter table public.offers enable row level security;

-- Anyone can see active offers; admin sees all.  (offer_status = active | archived | expired)
drop policy if exists "offers public read" on public.offers;
create policy "offers public read" on public.offers
  for select using (status = 'active' or public.is_course_admin());

-- Only the admin creates / edits / deletes offers.
drop policy if exists "offers admin write" on public.offers;
create policy "offers admin write" on public.offers
  for all using (public.is_course_admin()) with check (public.is_course_admin());

-- NOTE: offer *claims* are rows in payment_receipts (offer_id set), governed by
-- the payment_receipts policies in database/payments_rls.sql — run that too.
