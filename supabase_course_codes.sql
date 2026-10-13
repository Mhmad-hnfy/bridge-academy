-- ============================================================
-- 🚀 BRIDGE ACADEMY — أكواد واشتراكات المواد والكورسات (Course Codes & Student Unlocks)
-- انسخ هذا الكود بالكامل، وافتحه في:
-- Supabase Dashboard -> SQL Editor -> New Query -> اضغط Run
-- ============================================================

-- 1. إضافة حقل course_id في جدول codes لربط الكود بالمادة الدراسية مباشرة
ALTER TABLE public.codes
  ADD COLUMN IF NOT EXISTS course_id bigint references public.courses(id) on delete cascade;

-- 2. جدول المواد المفعلة للطلاب (unlocked_courses) مع دعم ربطها بالكورس التابعة له (category_id)
CREATE TABLE IF NOT EXISTS public.unlocked_courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade,
  course_id bigint references public.courses(id) on delete cascade,
  category_id bigint references public.categories(id) on delete cascade,
  unlocked_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- إضافة عمود category_id في حال كان الجدول منشأ سابقاً
ALTER TABLE public.unlocked_courses
  ADD COLUMN IF NOT EXISTS category_id bigint references public.categories(id) on delete cascade;

-- 3. تفعيل سياسات الأمان
ALTER TABLE public.unlocked_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access unlocked_courses" ON public.unlocked_courses;
CREATE POLICY "Allow public access unlocked_courses" ON public.unlocked_courses FOR ALL USING (true) WITH CHECK (true);

-- تأكيد صلاحيات جدول codes
ALTER TABLE public.codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access codes" ON public.codes;
CREATE POLICY "Allow public access codes" ON public.codes FOR ALL USING (true) WITH CHECK (true);
