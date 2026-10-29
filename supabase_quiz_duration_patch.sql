-- ============================================================
-- Bridge Academy — Quiz Duration Patch
-- تشغيل هذا الملف في Supabase SQL Editor لإضافة وقت محدد للامتحانات
-- ============================================================

-- إضافة عمود مدة الامتحان بالدقائق (0 يعني بدون وقت محدد)
alter table public.lesson_quizzes 
add column if not exists duration_minutes int default 0;

comment on column public.lesson_quizzes.duration_minutes is 'مدة الاختبار بالدقائق (0 أو null تعني اختبار مفتوح بدون وقت محدد)';
