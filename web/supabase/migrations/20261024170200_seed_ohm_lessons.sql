-- Chapter 1 of physics: lesson 1 is free, lessons 2-3 are for subscribers.
-- Placeholder content until the lesson engine (6-card loop) lands.
insert into public.lessons (id, subject, chapter, "order", title, is_free, content) values
  ('ohm-1', 'physics', 'التيار الكهربي وقانون أوم', 1, 'يعني إيه تيار كهربي؟', true,  '{"placeholder": true, "cards": []}'),
  ('ohm-2', 'physics', 'التيار الكهربي وقانون أوم', 2, 'قانون أوم', false, '{"placeholder": true, "cards": []}'),
  ('ohm-3', 'physics', 'التيار الكهربي وقانون أوم', 3, 'توصيل المقاومات', false, '{"placeholder": true, "cards": []}')
on conflict (id) do nothing;
