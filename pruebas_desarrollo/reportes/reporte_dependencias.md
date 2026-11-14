# Reporte de Auditoría de Dependencias (SCA)

**Fecha de Ejecución:** 13/11/2026, 8:54:37 p. m.
**Proyecto:** Registro y Directorio de Egresados Informática UAJMS
**Herramienta:** npm audit (Node.js Package Manager)

## Resumen de Vulnerabilidades

| Nivel | Cantidad |
|---|---|
| 🔴 Crítico (Critical) | 4 |
| 🟠 Alto (High) | 7 |
| 🟡 Moderado (Moderate) | 4 |
| 🔵 Bajo (Low) | 0 |
| ⚪ Informativo (Info) | 0 |
| **Total** | **15** |

### Detalle de Paquetes Afectados

- **@mapbox/node-pre-gyp**: Severidad **high**
  - Solución disponible: Sí
- **@vitest/mocker**: Severidad **moderate**
  - Efecto en: `vitest`
  - Solución disponible: {"name":"vitest","version":"5.1.0","isSemVerMajor":true}
- **body-parser**: Severidad **high**
  - Solución disponible: Sí
- **brace-expansion**: Severidad **high**
  - Solución disponible: Sí
- **esbuild**: Severidad **moderate**
  - Efecto en: `vite`
  - Solución disponible: {"name":"vitest","version":"5.1.0","isSemVerMajor":true}
- **multer**: Severidad **high**
  - Solución disponible: Sí
- **proxy-addr**: Severidad **critical**
  - Solución disponible: Sí
- **qs**: Severidad **moderate**
  - Solución disponible: Sí
- **source-map-js**: Severidad **high**
  - Solución disponible: Sí
- **tar**: Severidad **critical**
  - Efecto en: `@mapbox/node-pre-gyp`
  - Solución disponible: Sí
- **tinypool**: Severidad **critical**
  - Efecto en: `vitest`
  - Solución disponible: {"name":"vitest","version":"5.1.0","isSemVerMajor":true}
- **vite**: Severidad **high**
  - Efecto en: `@vitest/mocker, vite-node, vitest`
  - Solución disponible: {"name":"vitest","version":"5.1.0","isSemVerMajor":true}
- **vite-node**: Severidad **moderate**
  - Efecto en: `vitest`
  - Solución disponible: {"name":"vitest","version":"5.1.0","isSemVerMajor":true}
- **vitest**: Severidad **critical**
  - Solución disponible: {"name":"vitest","version":"5.1.0","isSemVerMajor":true}
- **zod**: Severidad **high**
  - Solución disponible: {"name":"zod","version":"4.6.7","isSemVerMajor":true}
## Recomendaciones de Despliegue
1. Ejecutar `npm audit fix` en caso de paquetes con parches semver compatibles.
2. En el VPS de producción, asegurarse de instalar únicamente paquetes de producción con `npm ci --omit=dev` dentro del contenedor Docker.
