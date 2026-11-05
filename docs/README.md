# Documentación del Proyecto — Registro de Egresados (UAJMS)

Bienvenido a la documentación técnica oficial del sistema **Directorio y Registro de Egresados de Ingeniería Informática (UAJMS)**.

## Índice de Documentación

1. [**Arquitectura, Principios SOLID y Estructura del Proyecto**](./ARQUITECTURA_Y_ESTRUCTURA.md)
   - Diseño en Arquitectura Hexagonal (Puertos y Adaptadores).
   - Aplicación práctica de los principios SOLID y seguridad en el código.
   - Árbol completo y explicación de cada directorio y archivo.
2. [**Funcionamiento del Sistema, Flujos y Referencia de API**](./FUNCIONAMIENTO_Y_API.md)
   - Flujo de inicialización automatizada con Docker, migraciones y semillas.
   - Sistema de Roles (**Usuario estándar** vs. **Administrador**) y Panel de Gestión.
   - Flujos de las pantallas del Frontend y catálogo de endpoints REST.
3. [**Modelo Entidad-Relación (Base de Datos)**](./MODELO_ENTIDAD_RELACION.md)
   - Diagrama Entidad-Relación (`erDiagram`) interactivo en Mermaid.
   - Diccionario de datos de las tablas, tipos `ENUM`, restricciones (`CHECK` / `UNIQUE`) e índices.

---

## Estado Actual del Proyecto

El sistema se encuentra **100 % operativo y contenedorizado**, compuesto por:

| Componente | Tecnología | Estado / Puerto | Descripción |
| :--- | :--- | :--- | :--- |
| **Aplicación (`egresados_app`)** | Node.js 20 + Express 4 + Vanilla JS | Activo (`:3000`) | Servidor HTTP que expone la API REST (`/api/*`) y sirve el frontend estático (`public/`). |
| **Base de Datos (`egresados_db`)** | PostgreSQL 16 | Activo (`:5432`) | Base de datos relacional `egresados_db` con soporte UUID (`pgcrypto`) y volumen persistente. |
| **Cliente BD (`egresados_pgadmin`)** | pgAdmin 4 | Activo (`:5050`) | Interfaz web para inspección y administración de PostgreSQL. |

### Funcionalidades Implementadas y Verificadas

- **Directorio Público con Filtros y Paginación:** Búsqueda por nombre, cargo, resumen, tecnología (`slug`) y año de egreso, mostrando avatares y etiquetas de tecnologías.
- **Ficha Pública de Egresado:** Visualización mediante código único (`registration_code`), enlaces profesionales validados (`http://` / `https://`), experiencia laboral, portafolio de proyectos y envío de recomendaciones públicas sujetas a moderación.
- **Autenticación y Sesiones Seguras:** Registro e inicio de sesión con `bcrypt` (12 rondas), sesiones en cookies `httpOnly`, `sameSite: lax` y limitadores de tasa (`express-rate-limit`).
- **Panel Privado del Egresado ("Mi ficha"):** Edición de datos personales, carga/eliminación de foto de perfil validada por *magic bytes* (JPEG, PNG, WebP), control de visibilidad (`public`, `link_only`, `private`), selección de tecnologías, habilidades blandas, experiencias y proyectos.
- **Generador de Cartas de Presentación:** Creación y edición de cartas personalizadas por empresa/puesto con límite de negocio (máx. 2 tecnologías, 2 habilidades blandas y 5 en total) y vista previa lista para impresión/PDF.
- **Sistema de Roles y Panel de Gestión (Administrador):**
  - Todo nuevo usuario registrado se crea por defecto como **Usuario estándar** (`graduate`).
  - El rol solo es visible para el **Administrador** (`admin`), quien dispone del menú **Gestión** en la barra de navegación para activar/desactivar usuarios, promover usuarios estándar a administradores, agregar nuevas tecnologías y habilidades blandas, y administrar todos los registros del sistema.

---

## Guía Rápida: Levantar el Proyecto con Docker y Poblar la Base de Datos

### 1. Configurar el archivo `.env`
Si es la primera vez que clonas el proyecto, copia el archivo de ejemplo:

```bash
cp .env.example .env
```

### 2. Construir y levantar los contenedores
Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose up --build -d
```

Esto levanta automáticamente:
1. **`egresados_db`** (PostgreSQL 16 en el puerto `5432`).
2. **`egresados_pgadmin`** (pgAdmin 4 en `http://localhost:5050`).
3. **`egresados_app`** (Aplicación web y API en `http://localhost:3000`).

### 3. Poblado de la Base de Datos (Automático y Manual)
Al iniciar `egresados_app`, el script [`scripts/start.js`](../scripts/start.js) ejecuta **automáticamente**:
1. **Migraciones (`scripts/migrate.js`):** Crea las tablas (`001_initial_schema.sql`), carga los catálogos iniciales (`002_seed_catalogs.sql`) y habilita el estado lógico (`003_admin_entity_management.sql`).
2. **Semillas (`scripts/seed.js`):**
   - Crea y garantiza siempre el usuario **Administrador** (`admin@example.test` / `Prueba123!`).
   - Si la base está vacía, inserta **10 egresados de prueba** (`ana.mendez@example.test`, `bruno.rojas@example.test`, etc., todos con clave `Prueba123!`), sus imágenes de avatar y 6 registros por cada tabla relacionada (proyectos, experiencias, recomendaciones y cartas de presentación).

Si deseas ejecutar las migraciones o el poblado manualmente en cualquier momento:

```bash
# Ejecutar migraciones manualmente dentro del contenedor
docker exec -it egresados_app npm run migrate

# Ejecutar poblado (seed) manualmente dentro del contenedor
docker exec -it egresados_app npm run seed
```

### 4. Reiniciar la Base de Datos desde Cero
Si quieres borrar todos los datos actuales y volver a poblar la base limpia desde cero:

```bash
docker compose down -v
docker compose up --build -d
```
*(El flag `-v` elimina el volumen `egresados_pg_data` y el siguiente `up` recrea todo el esquema y vuelve a cargar las semillas automáticamente).*
