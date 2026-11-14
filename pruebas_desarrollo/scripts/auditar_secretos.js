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

console.log("🔍 [3/4] Ejecutando escáner de fuga de secretos y credenciales...");

// 1. Verificar si git tiene tracked archivos .env sensibles
let trackedEnvFiles = [];
try {
  const tracked = execSync("git ls-files", { cwd: rootDir, encoding: "utf8" });
  trackedEnvFiles = tracked
    .split("\n")
    .map((s) => s.trim())
    .filter((f) => f === ".env" || f.endsWith("/.env"));
} catch {
  // En caso de que no haya git disponible
}

// 2. Patrones de secretos típicos
const secretPatterns = [
  {
    id: "SECRET-PRIVKEY",
    name: "Clave Privada RSA/SSH/PGP",
    regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
  },
  {
    id: "SECRET-POSTGRES-URL",
    name: "Cadena de conexión PostgreSQL con contraseña explícita",
    regex: /postgres(?:ql)?:\/\/[a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-!@#$%^&*()+=]+@[a-zA-Z0-9.\-]+:[0-9]+/g,
  },
  {
    id: "SECRET-JWT-SECRET",
    name: "Clave secreta JWT o SESSION_KEY quemada en código",
    regex: /(?:SESSION_SECRET|JWT_SECRET|SECRET_KEY)\s*=\s*["'][a-zA-Z0-9!@#$%^&*()_+=\-]{8,}["']/gi,
  },
  {
    id: "SECRET-SMTP-PASS",
    name: "Contraseña SMTP quemada directamente en código",
    regex: /(?:SMTP_PASS|MAIL_PASSWORD)\s*=\s*["'][^"'\n]{6,}["']/gi,
  },
];

const ignoredDirs = ["node_modules", ".git", "dist", "build", "reportes"];

function getSourceFiles(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (ignoredDirs.includes(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      getSourceFiles(full, list);
    } else {
      // Ignorar archivos de plantilla .env.example
      if (item === ".env.example" || item.endsWith(".example")) continue;
      // Escanear js, json, yml, yaml, sh, ps1, dockerfile, md
      const ext = path.extname(item).toLowerCase();
      if ([".js", ".json", ".yml", ".yaml", ".env", ".sh", ".ps1"].includes(ext) || item === "Dockerfile") {
        list.push(full);
      }
    }
  }
  return list;
}

const allFiles = getSourceFiles(rootDir);
const secretFindings = [];

// Revisión de archivos .env trackeados
if (trackedEnvFiles.length > 0) {
  for (const f of trackedEnvFiles) {
    secretFindings.push({
      id: "SECRET-TRACKED-ENV",
      name: "Archivo .env real versionado en Git",
      file: f,
      line: 1,
      snippet: f,
      severity: "CRÍTICA",
      advice: "Ejecutar git rm --cached .env y asegurar que figure en .gitignore",
    });
  }
}

// Escaneo de patrones
for (const fPath of allFiles) {
  const content = fs.readFileSync(fPath, "utf8");
  const relPath = path.relative(rootDir, fPath).replace(/\\/g, "/");
  const lines = content.split("\n");

  for (const pat of secretPatterns) {
    let match;
    const rx = new RegExp(pat.regex);
    while ((match = rx.exec(content)) !== null) {
      const upTo = content.substring(0, match.index);
      const lineNum = upTo.split("\n").length;
      const snippet = (lines[lineNum - 1] || "").trim();

      // Ignorar si es el propio archivo de auditoría
      if (relPath.includes("auditar_secretos.js")) continue;

      secretFindings.push({
        id: pat.id,
        name: pat.name,
        file: relPath,
        line: lineNum,
        snippet: snippet.length > 80 ? snippet.substring(0, 77) + "..." : snippet,
        severity: "ALTA",
        advice: "Mover las credenciales a variables de entorno (.env) que no se suban al repositorio.",
      });
    }
  }
}

const dateStr = new Date().toLocaleString("es-BO", { timeZone: "America/La_Paz" });

let reportMd = `# Reporte de Auditoría de Fuga de Secretos\n\n`;
reportMd += `**Fecha de Ejecución:** ${dateStr}\n`;
reportMd += `**Proyecto:** Registro y Directorio de Egresados Informática UAJMS\n`;
reportMd += `**Archivos analizados:** ${allFiles.length}\n`;
reportMd += `**Total de Hallazgos:** ${secretFindings.length}\n\n`;

reportMd += `## Resumen de Estado\n\n`;
if (secretFindings.length === 0) {
  reportMd += `> [!NOTE]\n> ✅ **Excelente:** No se detectaron archivos sensibles \`.env\` rastreados en Git ni credenciales, contraseñas de base de datos o tokens privados quemados en el código.\n\n`;
} else {
  reportMd += `| Nivel | Hallazgo | Archivo | Línea |\n`;
  reportMd += `|---|---|---|---|\n`;
  for (const f of secretFindings) {
    reportMd += `| 🔴 ${f.severity} | ${f.name} | \`${f.file}\` | ${f.line} |\n`;
  }
  reportMd += `\n### Detalle de Incidencias\n\n`;
  for (const f of secretFindings) {
    reportMd += `- **[${f.id}] ${f.name}** en \`${f.file}:${f.line}\`\n`;
    reportMd += `  - Recomendación: ${f.advice}\n`;
  }
  reportMd += `\n`;
}

reportMd += `## Protocolo de Seguridad para Despliegue en VPS\n`;
reportMd += `1. **Variables de Entorno en el Servidor:** Copiar \`.env.example\` hacia \`.env\` únicamente en el servidor VPS destino mediante SSH seguro o SCP.\n`;
reportMd += `2. **Generación de Secretos Criptográficos Fuertes:** En el VPS, generar la \`SESSION_SECRET\` con: \`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"\`.\n`;
reportMd += `3. **Credenciales SMTP Seguras:** Utilizar contraseñas de aplicación (App Passwords) de Google u otro proveedor SMTP en lugar de la contraseña personal de la cuenta de correo.\n`;

const outPath = path.join(reportesDir, "reporte_secretos.md");
fs.writeFileSync(outPath, reportMd, "utf8");

console.log(`✅ Reporte de secretos generado con éxito: ${outPath}`);
console.log(`📊 Total de posibles fugas detectadas: ${secretFindings.length}`);
