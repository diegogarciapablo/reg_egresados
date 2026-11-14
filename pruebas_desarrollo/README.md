# 🛡️ Entorno de Auditoría y Seguridad de Desarrollo (`pruebas_desarrollo/`)

Esta carpeta contiene la suite de herramientas y scripts automatizados para realizar análisis de vulnerabilidades, auditorías estáticas de código (SAST), detección de fuga de secretos y verificación de configuración segura del servidor antes de realizar el despliegue a producción en el VPS.

> [!NOTE]
> Este directorio está incluido en el archivo `.dockerignore`, lo que garantiza que **nunca se copie al contenedor Docker en producción**, manteniendo la imagen liviana y sin herramientas innecesarias en el VPS.

---

## 🚀 Comandos Disponibles

Puedes ejecutar cualquiera de las auditorías de forma individual o la suite completa desde la raíz del proyecto usando `npm`:

```bash
# 1. Ejecutar la auditoría completa de seguridad (SCA + SAST + Secretos + Cabeceras)
npm run audit:all

# 2. Auditar vulnerabilidades en dependencias de Node.js (SCA)
npm run audit:deps

# 3. Análisis estático de código en busca de inyecciones SQL, XSS, etc. (SAST)
npm run audit:code

# 4. Escaneo de secretos, credenciales y archivos .env rastreados
npm run audit:secrets

# 5. Verificación de cabeceras HTTP, Helmet, Cookies de sesión y CORS
npm run audit:headers
```

---

## 📁 Estructura del Directorio

```text
pruebas_desarrollo/
├── README.md                          # Este manual de uso
├── scripts/
│   ├── auditar_dependencias.js        # Ejecuta npm audit y genera reporte Markdown
│   ├── auditar_codigo_sast.js         # Analiza patrones inseguros en backend/src y frontend/js
│   ├── auditar_secretos.js            # Escanea archivos en busca de credenciales expuestas
│   ├── auditar_cabeceras_http.js      # Inspecciona middlewares de seguridad en app.js
│   └── auditar_todo.js                # Orquestador que corre todos los scripts
└── reportes/
    ├── reporte_dependencias.md        # Último informe generado de vulnerabilidades SCA
    ├── reporte_seguridad_codigo.md    # Último informe de análisis estático SAST
    ├── reporte_secretos.md            # Último informe de escaneo de secretos
    └── reporte_cabeceras_http.md      # Último informe de cabeceras y cookies seguras
```

---

## 📋 ¿Qué audita cada herramienta?

### 1. Auditoría de Dependencias (`audit:deps`)
- Inspecciona el árbol de dependencias (`package.json` y `package-lock.json`) contra la base de datos de avisos de seguridad de npm.
- Clasifica las incidencias por severidad (Crítica, Alta, Moderada, Baja).
- Recomienda las acciones requeridas (`npm audit fix`).

### 2. Análisis Estático de Código (`audit:code`)
- **Inyección SQL:** Verifica que todas las consultas a PostgreSQL estén parametrizadas (`$1, $2, ...`) y no usen interpolación de cadenas directa.
- **Riesgos de XSS:** Detecta uso indebido de `innerHTML` con variables sin sanitizar.
- **Ejecución dinámica:** Detecta llamadas a `eval()` o constructores dinámicos prohibidos.

### 3. Escaneo de Secretos (`audit:secrets`)
- Revisa si por error algún archivo real `.env` fue agregado al repositorio Git.
- Busca contraseñas de bases de datos, claves privadas o tokens JWT quemados en el código.

### 4. Cabeceras HTTP y Configuración (`audit:headers`)
- Valida la presencia de `helmet` para protección contra ataques comunes.
- Comprueba que las cookies de sesión tengan el flag `httpOnly: true` para prevenir robo de sesión por XSS.
- Comprueba la protección `sameSite` contra CSRF.
- Verifica la presencia del limitador de tráfico (`express-rate-limit`).
