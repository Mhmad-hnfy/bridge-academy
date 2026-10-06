-- ================================================================
-- PATCH: إضافة رابط إضافي وعنوان للرابط تحت فيديو الدرس للطلاب
-- تشغيل هذا الاسكربت في Supabase SQL Editor
-- ================================================================

ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS attachment_link text,
ADD COLUMN IF NOT EXISTS attachment_title text;
