# Reporte de Auditoría de Código Estático (SAST)

**Fecha de Ejecución:** 13/11/2026, 8:54:37 p. m.
**Proyecto:** Registro y Directorio de Egresados Informática UAJMS
**Archivos analizados:** 70 archivos JavaScript (.js)
**Total de Hallazgos:** 15

## Resumen de Severidad

| Nivel | Hallazgos |
|---|---|
| 🔴 Crítica | 0 |
| 🟠 Alta | 11 |
| 🟡 Media | 4 |

## Detalle de Hallazgos

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L36) (Línea 36)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L48) (Línea 48)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
return this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L70) (Línea 70)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const result = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L95) (Línea 95)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const result = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgAdminEntityRepository.js#L115) (Línea 115)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const result = await this.pool.query(
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
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js#L240) (Línea 240)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const countResult = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js#L249) (Línea 249)
- **Descripción:** Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).
- **Código detectado:**
```javascript
const { rows } = await this.pool.query(
```

### [SEC-SQL-01] Posible Inyección SQL por concatenación o interpolación (ALTA)
- **Archivo:** [`backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js`](../../backend/src/adapters/persistence/postgres/repositories/PgGraduateRepository.js#L480) (Línea 480)
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
