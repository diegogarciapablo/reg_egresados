# Guía de Despliegue — Registro de Egresados (UAJMS)

Esta guía detalla los pasos, prerrequisitos y comandos exactos para desplegar el proyecto tanto en un **equipo local (desarrollo/pruebas)** como en un **servidor VPS (producción)**.

---

## Índice

1. [Arquitectura de Despliegue](#1-arquitectura-de-despliegue)
2. [Despliegue en un Equipo Local](#2-despliegue-en-un-equipo-local)
3. [Despliegue en un Servidor VPS (Producción)](#3-despliegue-en-un-servidor-vps-producción)
4. [Gestión y Comandos de Mantenimiento](#4-gestión-y-comandos-de-mantenimiento)
5. [Solución de Problemas Frecuentes](#5-solución-de-problemas-frecuentes)

---

## 1. Arquitectura de Despliegue

El proyecto cuenta con dos estrategias de orquestación mediante Docker Compose:

| Entorno | Archivo Compose | Componentes | Puertos Expuestos |
| :--- | :--- | :--- | :--- |
| **Local (Autocontenido)** | `docker-compose.yml` | - `egresados_db` (Postgres 16)<br>- `egresados_pgadmin` (pgAdmin 4)<br>- `egresados_backend` (Node.js API Express)<br>- `egresados_frontend` (Nginx Alpine) | `:8080` (Frontend Web)<br>`:3000` (API Backend)<br>`:5432` (PostgreSQL)<br>`:5050` (pgAdmin) |
| **VPS (Producción)** | `docker-compose.vps.yml` | - `egresados2-db` (Postgres 16 Alpine aislado)<br>- `egresados2-backend` (Node.js API)<br>- `egresados2-frontend` (Nginx Alpine para frontend estático) | `:8084` (Frontend Nginx)<br>`:3004` (API Backend)<br>*(BD interna aislada sin puerto host)* |

---

## 2. Despliegue en un Equipo Local

Ideal para probar el sistema en una máquina nueva con Windows, Linux o macOS.

### 2.1 Prerrequisitos
- **Git** instalado.
- **Docker Desktop** (o Docker Engine con plugin Docker Compose) en ejecución.

### 2.2 Clonar o copiar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO> registro-egresados2
cd registro-egresados2
```

### 2.3 Preparar variables de entorno
Copia la plantilla local:
```bash
cp .env.example .env
```
*(En Windows PowerShell: `Copy-Item .env.example .env`)*

El archivo `.env` por defecto viene preconfigurado con:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=postgres123
DB_NAME=egresados_db

PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin123

PORT=3000
SESSION_SECRET=cambia-este-valor-por-uno-largo-y-aleatorio
NODE_ENV=development
```

### 2.4 Levantar los contenedores
Ejecuta en la raíz del proyecto:
```bash
docker compose up --build -d
```

### 2.5 Verificación y acceso
El script de arranque (`start.js`) ejecuta automáticamente:
1. Las migraciones SQL versionadas (`001` a `005`).
2. Las semillas de prueba: usuario Administrador (`admin@example.test` / `Prueba123!`), 10 egresados con avatares, proyectos, certificados, experiencias y cartas.

Accede desde tu navegador:
- **Aplicación Web (Frontend Nginx):** [http://localhost:8080](http://localhost:8080)
- **API Backend:** [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050) (usuario: `admin@admin.com`, clave: `admin123`)

---

## 3. Despliegue en un Servidor VPS (Producción)

Diseñado para servidores Ubuntu/Debian donde pueden coexistir múltiples proyectos y se requiere optimización de recursos y aislamiento de puertos.

### 3.1 Prerrequisitos en el VPS
- Servidor VPS con Linux (ej. Ubuntu 22.04 / 24.04).
- Docker y Docker Compose instalados:
  ```bash
  apt update && apt install -y docker.io docker-compose-v2 git
  systemctl enable --now docker
  ```
- Puertos abiertos en el firewall (UFW o panel del VPS):
  - `8084` (Frontend Nginx)
  - `3004` (Backend API)

### 3.2 Clonar el repositorio
Recomendado en `/opt/proyectos/`:
```bash
mkdir -p /opt/proyectos
cd /opt/proyectos
git clone <URL_DEL_REPOSITORIO> reg_egresados
cd reg_egresados
```

### 3.3 Configurar variables de entorno de producción
Copia la plantilla de VPS:
```bash
cp .env.vps.example .env
```

Edita `.env` con un editor como `nano` y personaliza:
```bash
nano .env
```

Campos principales a ajustar:
```env
NODE_ENV=production
PORT=3000

FRONTEND_PORT=8084
BACKEND_PORT=3004

DB_HOST=egresados2-db
DB_PORT=5432
DB_USER=egresados_user
DB_PASSWORD=PonUnaClaveMuySeguraAca!_2026
DB_NAME=egresados_db

# Genera una clave aleatoria con: openssl rand -hex 32
SESSION_SECRET=a8f4c2...tu-clave-secreta-de-32-caracteres...
CORS_ORIGIN=http://TU_IP_O_DOMINIO:8084
COOKIE_SECURE=false
```

### 3.4 Configurar la URL de la API en el Frontend
El frontend en producción se comunica con la API en el puerto `3004`. Revisa que `frontend/js/api.js` o la configuración apunte a la IP/dominio de tu VPS:
- En `frontend/js/api.js`, la constante `API_BASE` debe resolver al backend del VPS (ej. `http://TU_IP:3004/api`).

### 3.5 Permisos de la carpeta multimedia
El backend corre con el usuario de sistema `node` (UID/GID `1000`). Para permitir que los egresados suban fotos y certificados digitales:
```bash
mkdir -p backend/multimedia
chown -R 1000:1000 backend/multimedia
chmod -R 775 backend/multimedia
```

### 3.6 Construir y levantar los contenedores en el VPS
Para evitar errores de BuildKit o gateways de Docker Hub en el VPS, usa:
```bash
DOCKER_BUILDKIT=0 docker compose -f docker-compose.vps.yml up -d --build
```

### 3.7 Comprobar el estado
```bash
docker compose -f docker-compose.vps.yml ps
```
Deberás ver los 3 contenedores activos:
- `egresados2-db`: `Up (healthy)`
- `egresados2-backend`: `Up`
- `egresados2-frontend`: `Up`

---

## 4. Gestión y Comandos de Mantenimiento

### Ver logs en tiempo real
```bash
# Entorno local:
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Entorno VPS:
docker compose -f docker-compose.vps.yml logs -f egresados2-backend
docker compose -f docker-compose.vps.yml logs -f egresados2-frontend
```

### Actualizar a una nueva versión del código
Cuando subas cambios a Git (por ejemplo nuevas migraciones o ajustes en el frontend):

**En el VPS:**
```bash
cd /opt/proyectos/reg_egresados
git pull origin main
chown -R 1000:1000 backend/multimedia
chmod -R 775 backend/multimedia
DOCKER_BUILDKIT=0 docker compose -f docker-compose.vps.yml up -d --build
```
*(Al iniciar el backend, se ejecutarán automáticamente las migraciones pendientes sin borrar datos).*

### Ejecutar migraciones o semillas manualmente
```bash
# Local:
docker exec -it egresados_backend npm run migrate
docker exec -it egresados_backend npm run seed

# VPS:
docker exec -it egresados2-backend npm run migrate
docker exec -it egresados2-backend npm run seed
```

### Reiniciar la base de datos desde cero (Borrado total)
> [!CAUTION]
> Esta acción destruye el volumen persistente de la base de datos y recrea las tablas limpias con los datos semilla.

```bash
# Local:
docker compose down -v
docker compose up --build -d

# VPS:
docker compose -f docker-compose.vps.yml down -v
DOCKER_BUILDKIT=0 docker compose -f docker-compose.vps.yml up -d --build
```

---

## 5. Solución de Problemas Frecuentes

### 1. Error de permisos al subir fotos o certificados (VPS)
- **Síntoma:** Error `500` o `EACCES: permission denied, open '/usr/src/app/backend/multimedia/...'`.
- **Causa:** La carpeta en el host pertenece a `root`.
- **Solución:**
  ```bash
  chown -R 1000:1000 /opt/proyectos/reg_egresados/backend/multimedia
  chmod -R 775 /opt/proyectos/reg_egresados/backend/multimedia
  ```

### 2. Docker Hub 502 Bad Gateway durante el `docker build`
- **Síntoma:** `failed to resolve source metadata for docker.io/library/node:20-slim: unexpected status ... 502 Bad Gateway`.
- **Causa:** Fallo temporal de BuildKit contra los endpoints de manifiesto de Docker Hub.
- **Solución:** Anteponer `DOCKER_BUILDKIT=0`:
  ```bash
  DOCKER_BUILDKIT=0 docker compose -f docker-compose.vps.yml up -d --build
  ```

### 3. Conflicto de puertos en el VPS
- **Síntoma:** `Bind for 0.0.0.0:8084 failed: port is already allocated`.
- **Solución:** Cambia `FRONTEND_PORT` o `BACKEND_PORT` en `.env` a puertos libres (por ejemplo `8085` y `3005`) y vuelve a ejecutar `docker compose up -d`.

### 4. Cambios en el frontend no se ven en el navegador
- **Causa:** Los navegadores almacenan en caché los archivos JS/CSS estáticos.
- **Solución:** Haz un refresco forzado en tu navegador con **`Ctrl + F5`** (o `Cmd + Shift + R`).
