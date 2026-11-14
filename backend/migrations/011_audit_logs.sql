-- Migración 011: Registro de Auditoría de Movimientos y Modificaciones (Audit Logs)
-- Registra usuario, rol, fecha, hora, estado previo y posterior de cada cambio.

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100) NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT NULL,
  before_state JSONB NULL,
  after_state JSONB NULL,
  ip_address VARCHAR(100) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
