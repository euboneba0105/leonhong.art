-- Series display order: number determines order in gallery / nav (smaller = first)
ALTER TABLE series ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Optional: backfill existing rows so they keep created_at order until edited
-- UPDATE series SET sort_order = 0 WHERE sort_order IS NULL;
