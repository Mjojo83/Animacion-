import fs from "node:fs";
import path from "node:path";
import { COMPOSITIONS_DIR } from "./paths";

/** Regenera src/compositions/manifest.ts con todas las composiciones válidas. */
export const regenerateManifest = (): { included: string[]; skipped: string[] } => {
  const files = fs
    .readdirSync(COMPOSITIONS_DIR)
    .filter((f) => f.endsWith(".tsx") && !f.startsWith("_"))
    .sort();
  const included: string[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    const code = fs.readFileSync(path.join(COMPOSITIONS_DIR, f), "utf8");
    const name = path.parse(f).name;
    if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) && /export\s+const\s+meta\b/.test(code) && /export\s+const\s+Component\b/.test(code)) {
      included.push(name);
    } else {
      skipped.push(f);
    }
  }
  const lines = [
    "// GENERADO por `npm run manifest`. No editar a mano: se sobrescribe.",
    'import type { CompositionModule } from "../lib/composition";',
    ...included.map((n) => `import * as ${n} from "./${n}";`),
    "",
    `export const compositions: CompositionModule[] = [${included.join(", ")}];`,
    "",
  ];
  fs.writeFileSync(path.join(COMPOSITIONS_DIR, "manifest.ts"), lines.join("\n"));
  return { included, skipped };
};

/** Lee el `meta` de una composición sin ejecutar React (regex sobre el archivo). */
export const readMeta = (compositionId: string): { file: string; style: string | null; fps: number; durationInFrames: number; width: number; height: number } => {
  const file = path.join(COMPOSITIONS_DIR, `${compositionId}.tsx`);
  if (!fs.existsSync(file)) throw new Error(`No existe src/compositions/${compositionId}.tsx`);
  const code = fs.readFileSync(file, "utf8");
  // Solo miramos dentro de `export const meta = { ... }` para no confundirnos con otros objetos.
  const block = code.match(/export\s+const\s+meta[^=]*=\s*\{([\s\S]*?)\};/)?.[1] ?? code;
  const pick = (key: string) => {
    const m = block.match(new RegExp(`\\b${key}\\s*:\\s*([0-9]+)`));
    return m ? Number(m[1]) : NaN;
  };
  const styleMatch = block.match(/\bstyle\s*:\s*["'`]([^"'`]+)["'`]/);
  return {
    file,
    style: styleMatch ? styleMatch[1] : null,
    fps: pick("fps") || 30,
    durationInFrames: pick("durationInFrames") || 300,
    width: pick("width") || 1920,
    height: pick("height") || 1080,
  };
};
