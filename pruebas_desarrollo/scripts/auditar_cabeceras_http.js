import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const reportesDir = path.resolve(rootDir, "pruebas_desarrollo/reportes");

if (!fs.existsSync(reportesDir)) {
  fs.mkdirSync(reportesDir, { recursive: true });
}

console.log("🔍 [4/4] Ejecutando análisis de cabeceras HTTP y configuración de servidor...");

const appJsPath = path.join(rootDir, "backend/src/app.js");
const appContent = fs.existsSync(appJsPath) ? fs.readFileSync(appJsPath, "utf8") : "";

const checks = [
  {
    name: "Protección con Helmet (Cabeceras HTTP Seguras)",
    passed: /app\.use\(\s*helmet\s*\(/i.test(appContent) || /import\s+helmet\s+from\s+["']helmet["']/i.test(appContent),
    desc: "Oculta X-Powered-By, añade X-Content-Type-Options: nosniff, X-Frame-Options, etc.",
    importance: "ALTA",
  },
  {
    name: "Limitador de Peticiones (Rate Limiting contra ataques DoS/Fuerza Bruta)",
    passed: /rateLimit|express-rate-limit/i.test(appContent),
    desc: "Previene saturación de peticiones en endpoints de autenticación y API pública.",
    importance: "ALTA",
  },
  {
    name: "Manejo de Sesiones Seguras (cookieSession con httpOnly)",
    passed: /cookieSession\s*\(/i.test(appContent) && /httpOnly:\s*true/i.test(appContent),
    desc: "Evita robo de tokens de sesión mediante scripts maliciosos de JavaScript en el navegador (XSS).",
    importance: "CRÍTICA",
  },
  {
    name: "Aislamiento SameSite en Cookies",
    passed: /sameSite:\s*["']lax["']|sameSite:\s*["']strict["']/i.test(appContent),
    desc: "Protege las sesiones contra ataques de Cross-Site Request Forgery (CSRF).",
    importance: "ALTA",
  },
  {
    name: "CORS Configurado con Credenciales y Validación de Origen",
    passed: /cors\s*\(/i.test(appContent) && /credentials:\s*true/i.test(appContent),
    desc: "Control explícito de dominios autorizados para consultar la API.",
    importance: "MEDIA",
  },
];

const dateStr = new Date().toLocaleString("es-BO", { timeZone: "America/La_Paz" });

let reportMd = `# Reporte de Auditoría de Cabeceras HTTP y Configuración de Servidor\n\n`;
reportMd += `**Fecha de Ejecución:** ${dateStr}\n`;
reportMd += `**Proyecto:** Registro y Directorio de Egresados Informática UAJMS\n`;
reportMd += `**Archivo Inspeccionado:** \`backend/src/app.js\`\n\n`;

reportMd += `## Resultados de Verificación\n\n`;
reportMd += `| Control de Seguridad | Importancia | Estado | Descripción |\n`;
reportMd += `|---|---|---|---|\n`;

let totalPassed = 0;
for (const c of checks) {
  if (c.passed) totalPassed++;
  const icon = c.passed ? "✅ Correcto" : "⚠️ Observado";
  reportMd += `| **${c.name}** | ${c.importance} | ${icon} | ${c.desc} |\n`;
}

reportMd += `\n**Cumplimiento Global:** ${totalPassed} de ${checks.length} controles activos.\n\n`;

reportMd += `## Recomendaciones Adicionales para el Servidor Web (Nginx / Caddy / Traefik)\n`;
reportMd += `1. **HTTPS Forzoso y HSTS:** Configurar el proxy reverso para redirigir todo tráfico HTTP a HTTPS y emitir \`Strict-Transport-Security: max-age=31536000; includeSubDomains\`.\n`;
reportMd += `2. **Compresión Gzip / Brotli:** Habilitar compresión para optimizar tiempos de respuesta de los assets estáticos del frontend.\n`;
reportMd += `3. **Límite de Carga de Archivos:** Limitar el tamaño máximo de cuerpo de petición (\`client_max_body_size 5M;\`) para coincidir con la cuota de subida de fotos (5MB).\n`;

const outPath = path.join(reportesDir, "reporte_cabeceras_http.md");
fs.writeFileSync(outPath, reportMd, "utf8");

console.log(`✅ Reporte de cabeceras HTTP generado con éxito: ${outPath}`);
console.log(`📊 Cumplimiento: ${totalPassed}/${checks.length} controles superados`);
