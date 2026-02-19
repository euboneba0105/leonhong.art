-- 媒材標籤系統：tags + artwork_tags
-- 請在 Supabase SQL Editor 中執行此腳本

CREATE TABLE IF NOT EXISTS tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  name_en text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS artwork_tags (
  artwork_id uuid REFERENCES artworks(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (artwork_id, tag_id)
);

-- 將現有 medium 資料遷移為 tags（如果有的話）
INSERT INTO tags (name, name_en)
SELECT DISTINCT medium, medium_en
FROM artworks
WHERE medium IS NOT NULL AND medium != ''
ON CONFLICT (name) DO NOTHING;

-- 建立 artwork_tags 關聯（從現有 medium 欄位）
INSERT INTO artwork_tags (artwork_id, tag_id)
SELECT a.id, t.id
FROM artworks a
JOIN tags t ON t.name = a.medium
WHERE a.medium IS NOT NULL AND a.medium != ''
ON CONFLICT DO NOTHING;
