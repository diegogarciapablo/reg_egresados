import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

console.log("===============================================================");
console.log("🛡️  SUITE DE AUDITORÍA Y SEGURIDAD PRE-DESPLIEGUE (ALUMNI UAJMS)");
console.log("===============================================================\n");

const scripts = [
  "pruebas_desarrollo/scripts/auditar_dependencias.js",
  "pruebas_desarrollo/scripts/auditar_codigo_sast.js",
  "pruebas_desarrollo/scripts/auditar_secretos.js",
  "pruebas_desarrollo/scripts/auditar_cabeceras_http.js",
];

for (const script of scripts) {
  try {
    execSync(`node ${script}`, { cwd: rootDir, stdio: "inherit" });
    console.log("");
  } catch (err) {
    console.error(`⚠️  Advertencia o error al ejecutar ${script}`);
  }
}

console.log("===============================================================");
console.log("✅ AUDITORÍA COMPLETA FINALIZADA");
console.log("📁 Los reportes detallados en Markdown se encuentran en:");
console.log("   pruebas_desarrollo/reportes/");
console.log("===============================================================");
