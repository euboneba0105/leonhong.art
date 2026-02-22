-- 展覽經歷：新增展覽性質（個展 / 聯展），共用 cv_exhibitions 表
-- 請在 Supabase SQL Editor 中執行此腳本

-- 新增展覽性質欄位：'solo' = 個展，'group' = 聯展
ALTER TABLE cv_exhibitions
ADD COLUMN IF NOT EXISTS exhibition_type text NOT NULL DEFAULT 'group';

-- 限制只能為 solo 或 group
ALTER TABLE cv_exhibitions
DROP CONSTRAINT IF EXISTS cv_exhibitions_exhibition_type_check;
ALTER TABLE cv_exhibitions
ADD CONSTRAINT cv_exhibitions_exhibition_type_check
CHECK (exhibition_type IN ('solo', 'group'));

-- 將既有資料一律設為聯展
UPDATE cv_exhibitions
SET exhibition_type = 'group'
WHERE exhibition_type IS DISTINCT FROM 'group';

-- 建議：若欄位是後來才加且允許 NULL，可再改為 NOT NULL（上面已用 DEFAULT 'group'，新列不會為 NULL）
-- COMMENT 方便之後維護
COMMENT ON COLUMN cv_exhibitions.exhibition_type IS 'solo=個展, group=聯展';
