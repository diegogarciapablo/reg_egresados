ALTER TABLE experiences
  ADD COLUMN IF NOT EXISTS date_format VARCHAR(10) NOT NULL DEFAULT 'day';

ALTER TABLE experiences
  DROP CONSTRAINT IF EXISTS experience_date_format_valid;

ALTER TABLE experiences
  ADD CONSTRAINT experience_date_format_valid CHECK (date_format IN ('day', 'month'));
