CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  graduate_id UUID NOT NULL REFERENCES graduates(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  issuer VARCHAR(150),
  issue_date DATE,
  credential_url TEXT,
  file_url TEXT,
  file_name VARCHAR(255),
  display_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS certificates_graduate_order_idx
  ON certificates (graduate_id, display_order);
