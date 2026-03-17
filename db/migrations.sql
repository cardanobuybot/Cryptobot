CREATE TABLE IF NOT EXISTS articles (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  tags TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  source_topic TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_articles_status_published_at
  ON articles(status, published_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_articles_updated_at ON articles;
CREATE TRIGGER trg_articles_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();
