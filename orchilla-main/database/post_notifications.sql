-- Run in the Supabase SQL editor.
-- Notifications for post interactions:
--   • new comment  -> notify the post author (admin) AND everyone else who has
--                     commented on that post (so students in a thread get pinged)
--   • new like     -> notify the post author (admin)
-- Both apps already toast on any new notification (realtime), so admin and
-- students both get live toasts.

-- Notification type for post activity (safe if it already exists).
alter type public.notification_type add value if not exists 'post';

-- ── new comment ──────────────────────────────────────────────────────────────
create or replace function public.tg_notify_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_author uuid;
  v_name   text;
  v_participant uuid;
begin
  select author_id into v_author from public.posts where id = new.post_id;
  v_name := coalesce(new.user_name, 'Someone');

  -- the post author (unless they wrote the comment themselves)
  if v_author is not null and v_author <> new.user_id then
    insert into public.notifications (user_id, title, message, type, related_type, related_id, created_at)
    values (v_author, 'New comment on your post', v_name || ': ' || left(coalesce(new.content, ''), 80), 'post', 'post', new.post_id, now());
  end if;

  -- other students who have commented on the same post
  for v_participant in
    select distinct user_id
    from public.post_comments
    where post_id = new.post_id
      and user_id is not null
      and user_id <> new.user_id
      and user_id <> coalesce(v_author, '00000000-0000-0000-0000-000000000000'::uuid)
  loop
    insert into public.notifications (user_id, title, message, type, related_type, related_id, created_at)
    values (v_participant, 'New comment on a post', v_name || ': ' || left(coalesce(new.content, ''), 80), 'post', 'post', new.post_id, now());
  end loop;

  return new;
end $$;

drop trigger if exists on_post_comment_insert on public.post_comments;
create trigger on_post_comment_insert after insert on public.post_comments
  for each row execute function public.tg_notify_comment();

-- ── new like ─────────────────────────────────────────────────────────────────
create or replace function public.tg_notify_like()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_author uuid;
begin
  select author_id into v_author from public.posts where id = new.post_id;
  if v_author is not null and v_author <> new.user_id then
    insert into public.notifications (user_id, title, message, type, related_type, related_id, created_at)
    values (v_author, 'New like on your post', 'Someone liked your post.', 'post', 'post', new.post_id, now());
  end if;
  return new;
end $$;

drop trigger if exists on_post_like_insert on public.post_likes;
create trigger on_post_like_insert after insert on public.post_likes
  for each row execute function public.tg_notify_like();
