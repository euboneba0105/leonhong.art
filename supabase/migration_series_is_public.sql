-- Series public toggle: when false, series is hidden from public and only visible to admin
ALTER TABLE series ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;
