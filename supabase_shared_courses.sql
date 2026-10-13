-- ============================================================
-- 🚀 BRIDGE ACADEMY — ربط المادة بأكثر من كورس (Shared Courses)
-- انسخ هذا الكود بالكامل، وافتحه في:
-- Supabase Dashboard -> SQL Editor -> New Query -> اضغط Run
-- ============================================================

-- 1. إضافة حقل category_ids لجدول courses لدعم ربط المادة بأكثر من كورس/فئة
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category_ids jsonb DEFAULT '[]'::jsonb;

-- 2. التحقق من سياسات الأمان للقراءة والتحديث
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access courses" ON public.courses;
CREATE POLICY "Allow public access courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
