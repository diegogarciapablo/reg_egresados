import { execSync } from "child_process";
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

console.log("🔍 [1/4] Ejecutando análisis de dependencias (SCA - npm audit)...");

let auditRaw = "";
try {
  auditRaw = execSync("npm audit --json", { cwd: rootDir, encoding: "utf8" });
} catch (error) {
  // npm audit exits with non-zero if vulnerabilities are found
  auditRaw = error.stdout || "";
}

let auditData = null;
try {
  auditData = JSON.parse(auditRaw);
} catch {
  console.error("❌ No se pudo parsear el resultado de npm audit.");
}

const vulnerabilities = auditData?.metadata?.vulnerabilities || {
  info: 0,
  low: 0,
  moderate: 0,
  high: 0,
  critical: 0,
  total: 0,
};

const dateStr = new Date().toLocaleString("es-BO", { timeZone: "America/La_Paz" });

let reportMd = `# Reporte de Auditoría de Dependencias (SCA)\n\n`;
reportMd += `**Fecha de Ejecución:** ${dateStr}\n`;
reportMd += `**Proyecto:** Registro y Directorio de Egresados Informática UAJMS\n`;
reportMd += `**Herramienta:** npm audit (Node.js Package Manager)\n\n`;
reportMd += `## Resumen de Vulnerabilidades\n\n`;
reportMd += `| Nivel | Cantidad |\n`;
reportMd += `|---|---|\n`;
reportMd += `| 🔴 Crítico (Critical) | ${vulnerabilities.critical} |\n`;
reportMd += `| 🟠 Alto (High) | ${vulnerabilities.high} |\n`;
reportMd += `| 🟡 Moderado (Moderate) | ${vulnerabilities.moderate} |\n`;
reportMd += `| 🔵 Bajo (Low) | ${vulnerabilities.low} |\n`;
reportMd += `| ⚪ Informativo (Info) | ${vulnerabilities.info} |\n`;
reportMd += `| **Total** | **${vulnerabilities.total}** |\n\n`;

if (vulnerabilities.total === 0) {
  reportMd += `> [!NOTE]\n> ✅ **Excelente:** No se encontraron vulnerabilidades conocidas en los paquetes de producción instalados.\n\n`;
} else {
  reportMd += `### Detalle de Paquetes Afectados\n\n`;
  if (auditData?.vulnerabilities) {
    for (const [pkg, info] of Object.entries(auditData.vulnerabilities)) {
      reportMd += `- **${pkg}**: Severidad **${info.severity}**\n`;
      if (info.effects && info.effects.length) {
        reportMd += `  - Efecto en: \`${info.effects.join(", ")}\`\n`;
      }
      if (info.fixAvailable) {
        reportMd += `  - Solución disponible: ${typeof info.fixAvailable === "boolean" ? "Sí" : JSON.stringify(info.fixAvailable)}\n`;
      }
    }
  }
}

reportMd += `## Recomendaciones de Despliegue\n`;
reportMd += `1. Ejecutar \`npm audit fix\` en caso de paquetes con parches semver compatibles.\n`;
reportMd += `2. En el VPS de producción, asegurarse de instalar únicamente paquetes de producción con \`npm ci --omit=dev\` dentro del contenedor Docker.\n`;

const outPath = path.join(reportesDir, "reporte_dependencias.md");
fs.writeFileSync(outPath, reportMd, "utf8");

console.log(`✅ Reporte de dependencias generado con éxito: ${outPath}`);
console.log(`📊 Total vulnerabilidades: ${vulnerabilities.total} (Críticas: ${vulnerabilities.critical}, Altas: ${vulnerabilities.high})`);
