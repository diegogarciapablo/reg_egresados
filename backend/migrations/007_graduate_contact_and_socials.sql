-- Migración 007: Canales de contacto y redes profesionales dinámicas

ALTER TABLE graduates
  ADD COLUMN IF NOT EXISTS phone VARCHAR(40),
  ADD COLUMN IF NOT EXISTS personal_email VARCHAR(254),
  ADD COLUMN IF NOT EXISTS institutional_email VARCHAR(254),
  ADD COLUMN IF NOT EXISTS professional_links JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Prellenar personal_email con el email del usuario para los egresados existentes si está nulo
UPDATE graduates g
SET personal_email = u.email
FROM users u
WHERE g.user_id = u.id AND (g.personal_email IS NULL OR g.personal_email = '');

-- Migrar enlaces legacy (github, linkedin, portfolio) hacia professional_links si están presentes
UPDATE graduates
SET professional_links = (
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object('type', t.type, 'url', t.url)
    ),
    '[]'::jsonb
  )
  FROM (
    SELECT 'linkedin' AS type, linkedin_url AS url WHERE linkedin_url IS NOT NULL AND linkedin_url <> ''
    UNION ALL
    SELECT 'github' AS type, github_url AS url WHERE github_url IS NOT NULL AND github_url <> ''
    UNION ALL
    SELECT 'portfolio' AS type, portfolio_url AS url WHERE portfolio_url IS NOT NULL AND portfolio_url <> ''
  ) t
)
WHERE jsonb_array_length(professional_links) = 0
  AND (github_url IS NOT NULL OR linkedin_url IS NOT NULL OR portfolio_url IS NOT NULL);
