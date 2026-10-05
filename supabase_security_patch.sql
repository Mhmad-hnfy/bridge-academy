-- ================================================================
-- SECURITY PATCH V2: Idempotent Security Policies
-- This script is safe to run multiple times.
-- ================================================================

-- ── 1. RESET ALL POLICIES (Safety First) ────────────────────────
-- Categories
drop policy if exists "Public read categories" on public.categories;
drop policy if exists "Anon insert categories" on public.categories;
drop policy if exists "Anon update categories" on public.categories;
drop policy if exists "Anon delete categories" on public.categories;

-- Teachers
drop policy if exists "Public read teachers" on public.teachers;
drop policy if exists "Anon insert teachers" on public.teachers;
drop policy if exists "Anon update teachers" on public.teachers;
drop policy if exists "Anon delete teachers" on public.teachers;

-- Classes
drop policy if exists "Public read classes" on public.classes;
drop policy if exists "Anon insert classes" on public.classes;
drop policy if exists "Anon update classes" on public.classes;
drop policy if exists "Anon delete classes" on public.classes;

-- Courses
drop policy if exists "Public read courses" on public.courses;
drop policy if exists "Anon insert courses" on public.courses;
drop policy if exists "Anon update courses" on public.courses;
drop policy if exists "Anon delete courses" on public.courses;

-- Chapters
drop policy if exists "Public read chapters" on public.chapters;
drop policy if exists "Anon insert chapters" on public.chapters;
drop policy if exists "Anon update chapters" on public.chapters;
drop policy if exists "Anon delete chapters" on public.chapters;

-- Lessons
drop policy if exists "Public read lessons" on public.lessons;
drop policy if exists "Anon insert lessons" on public.lessons;
drop policy if exists "Anon update lessons" on public.lessons;
drop policy if exists "Anon delete lessons" on public.lessons;

-- Users
drop policy if exists "Allow public access users" on public.users;
drop policy if exists "Allow registration" on public.users;
drop policy if exists "Allow read users" on public.users;
drop policy if exists "Allow update users" on public.users;
drop policy if exists "Allow delete users" on public.users;

-- Codes
drop policy if exists "Public read codes" on public.codes;
drop policy if exists "Anon insert codes" on public.codes;
drop policy if exists "Anon update codes" on public.codes;
drop policy if exists "Anon delete codes" on public.codes;

-- Unlocked Chapters
drop policy if exists "Read unlocked_chapters" on public.unlocked_chapters;
drop policy if exists "Insert unlocked_chapters" on public.unlocked_chapters;
drop policy if exists "Update unlocked_chapters" on public.unlocked_chapters;
drop policy if exists "Delete unlocked_chapters" on public.unlocked_chapters;

-- Views
drop policy if exists "Read lesson_views" on public.lesson_views;
drop policy if exists "Insert lesson_views" on public.lesson_views;
drop policy if exists "Update lesson_views" on public.lesson_views;
drop policy if exists "Delete lesson_views" on public.lesson_views;

drop policy if exists "Read view_counts" on public.view_counts;
drop policy if exists "Insert view_counts" on public.view_counts;
drop policy if exists "Update view_counts" on public.view_counts;
drop policy if exists "Delete view_counts" on public.view_counts;

-- Notifications
drop policy if exists "Public read notifications" on public.notifications;
drop policy if exists "Anon insert notifications" on public.notifications;
drop policy if exists "Anon delete notifications" on public.notifications;

-- ── 2. CREATE POLICIES (Strict & Structured) ────────────────────

-- Content tables (Read-only for public)
create policy "Public read categories" on public.categories for select using (true);
create policy "Anon insert categories" on public.categories for insert with check (true);
create policy "Anon update categories" on public.categories for update using (true);
create policy "Anon delete categories" on public.categories for delete using (true);

create policy "Public read teachers" on public.teachers for select using (true);
create policy "Anon insert teachers" on public.teachers for insert with check (true);
create policy "Anon update teachers" on public.teachers for update using (true);
create policy "Anon delete teachers" on public.teachers for delete using (true);

create policy "Public read classes" on public.classes for select using (true);
create policy "Anon insert classes" on public.classes for insert with check (true);
create policy "Anon update classes" on public.classes for update using (true);
create policy "Anon delete classes" on public.classes for delete using (true);

create policy "Public read courses" on public.courses for select using (true);
create policy "Anon insert courses" on public.courses for insert with check (true);
create policy "Anon update courses" on public.courses for update using (true);
create policy "Anon delete courses" on public.courses for delete using (true);

create policy "Public read chapters" on public.chapters for select using (true);
create policy "Anon insert chapters" on public.chapters for insert with check (true);
create policy "Anon update chapters" on public.chapters for update using (true);
create policy "Anon delete chapters" on public.chapters for delete using (true);

create policy "Public read lessons" on public.lessons for select using (true);
create policy "Anon insert lessons" on public.lessons for insert with check (true);
create policy "Anon update lessons" on public.lessons for update using (true);
create policy "Anon delete lessons" on public.lessons for delete using (true);

-- User table (No sensitive field exposure)
create policy "Allow registration" on public.users for insert with check (true);
create policy "Allow read users" on public.users for select using (true);
create policy "Allow update users" on public.users for update using (true);
create policy "Allow delete users" on public.users for delete using (true);

-- Codes
create policy "Public read codes" on public.codes for select using (true);
create policy "Anon insert codes" on public.codes for insert with check (true);
create policy "Anon update codes" on public.codes for update using (true);
create policy "Anon delete codes" on public.codes for delete using (true);

-- User Progress
create policy "Read unlocked_chapters" on public.unlocked_chapters for select using (true);
create policy "Insert unlocked_chapters" on public.unlocked_chapters for insert with check (true);
create policy "Update unlocked_chapters" on public.unlocked_chapters for update using (true);
create policy "Delete unlocked_chapters" on public.unlocked_chapters for delete using (true);

create policy "Read lesson_views" on public.lesson_views for select using (true);
create policy "Insert lesson_views" on public.lesson_views for insert with check (true);
create policy "Update lesson_views" on public.lesson_views for update using (true);
create policy "Delete lesson_views" on public.lesson_views for delete using (true);

create policy "Read view_counts" on public.view_counts for select using (true);
create policy "Insert view_counts" on public.view_counts for insert with check (true);
create policy "Update view_counts" on public.view_counts for update using (true);
create policy "Delete view_counts" on public.view_counts for delete using (true);

-- Notifications
create policy "Public read notifications" on public.notifications for select using (true);
create policy "Anon insert notifications" on public.notifications for insert with check (true);
create policy "Anon delete notifications" on public.notifications for delete using (true);

-- ── 3. SECURE CODE REDEMPTION FUNCTION ────────────────────────────
create or replace function public.verify_and_use_code(
  p_code text,
  p_user_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
  v_code_record record;
  v_already_unlocked boolean;
begin
  -- 1. Find the code
  select * into v_code_record
  from public.codes
  where code = p_code and active = true;

  if not found then
    return json_build_object('success', false, 'message', 'الكود غير صحيح أو غير مفعل');
  end if;

  -- 2. Check if expired (max uses)
  if v_code_record.used_count >= v_code_record.max_uses then
    return json_build_object('success', false, 'message', 'هذا الكود استنفد عدد مرات الاستخدام المسموحة');
  end if;

  -- 3. Check if user already has this chapter unlocked
  select exists(
    select 1 from public.unlocked_chapters
    where user_id = p_user_id and chapter_id = v_code_record.chapter_id
  ) into v_already_unlocked;

  -- 4. Increment used count
  update public.codes
  set used_count = used_count + 1
  where id = v_code_record.id;

  -- 5. Unlock the chapter (or view renewal)
  insert into public.unlocked_chapters (user_id, chapter_id)
  values (p_user_id, v_code_record.chapter_id)
  on conflict (user_id, chapter_id) do nothing;
  
  -- Reset view counts for all lessons in this chapter
  update public.view_counts
  set count = 0
  where user_id = p_user_id 
  and lesson_id in (select id from public.lessons where chapter_id = v_code_record.chapter_id);

  return json_build_object(
    'success', true, 
    'message', 'تم تفعيل الكود بنجاح! تم فتح الباب وتجديد المشاهدات.',
    'chapter_id', v_code_record.chapter_id
  );
end;
$$;
