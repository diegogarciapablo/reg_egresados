-- Migración 010: Moderación de fichas, notificaciones internas, términos y condiciones, y especialidades técnicas

-- 1. Estado de moderación en la tabla graduates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'moderation_status') THEN
    CREATE TYPE moderation_status AS ENUM ('draft', 'pending_review', 'observed', 'approved');
  END IF;
END $$;

ALTER TABLE graduates
  ADD COLUMN IF NOT EXISTS moderation_status moderation_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS moderation_observations TEXT NULL,
  ADD COLUMN IF NOT EXISTS moderation_updated_at TIMESTAMPTZ NULL;

-- 2. Aceptación de términos y condiciones en users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ NULL;

-- 3. Especialidades técnicas en la tabla technologies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tech_specialty') THEN
    CREATE TYPE tech_specialty AS ENUM ('software', 'hardware', 'networks', 'documentation');
  END IF;
END $$;

ALTER TABLE technologies
  ADD COLUMN IF NOT EXISTS specialty tech_specialty NOT NULL DEFAULT 'software';

-- Asignar especialidades a las tecnologías existentes
UPDATE technologies SET specialty = 'software' WHERE slug IN ('python', 'javascript', 'typescript', 'java', 'css', 'sql', 'php', 'git', 'docker', 'react', 'nodejs', 'laravel', 'django');
UPDATE technologies SET specialty = 'networks' WHERE slug IN ('aws', 'linux');

-- Insertar algunas tecnologías representativas para hardware, redes y documentación si no existen
INSERT INTO technologies (name, slug, specialty) VALUES
  ('Mantenimiento y Ensamblaje', 'mantenimiento-ensamblaje', 'hardware'),
  ('Arquitectura de Servidores', 'arquitectura-servidores', 'hardware'),
  ('Sistemas Embebidos / IoT', 'sistemas-embebidos-iot', 'hardware'),
  ('Enrutamiento y Switching Cisco', 'enrutamiento-switching-cisco', 'networks'),
  ('Seguridad y Firewall', 'seguridad-firewall', 'networks'),
  ('Redes Inalámbricas y Fibra Óptica', 'redes-inalambricas-fibra', 'networks'),
  ('Documentación Técnica y Manuales', 'documentacion-tecnica-manuales', 'documentation'),
  ('Diagramación UML y BPMN', 'diagramacion-uml-bpmn', 'documentation'),
  ('Gestión de Requerimientos IEEE', 'gestion-requerimientos-ieee', 'documentation')
ON CONFLICT (slug) DO UPDATE SET specialty = EXCLUDED.specialty;

-- 4. Sistema de Notificaciones Internas
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500) NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
