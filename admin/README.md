# OrchillaLand — Admin Dashboard

A **separate** Vite + React + Tailwind app for operating OrchillaLand, connected
to **Supabase**. It reuses the public site's Orchilland design tokens (orange,
maroon, green, warm white) but runs on its own dev server / build.

## Run

```bash
cd admin
npm install
npm run dev      # http://localhost:5174
npm run build    # production build → dist/
```

## Connect to Supabase

Credentials live in `.env` (already created — see `.env.example`):

```
VITE_SUPABASE_URL=https://kzownsphxyerfknkdtms.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The app talks to Supabase through one seam — [`src/services/api.js`](src/services/api.js)
(generic `loadAll / list / create / update / remove`) and
[`src/lib/supabase.js`](src/lib/supabase.js). Column names everywhere match the
schema, so no other code needs to change.

### 1. Create the tables + storage bucket

Run [`database/schema.sql`](database/schema.sql) in the Supabase SQL editor. It
creates every table (users, languages, courses, course_applications,
payment_receipts, enrollments, lessons, lesson_access, assignments,
assignment_releases, assignment_submissions, course_tests, course_test_questions,
course_test_options, course_test_releases, course_test_attempts,
course_test_answers, books, book_orders, book_payment_receipts, posts,
post_likes, post_comments, course_reviews, notifications), a **public `COVER`
storage bucket**, and seeds the four languages.

### 2. Create the admin user

1. Supabase Dashboard → **Authentication → Add user** (email + password).
2. In the SQL editor: `update public.users set role = 'admin' where email = 'you@example.com';`

Then sign in at `/login`. The whole app is gated behind `role = 'admin'`
(a signed-in user is admitted unless their role is explicitly `student`).

> Note: with the publishable (anon) key, reads/writes obey Row Level Security.
> Add RLS policies that let the admin read/write; otherwise tables load empty.

## Uploads are direct from your laptop

Every image/file field (course cover, book cover + file, lesson file, assignment
file, post image) uses the [`FileUpload`](src/components/FileUpload.jsx)
component: the admin picks a file from their computer, it's uploaded to the
Supabase `COVER` bucket via [`src/lib/storage.js`](src/lib/storage.js), and the
returned public URL is stored on the row. No URL pasting. Prices are in Algerian
dinars (DA).

## Sections

Dashboard · Course Applications (approve → creates enrollment) · Courses ·
Students (details panel) · Lessons · Assignments (grade + feedback) · Tests
(`TestBuilder`, attempts review) · Books (catalog + order receipts) · Posts
(threaded comment replies) · Reviews · Notifications.

## Architecture

```
src/
  lib/supabase.js         Supabase client (reads .env).
  lib/storage.js          uploadFile() → Supabase Storage (bucket 'uploads').
  services/api.js         The data seam (loadAll / list / create / update / remove).
  hooks/
    AdminAuthContext.jsx  Supabase Auth; only role 'admin' passes.
    AdminDataContext.jsx  Loads all tables, exposes helpers + domain actions.
    ThemeContext.jsx      Light/dark, shared tokens with the public site.
  components/             AdminLayout, StatCard, DataTable, StatusBadge,
                          AdminModal, CourseForm, TestBuilder,
                          ReceiptReviewModal, FileUpload, ui.jsx
  pages/                  One page per sidebar section.
database/schema.sql       Full schema + storage bucket + language seed.
```
