-- 作品圖片搜尋開關：為 true 時，圖片 API 會送出 X-Robots-Tag: noindex，阻擋 Google 將此圖編入搜尋。預設為 false。
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS no_image_index BOOLEAN NOT NULL DEFAULT false;
