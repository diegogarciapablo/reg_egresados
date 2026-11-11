-- 008_languages_catalog_and_graduate_languages.sql
-- Catálogo de idiomas y relación de idiomas dominados por los egresados con su nivel.

CREATE TABLE IF NOT EXISTS languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserción inicial de los idiomas oficiales
INSERT INTO languages (name, slug) VALUES
  ('Español', 'espanol'),
  ('Inglés', 'ingles'),
  ('Francés', 'frances'),
  ('Portugués', 'portugues')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS graduate_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  language_id UUID NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
  level VARCHAR(20) NOT NULL CHECK (level IN ('nativo', 'basico', 'intermedio', 'avanzado')),
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_graduate_language UNIQUE (graduate_id, language_id)
);

CREATE INDEX IF NOT EXISTS idx_graduate_languages_grad ON graduate_languages(graduate_id);
