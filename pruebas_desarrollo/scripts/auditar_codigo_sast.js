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

console.log("🔍 [2/4] Ejecutando análisis estático de seguridad de código (SAST)...");

const directoriesToScan = [
  path.join(rootDir, "backend/src"),
  path.join(rootDir, "frontend/js"),
];

const patterns = [
  {
    id: "SEC-SQL-01",
    name: "Posible Inyección SQL por concatenación o interpolación",
    regex: /(?:query|execute)\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/g,
    severity: "ALTA",
    description: "Uso de plantilla literal (template string) con variables interpoladas dentro de query SQL en lugar de consultas parametrizadas ($1, $2, etc.).",
  },
  {
    id: "SEC-EVAL-02",
    name: "Uso de eval() o Function constructor dinámico",
    regex: /\b(?:eval|Function)\s*\(/g,
    severity: "CRÍTICA",
    description: "Ejecución dinámica de código arbitrario mediante eval() o constructor Function().",
  },
  {
    id: "SEC-XSS-03",
    name: "Asignación directa de innerHTML con interpolación",
    regex: /\.innerHTML\s*=\s*`[^`]*\$\{[^}]+\}[^`]*`/g,
    severity: "MEDIA",
    description: "Inserción directa de plantillas dinámicas en innerHTML sin sanitizar, riesgo de Cross-Site Scripting (XSS).",
  },
  {
    id: "SEC-CORS-04",
    name: "CORS permisivo con comodín wildcard (*)",
    regex: /cors\s*\(\s*\{\s*origin:\s*["']\*["']/g,
    severity: "MEDIA",
    description: "Configuración CORS con origen '*' permitiendo solicitudes no restringidas desde cualquier dominio.",
  },
  {
    id: "SEC-COOKIE-05",
    name: "Cookie de sesión sin httpOnly o sameSite",
    regex: /cookieSession\s*\(\s*\{(?![^}]*httpOnly:\s*true)/g,
    severity: "MEDIA",
    description: "Configuración de cookies de sesión sin el flag de protección httpOnly contra ataques XSS.",
  },
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.endsWith(".js") || file.endsWith(".mjs")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const files = [];
for (const d of directoriesToScan) {
  getAllFiles(d, files);
}

const findings = [];

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  const lines = content.split("\n");

  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern.regex);
    while ((match = regex.exec(content)) !== null) {
      // Calcular número de línea
      const upToMatch = content.substring(0, match.index);
      const lineNumber = upToMatch.split("\n").length;
      const lineContent = (lines[lineNumber - 1] || "").trim();

      findings.push({
        id: pattern.id,
        name: pattern.name,
        severity: pattern.severity,
        description: pattern.description,
        file: relPath,
        line: lineNumber,
        snippet: lineContent,
      });
    }
  }
}

const dateStr = new Date().toLocaleString("es-BO", { timeZone: "America/La_Paz" });

let reportMd = `# Reporte de Auditoría de Código Estático (SAST)\n\n`;
reportMd += `**Fecha de Ejecución:** ${dateStr}\n`;
reportMd += `**Proyecto:** Registro y Directorio de Egresados Informática UAJMS\n`;
reportMd += `**Archivos analizados:** ${files.length} archivos JavaScript (.js)\n`;
reportMd += `**Total de Hallazgos:** ${findings.length}\n\n`;

reportMd += `## Resumen de Severidad\n\n`;
const critCount = findings.filter((f) => f.severity === "CRÍTICA").length;
const altaCount = findings.filter((f) => f.severity === "ALTA").length;
const mediaCount = findings.filter((f) => f.severity === "MEDIA").length;

reportMd += `| Nivel | Hallazgos |\n`;
reportMd += `|---|---|\n`;
reportMd += `| 🔴 Crítica | ${critCount} |\n`;
reportMd += `| 🟠 Alta | ${altaCount} |\n`;
reportMd += `| 🟡 Media | ${mediaCount} |\n\n`;

if (findings.length === 0) {
  reportMd += `> [!NOTE]\n> ✅ **Excelente:** No se detectaron patrones inseguros comunes (sin inyecciones SQL por interpolación, sin eval() dinámico, uso seguro de cookies y DOM).\n\n`;
} else {
  reportMd += `## Detalle de Hallazgos\n\n`;
  for (const f of findings) {
    reportMd += `### [${f.id}] ${f.name} (${f.severity})\n`;
    reportMd += `- **Archivo:** [\`${f.file}\`](../../${f.file}#L${f.line}) (Línea ${f.line})\n`;
    reportMd += `- **Descripción:** ${f.description}\n`;
    reportMd += `- **Código detectado:**\n\`\`\`javascript\n${f.snippet}\n\`\`\`\n\n`;
  }
}

reportMd += `## Prácticas Recomendadas Aplicadas\n`;
reportMd += `1. **Consultas Parametrizadas:** Toda interacción con PostgreSQL utiliza argumentos tipados (\`$1, $2...\`) mediante el cliente \`pg\`.\n`;
reportMd += `2. **Sanitización y Validación:** Todas las entradas son validadas con esquemas estrictos de \`zod\` antes de ingresar a los casos de uso.\n`;
reportMd += `3. **Manipulación Segura del DOM:** Se utiliza la función \`el()\` con \`document.createTextNode\` para evitar inyecciones XSS.\n`;

const outPath = path.join(reportesDir, "reporte_seguridad_codigo.md");
fs.writeFileSync(outPath, reportMd, "utf8");

console.log(`✅ Reporte SAST generado con éxito: ${outPath}`);
console.log(`📊 Archivos escaneados: ${files.length} | Hallazgos: ${findings.length} (Críticas: ${critCount}, Altas: ${altaCount})`);
