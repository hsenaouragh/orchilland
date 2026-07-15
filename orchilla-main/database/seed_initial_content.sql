-- Run after database/required_supabase_updates.sql if you want the current
-- frontend demo content to live in Supabase instead of local mock files.

insert into public.courses (title, language, type, price, level, duration, students, color, status, description)
values
  ('English Fundamentals', 'English', 'Group courses', '0', 'Beginner', '8 weeks', 1240, '#378ADD', 'available', 'Build core grammar, vocabulary, and speaking confidence from the ground up.'),
  ('French Immersion VIP', 'French', 'VIP courses', '89', 'Intermediate', '12 weeks', 84, '#E85D26', 'available', 'A focused VIP path with live support, guided speaking, and structured assignments.'),
  ('Korean Conversation', 'Korean', 'Conversation class', '49', 'Intermediate', '6 weeks', 320, '#1D9E75', 'available', 'Conversation-first Korean lessons with practical prompts and weekly speaking checks.'),
  ('Italian Practice Lab', 'Italian', 'Language practice sessions', '0', 'Advanced', '4 weeks', 560, '#D4537E', 'available', 'Advanced drills, writing prompts, and correction-focused practice sessions.'),
  ('English VIP Coaching', 'English', 'VIP courses', '129', 'Advanced', '10 weeks', 45, '#378ADD', 'available', 'Private coaching for advanced fluency, presentations, and professional writing.'),
  ('French Group Class', 'French', 'Group courses', '0', 'Beginner', '8 weeks', 980, '#E85D26', 'not_available', 'Beginner French group classes. Enrollment is temporarily paused.'),
  ('Korean Practice', 'Korean', 'Language practice sessions', '0', 'Beginner', '4 weeks', 430, '#1D9E75', 'available', 'Hangul, sentence patterns, and guided practice for early Korean learners.'),
  ('Italian Conversation', 'Italian', 'Conversation class', '55', 'Intermediate', '6 weeks', 210, '#D4537E', 'available', 'Intermediate Italian conversation with real-world scenarios and feedback.'),
  ('French Conversation', 'French', 'Conversation class', '59', 'Advanced', '5 weeks', 175, '#E85D26', 'archived', 'Archived advanced conversation class kept for student history.');

insert into public.books (title, language, price, cover_color, status, description, file_name)
values
  ('English Grammar Companion', 'English', '24', '#378ADD', 'available', 'A structured grammar reference with practice exercises for A1-B2 learners.', 'english-grammar-companion.pdf'),
  ('French Daily Dialogues', 'French', '19', '#E85D26', 'available', 'Short French dialogues with vocabulary notes and translation support.', 'french-daily-dialogues.pdf'),
  ('Korean Starter Workbook', 'Korean', '29', '#1D9E75', 'available', 'Hangul, particles, sentence endings, and beginner writing practice.', 'korean-starter-workbook.pdf');

insert into public.posts (author_id, title, content, image_url, is_published)
values
  (null, 'How to prepare for your first speaking lesson', 'Before your first live session, write five short sentences about yourself and record yourself reading them. Bring the recording to class so your tutor can correct pronunciation and rhythm.', null, true),
  (null, 'Why placement tests matter', 'A placement result is not a label. It helps us skip repeated material and release lessons that match your actual level.', null, true),
  (null, 'New workbook releases this month', 'We are preparing new grammar and conversation workbooks. Students with approved book purchases will receive download access after receipt approval.', null, true);
