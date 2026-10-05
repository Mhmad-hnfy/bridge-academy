-- Supabase Schema Update Script (Patch)
-- Run this in your Supabase SQL Editor to add the missing columns

-- 1. Updates to "teachers" table
alter table public.teachers
add column if not exists subject text,
add column if not exists phone text,
add column if not exists email text,
add column if not exists bio text;

-- 2. Updates to "classes" table
alter table public.classes
add column if not exists image text,
add column if not exists active boolean default true;

-- 3. Updates to "courses" table
alter table public.courses
add column if not exists active boolean default true;

-- 4. Updates to "chapters" table
alter table public.chapters
add column if not exists lessons_count integer default 0,
add column if not exists image text,
add column if not exists active boolean default true,
add column if not exists price numeric default 0;


-- 5. Updates to "lessons" table
-- Note: 'video_url' and 'pdf_url' existed before, but app uses 'youtube_link' and 'pdf_file'
alter table public.lessons
add column if not exists category_id bigint references public.categories(id) on delete cascade,
add column if not exists class_id bigint references public.classes(id) on delete cascade,
add column if not exists youtube_link text,
add column if not exists banner text,
add column if not exists pdf_file text,
add column if not exists status text default 'نشط'::text;
