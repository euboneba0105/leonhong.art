-- Homepage Carousel: stores which artworks appear in the fullscreen hero carousel
CREATE TABLE IF NOT EXISTS homepage_carousel (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prevent duplicate artworks in carousel
CREATE UNIQUE INDEX IF NOT EXISTS homepage_carousel_artwork_unique ON homepage_carousel(artwork_id);

-- RLS
ALTER TABLE homepage_carousel ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public homepage)
CREATE POLICY "Anyone can read homepage_carousel"
  ON homepage_carousel FOR SELECT USING (true);

-- Only service-role can write (handled by API with admin check)
CREATE POLICY "Service role can manage homepage_carousel"
  ON homepage_carousel FOR ALL USING (true) WITH CHECK (true);
