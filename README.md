# Registro de Egresados - Backend

Backend en Node.js + Express + PostgreSQL, con arquitectura hexagonal
(dominio / aplicacion / adaptadores), siguiendo el documento guia `base.md`.

## 1. Requisitos previos

- Node.js instalado (ya lo tienes).
- Un contenedor de PostgreSQL accesible (por ejemplo, el que ya armaste en
  `docker-infra/postgres`, reutilizable entre proyectos).

## 2. Configurar variables de entorno

Copia `.env.example` a `.env` y ajusta los valores segun tu Postgres:

```bash
cp .env.example .env
```

Como ya tienes un Postgres corriendo en Docker con la base `egresados_db`
creada, usa:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=postgres123
DB_NAME=egresados_db
```

## 3. Instalar dependencias

```bash
npm install
```

## 4. Correr las migraciones

Esto crea todas las tablas (usuarios, egresados, tecnologias, proyectos,
experiencias, recomendaciones, cartas de presentacion) y carga el catalogo
inicial de tecnologias/habilidades:

```bash
npm run migrate
```

## 5. Levantar el servidor

```bash
npm run dev
```

Deberia mostrar: `Servidor escuchando en http://localhost:3000`

## 6. Probar que funciona

```bash
curl http://localhost:3000/api/health
```

Deberia responder: `{"status":"ok"}`

## 7. Estructura del proyecto

```
backend/
  src/
    domain/        <- entidades y reglas de negocio puras (sin Express ni pg)
    application/   <- casos de uso (orquestan domain + repositorios)
    adapters/
      http/        <- rutas, controladores, middleware (Express)
      persistence/ <- repositorios concretos con PostgreSQL y archivos
    config/        <- env y conexion a base de datos
    shared/        <- errores y validaciones (zod) compartidas
  migrations/      <- SQL versionado, se aplica con npm run migrate
  scripts/         <- start.js, migrate.js y seed.js
frontend/          <- vistas HTML, estilos CSS y modulos JS del cliente
docs/              <- documentacion tecnica, arquitectura y modelo E-R
```

## 8. Despliegue con Docker

El proyecto cuenta con dos entornos listos para usar:

- **Equipo Local (Desarrollo):** Usa [`docker-compose.yml`](./docker-compose.yml), el cual levanta PostgreSQL 16 + pgAdmin 4 + backend en `:3000` + frontend Nginx en `http://localhost:8080`:
  ```bash
  cp .env.example .env
  docker compose up --build -d
  ```

- **Servidor VPS (Producción):** Usa [`docker-compose.vps.yml`](./docker-compose.vps.yml), optimizado con Nginx Alpine (`:8084`), Backend Node (`:3004`) y PostgreSQL Alpine con puertos aislados:
  ```bash
  cp .env.vps.example .env
  DOCKER_BUILDKIT=0 docker compose -f docker-compose.vps.yml up -d --build
  ```

Para ver la guía detallada de despliegue con solución de problemas y comandos de mantenimiento, consulta [**`docs/GUIA_DESPLIEGUE.md`**](./docs/GUIA_DESPLIEGUE.md).

## Notas

- Este backend usa **SQL parametrizado con el driver `pg`**, sin ORM, tal
  como se acordo.
- El frontend (`public/`) y los tests (Vitest/Supertest) quedan pendientes
  para una siguiente sesion.
