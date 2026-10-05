-- =====================================================
-- Fahem Platform: Add sort_order column to lessons
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Add sort_order column with default null (existing rows get null)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- 2. Initialize sort_order for existing lessons (use their id as initial order per chapter)
UPDATE lessons l
SET sort_order = sub.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY chapter_id ORDER BY id ASC) AS row_num
  FROM lessons
) sub
WHERE l.id = sub.id;

-- 3. Create an index for faster ordering queries
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON lessons (chapter_id, sort_order ASC);

-- Done! The app will now load lessons ordered by sort_order, then id.
