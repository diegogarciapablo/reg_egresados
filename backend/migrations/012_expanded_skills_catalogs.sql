-- Migración 012: Tokens de restablecimiento de contraseña y expansión de catálogos de habilidades (2026)

-- 1. Tabla de tokens de recuperación de contraseña (validez temporal)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- 2. Expansión de Habilidades Técnicas por Especialidad
INSERT INTO technologies (name, slug, specialty) VALUES
  -- Software y Programación
  ('C# / .NET', 'csharp-dotnet', 'software'),
  ('Go (Golang)', 'golang', 'software'),
  ('Rust', 'rust', 'software'),
  ('Kotlin', 'kotlin', 'software'),
  ('Flutter & Dart', 'flutter-dart', 'software'),
  ('Next.js', 'nextjs', 'software'),
  ('Vue.js', 'vuejs', 'software'),
  ('Angular', 'angular', 'software'),
  ('Spring Boot', 'spring-boot', 'software'),
  ('FastAPI', 'fastapi', 'software'),
  ('PostgreSQL & Optimización SQL', 'postgresql', 'software'),
  ('MongoDB (NoSQL)', 'mongodb', 'software'),
  ('Redis & Caching', 'redis', 'software'),
  ('GraphQL API', 'graphql', 'software'),
  ('Kubernetes & Orquestación', 'kubernetes', 'software'),
  ('CI/CD & Automatización de Despliegue', 'cicd', 'software'),
  ('Desarrollo Aumentado por IA (LLMs & APIs)', 'ai-augmented-dev', 'software'),

  -- Hardware y Sistemas Embebidos
  ('Arduino y Prototipado Rápido', 'arduino', 'hardware'),
  ('Raspberry Pi y Single Board Computers', 'raspberry-pi', 'hardware'),
  ('Microcontroladores ESP32 / STM32', 'esp32-stm32', 'hardware'),
  ('Diagnóstico y Reparación Electrónica de Hardware', 'diagnostico-hardware', 'hardware'),
  ('Diseño y Lectura de Circuitos PCB', 'diseno-pcb', 'hardware'),
  ('Controladores Lógicos Programables (PLC)', 'plc-automatizacion', 'hardware'),
  ('Sensores, Actuadores y Telemetría', 'sensores-telemetria', 'hardware'),
  ('Infraestructura de Energía y Sistemas UPS', 'ups-energia', 'hardware'),

  -- Redes y Telecomunicaciones
  ('Telefonía IP y VoIP (Asterisk)', 'telefonia-ip-voip', 'networks'),
  ('Protocolos TCP/IP, VLAN, OSPF y BGP', 'protocolos-red-avanzados', 'networks'),
  ('Microsoft Azure Cloud', 'azure-cloud', 'networks'),
  ('Google Cloud Platform (GCP)', 'gcp-cloud', 'networks'),
  ('Mikrotik RouterOS y Enrutamiento', 'mikrotik', 'networks'),
  ('VPN y Acceso Remoto Seguro (WireGuard/OpenVPN)', 'vpn-segura', 'networks'),
  ('Ciberseguridad Ofensiva y Pentesting Básico', 'pentesting-seguridad', 'networks'),
  ('Monitoreo de Infraestructura (Zabbix/Wireshark)', 'monitoreo-infraestructura', 'networks'),
  ('Administración de Windows Server y Active Directory', 'windows-server-ad', 'networks'),

  -- Documentación y Gestión TI
  ('Metodologías Ágiles (Scrum & Kanban)', 'scrum-kanban', 'documentation'),
  ('Especificación de APIs (OpenAPI / Swagger)', 'openapi-swagger', 'documentation'),
  ('Arquitectura de Decisiones (ADRs)', 'arquitectura-adrs', 'documentation'),
  ('Buenas Prácticas de Seguridad y Normas ISO/ITIL', 'normas-iso-itil', 'documentation'),
  ('Gestión de Proyectos con Jira y Confluence', 'jira-confluence', 'documentation'),
  ('Redacción de Pliegos y Términos de Referencia (TDR)', 'redaccion-tdr', 'documentation'),
  ('Aseguramiento de Calidad y Pruebas QA', 'qa-pruebas', 'documentation')
ON CONFLICT (slug) DO UPDATE SET specialty = EXCLUDED.specialty, name = EXCLUDED.name;

-- 3. Expansión de Habilidades Personales / Blandas
INSERT INTO soft_skills (name, slug) VALUES
  ('Liderazgo Técnico y Mentoría', 'liderazgo-tecnico'),
  ('Gestión del Tiempo y Priorización', 'gestion-tiempo'),
  ('Proactividad e Iniciativa', 'proactividad'),
  ('Atención al Detalle y Rigor Técnico', 'atencion-detalle'),
  ('Aprendizaje Continuo y Autodidacta', 'aprendizaje-continuo'),
  ('Negociación y Relación con Clientes', 'negociacion-clientes'),
  ('Inteligencia Emocional y Resiliencia', 'inteligencia-emocional'),
  ('Oratoria y Presentación Técnica', 'oratoria-presentacion')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;
