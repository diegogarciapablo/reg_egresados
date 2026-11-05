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

## 8. Docker (opcional, para dockerizar tambien el backend)

El `docker-compose.yml` incluido levanta Postgres + pgAdmin + el backend
(`app`) juntos, usando la red externa `red_externa`. Si prefieres seguir
corriendo el backend en local mientras aprendes, no lo necesitas todavia.

## Notas

- Este backend usa **SQL parametrizado con el driver `pg`**, sin ORM, tal
  como se acordo.
- El frontend (`public/`) y los tests (Vitest/Supertest) quedan pendientes
  para una siguiente sesion.
