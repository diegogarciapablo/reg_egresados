# Funcionamiento del Sistema, Flujos y Referencia de API

## 1. Flujo de Arranque Automatizado en Docker

Cuando se ejecuta `docker compose up --build -d`, el contenedor `egresados_app` ejecuta [`scripts/start.js`](../scripts/start.js), que realiza la inicialización completa sin intervención manual:

```mermaid
sequenceDiagram
  participant Docker as Docker Compose
  participant Start as scripts/start.js
  participant Migrate as scripts/migrate.js
  participant Seed as scripts/seed.js
  participant DB as PostgreSQL (egresados_db)
  participant Server as src/server.js

  Docker->>DB: Inicia contenedor y verifica healthcheck (pg_isready)
  Docker->>Start: Inicia contenedor egresados_app
  Start->>DB: waitForDatabase() (SELECT 1 hasta 30 intentos)
  Start->>Migrate: runMigrations()
  Migrate->>DB: Crea tabla schema_migrations y aplica 001, 002, 003 en transacción
  Start->>Seed: runSeed() con pg_advisory_xact_lock
  Seed->>DB: ensureAdminUser() (garantiza admin@example.test activo)
  Seed->>DB: Si está vacía, inserta 10 egresados con avatares y 6 registros por tabla; si ya tiene datos, asegura avatares semilla
  Start->>Server: Levanta Express en http://localhost:3000
```

### Comandos Útiles de Docker y Poblado de Datos

```bash
# 1. Preparar variables de entorno
cp .env.example .env

# 2. Construir y levantar todos los servicios (DB + pgAdmin + App)
docker compose up --build -d

# 3. Ver logs de inicialización (migraciones + seed + servidor)
docker compose logs -f app

# 4. Ejecutar migraciones o semillas manualmente si se requiere
docker exec -it egresados_app npm run migrate
docker exec -it egresados_app npm run seed

# 5. Reiniciar base de datos desde cero (borra volumen y vuelve a sembrar al subir)
docker compose down -v
docker compose up --build -d
```

---

## 2. Sistema de Roles y Permisos

El sistema maneja dos roles en la tabla `users` (`user_role ENUM ('graduate', 'admin')`):

| Característica | Usuario Estándar (`graduate`) | Administrador (`admin`) |
| :--- | :--- | :--- |
| **Asignación al registrarse** | Sí (rol por defecto al crear cuenta en `/registro.html`). | No (solo asignable por otro administrador o semilla inicial). |
| **Visibilidad del rol** | Oculto (no se expone el campo `role` en su sesión ni en su interfaz). | Visible en su sesión y en la tabla de gestión de usuarios. |
| **Acceso a "Mi ficha" y "Cartas"** | Sí (`/dashboard.html` y `/cartas.html`). | Sí. |
| **Apartado "Gestión" en Navbar** | No visible. | Visible en el menú superior (`Gestión`). |
| **Capacidades de Gestión** | Ninguna (`/api/admin/*` responde `403 Forbidden`). | Activar/desactivar usuarios, promover usuarios estándar a administradores, crear/editar tecnologías y habilidades blandas, y moderar registros. |

### Credenciales de Prueba Preconfiguradas
- **Administrador:** `admin@example.test` / `Prueba123!`
- **Usuarios Estándar (10 perfiles con avatares):** `ana.mendez@example.test`, `bruno.rojas@example.test`, `camila.vega@example.test`, etc. / `Prueba123!`

---

## 3. Pantallas y Flujos del Frontend (`public/`)

1. **Directorio Público (`/index.html`):**
   - Consulta `GET /api/catalogs/technologies` para poblar el filtro de tecnologías y `GET /api/graduates` con soporte de búsqueda por texto (`q`), tecnología (`technology`), año (`year`) y paginación.
   - Muestra tarjetas con foto de avatar circular, nombre, cargo actual, año de egreso, resumen y enlace a la ficha completa.
2. **Ficha Pública (`/perfil.html?codigo=EG-2026-001`):**
   - Consulta `GET /api/graduates/:registrationCode`.
   - Muestra el perfil detallado, tecnologías, habilidades blandas, experiencia laboral, proyectos, recomendaciones publicadas y un formulario público para enviar nuevas recomendaciones (`POST /api/graduates/:id/recommendations`), que quedan en estado `pending` hasta ser aprobadas por un administrador.
3. **Mi Ficha (`/dashboard.html`):**
   - Permite al egresado autenticado publicar u ocultar su ficha del directorio (`PATCH /api/me/profile/visibility`), subir o quitar su foto de perfil (`PUT` / `DELETE /api/me/profile/photo`), actualizar su información general y guardar sus listas de tecnologías, habilidades blandas, experiencias y proyectos.
4. **Cartas de Presentación (`/cartas.html`):**
   - Permite crear múltiples cartas dirigidas a distintas empresas/puestos, seleccionando hasta 2 tecnologías y 2 habilidades blandas (máximo 5 en total), con vista previa en vivo e impresión en PDF mediante hoja de estilos `@media print`.
5. **Panel de Gestión (`/admin.html` — exclusivo Administrador):**
   -Accesible desde el menú **Gestión** en el navbar.
   - **Usuarios y roles (`?entity=users`):** Permite activar/desactivar cuentas y cambiar el rol de cualquier **Usuario estándar** a **Administrador** (botón `Hacer admin`) o viceversa (`Pasar a estandar`), garantizando siempre que permanezca al menos un administrador activo.
   - **Tecnologías (`?entity=technologies`) y Habilidades blandas (`?entity=soft_skills`):** Incluye el botón **+ Agregar tecnología / habilidad blanda** con generación automática de `slug`, edición y activación/desactivación.
   - **Perfiles, Proyectos, Experiencias, Recomendaciones y Cartas:** Búsqueda en tiempo real, edición de campos y activación/desactivación lógica (`is_active`).

---

## 4. Referencia de Endpoints REST (`/api`)

### Públicos
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Verificación de estado del servidor (`{"status":"ok"}`). |
| `GET` | `/api/graduates` | Lista paginada de egresados con `visibility = 'public'`. Parámetros: `q`, `technology`, `year`, `page`, `limit`. |
| `GET` | `/api/graduates/:registrationCode` | Obtiene la ficha pública o `link_only` completa por código de registro. |
| `GET` | `/api/graduates/photo/:graduateId` | Sirve la imagen de perfil subida en disco si el perfil no es privado (o si pertenece al usuario en sesión). |
| `POST` | `/api/graduates/:id/recommendations` | Envía una recomendación para el egresado (se crea con `status = 'pending'`). |
| `GET` | `/api/catalogs/technologies` | Lista las tecnologías activas del catálogo. |
| `GET` | `/api/catalogs/soft-skills` | Lista las habilidades blandas activas del catálogo. |

### Autenticación (`/api/auth`)
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registra un nuevo usuario (con rol `graduate` por defecto) y su ficha inicial en una sola transacción. |
| `POST` | `/api/auth/login` | Inicia sesión y establece la cookie firmada `session`. |
| `POST` | `/api/auth/logout` | Cierra la sesión actual (`204 No Content`). |
| `GET` | `/api/auth/me` | Devuelve el usuario autenticado actual (`role` solo se incluye si es `admin`). |

### Perfil Propio y Cartas (`/api/me` — requiere sesión activa)
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/me/profile` | Obtiene la ficha propia completa (incluyendo tecnologías, habilidades, proyectos y experiencias). |
| `PATCH` | `/api/me/profile` | Actualiza datos básicos y enlaces del perfil propio. |
| `PATCH` | `/api/me/profile/visibility` | Cambia la visibilidad (`public`, `link_only`, `private`). |
| `PUT` | `/api/me/profile/photo` | Sube o reemplaza la foto de perfil (`multipart/form-data`, campo `photo`). |
| `DELETE` | `/api/me/profile/photo` | Elimina la foto de perfil del egresado. |
| `PUT` | `/api/me/profile/technologies` | Reemplaza las tecnologías asociadas al perfil (`technologyIds`). |
| `PUT` | `/api/me/profile/soft-skills` | Reemplaza las habilidades blandas asociadas al perfil (`softSkillIds`). |
| `PUT` | `/api/me/profile/projects` | Reemplaza la lista de proyectos del egresado. |
| `PUT` | `/api/me/profile/experiences` | Reemplaza la lista de experiencias laborales del egresado. |
| `GET` | `/api/me/cover-letters` | Lista las cartas de presentación activas del egresado. |
| `POST` | `/api/me/cover-letters` | Crea una nueva carta de presentación. |
| `GET` | `/api/me/cover-letters/:id` | Obtiene el detalle de una carta propia. |
| `PATCH` | `/api/me/cover-letters/:id` | Actualiza los campos de una carta propia. |
| `PUT` | `/api/me/cover-letters/:id/selections` | Guarda las tecnologías y habilidades seleccionadas para la carta (máx. 2 por categoría y 5 en total). |

### Administración (`/api/admin` — requiere sesión con rol `admin`)
| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| `GET` | `/api/admin/entities` | Devuelve los metadatos, columnas y campos editables/creables de las 8 entidades. |
| `GET` | `/api/admin/entities/:entity` | Lista y filtra (`?q=...`) los registros de una entidad. |
| `POST` | `/api/admin/entities/:entity` | Crea un nuevo registro en entidades habilitadas (`technologies`, `soft_skills`). |
| `PATCH` | `/api/admin/entities/:entity/:id` | Actualiza campos de un registro (incluyendo cambio de `role` en `users`). |
| `PATCH` | `/api/admin/entities/:entity/:id/active` | Activa o desactiva lógicamente (`is_active`) un registro. |
| `PATCH` | `/api/admin/recommendations/:id` | Modera el estado de una recomendación (`pending`, `published`, `rejected`). |
| `PATCH` | `/api/admin/graduates/:id/status` | Cambia la visibilidad de la ficha de un egresado. |
