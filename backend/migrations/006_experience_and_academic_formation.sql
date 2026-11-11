-- Migración 006: Clasificación de Experiencia y Formación Académica (antes Certificados)

-- 1. Clasificación en experiencias (work: laboral, academic: académica, pre_graduate: pre-egreso)
ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS category VARCHAR(30) NOT NULL DEFAULT 'work';

ALTER TABLE experiences
  DROP CONSTRAINT IF EXISTS experience_category_valid;

ALTER TABLE experiences
  ADD CONSTRAINT experience_category_valid
  CHECK (category IN ('work', 'academic', 'pre_graduate'));

-- 2. Clasificación jerárquica en certificados (formación académica)
ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS formation_type VARCHAR(30) NOT NULL DEFAULT 'courses';

ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificate_formation_type_valid;

ALTER TABLE certificates
  ADD CONSTRAINT certificate_formation_type_valid
  CHECK (formation_type IN ('doctorate', 'master', 'specialty', 'diploma', 'bachelor', 'courses', 'other'));
