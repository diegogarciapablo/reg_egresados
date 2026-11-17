# Reporte de Auditoría de Código Estático (SAST)

**Fecha de Ejecución:** 17/11/2026, 1:37:10 a. m.
**Proyecto:** Registro y Directorio de Egresados Informática UAJMS
**Archivos analizados:** 74 archivos JavaScript (.js)
**Total de Hallazgos:** 17

## Resumen de Severidad

| Nivel | Hallazgos |
|---|---|
| 🔴 Crítica | 0 |
| 🟠 Alta | 13 |
| 🟡 Media | 4 |

## Detalle de Hallazgos

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L38) (Línea 38)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L50) (Línea 50)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
return this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L72) (Línea 72)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const result = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L100) (Línea 100)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const result = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L123) (Línea 123)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const result = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAuditLogRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAuditLogRepository.js#L60) (Línea 60)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAuditLogRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAuditLogRepository.js#L81) (Línea 81)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const countRes = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgCoverLetterRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgCoverLetterRepository.js#L111) (Línea 111)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgCoverLetterRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgCoverLetterRepository.js#L137) (Línea 137)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js#L143) (Línea 143)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js#L248) (Línea 248)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const countResult = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js#L257) (Línea 257)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js#L512) (Línea 512)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-XSS-03] Asignación directa de innerHTML con interpolación (MEDIA)
- **Archivo:** [`frontend/js/perfil-publico.js`](../../frontend/js/perfil-publico.js#L137) (Línea 137)
- **Descripción:** Inserción directa de plantillas dinámicas en innerHTML sin sanitizar, riesgo de Cross-Site Scripting (XSS).
- **Código detectado:**
```javascript
btnWa.innerHTML = `
```

### [SEC-XSS-03] Asignación directa de innerHTML con interpolación (MEDIA)
- **Archivo:** [`frontend/js/perfil-publico.js`](../../frontend/js/perfil-publico.js#L155) (Línea 155)
- **Descripción:** Inserción directa de plantillas dinámicas en innerHTML sin sanitizar, riesgo de Cross-Site Scripting (XSS).
- **Código detectado:**
```javascript
btnGmail.innerHTML = `
```

### [SEC-XSS-03] Asignación directa de innerHTML con interpolación (MEDIA)
- **Archivo:** [`frontend/js/perfil-publico.js`](../../frontend/js/perfil-publico.js#L170) (Línea 170)
- **Descripción:** Inserción directa de plantillas dinámicas en innerHTML sin sanitizar, riesgo de Cross-Site Scripting (XSS).
- **Código detectado:**
```javascript
btnInst.innerHTML = `
```

### [SEC-XSS-03] Asignación directa de innerHTML con interpolación (MEDIA)
- **Archivo:** [`frontend/js/perfil-publico.js`](../../frontend/js/perfil-publico.js#L244) (Línea 244)
- **Descripción:** Inserción directa de plantillas dinámicas en innerHTML sin sanitizar, riesgo de Cross-Site Scripting (XSS).
- **Código detectado:**
```javascript
btn.innerHTML = `
```

## Prácticas Recomendadas Aplicadas
1. **Consultas Parametrizadas:** Toda interacción con PostgreSQL utiliza argumentos tipados (`$1, $2...`) mediante el cliente `pg`.
2. **Sanitización y Validación:** Todas las entradas son validadas con esquemas estrictos de `zod` antes de ingresar a los casos de uso.
3. **Manipulación Segura del DOM:** Se utiliza la función `el()` con `document.createTextNode` para evitar inyecciones XSS.
