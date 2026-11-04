# Documentación del Proyecto — Registro de Egresados (UAJMS)

Bienvenido a la documentación técnica oficial del sistema **Directorio y Registro de Egresados de Ingeniería Comercial (UAJMS)**.

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
