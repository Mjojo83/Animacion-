import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Raíz del proyecto (donde está package.json). */
export const ROOT = path.resolve(here, "..", "..");
export const STYLES_DIR = path.join(ROOT, "styles");
export const TEMPLATE_DIR = path.join(STYLES_DIR, "_template");
export const COMPOSITIONS_DIR = path.join(ROOT, "src", "compositions");
export const LIB_DIR = path.join(ROOT, "src", "lib");
export const OUT_DIR = path.join(ROOT, "out");
export const ENTRY = path.join(ROOT, "src", "index.ts");

// Carga .env si existe (Node >= 20.12 trae loadEnvFile).
try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch {
  /* sin .env: usamos las variables del entorno tal cual */
}
