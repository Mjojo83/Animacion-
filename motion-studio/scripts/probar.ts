/**
 * Loop de prueba: renderiza composiciones, extrae frames, arma hojas de
 * contacto y corre comprobaciones automáticas. Escribe out/pruebas/REPORTE.md.
 *   npm run probar                 → todas las composiciones del manifest
 *   npm run probar -- DemoVertical → solo esa
 *   npm run probar -- --guias      → DemoVertical con zonas seguras dibujadas
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { contactSheet, extractFrames, mediaDuration, requireFfmpeg } from "../cli/lib/media";
import { ENTRY, OUT_DIR, ROOT, COMPOSITIONS_DIR } from "../cli/lib/paths";
import { readMeta } from "../cli/lib/manifest";
import { remotion } from "../cli/lib/typecheck";

requireFfmpeg();
const args = process.argv.slice(2);
const guides = args.includes("--guias");
const ids = args.filter((a) => !a.startsWith("--"));
const all = fs
  .readdirSync(COMPOSITIONS_DIR)
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => path.parse(f).name)
  .filter((n) => /export\s+const\s+meta\b/.test(fs.readFileSync(path.join(COMPOSITIONS_DIR, `${n}.tsx`), "utf8")));
const targets = ids.length ? ids : all;
const base = path.join(OUT_DIR, "pruebas");
fs.mkdirSync(base, { recursive: true });

type Result = { id: string; ok: boolean; seconds: number; renderSec: number; staticSpans: string[]; checks: string[]; sheet: string; notes: string[] };
const results: Result[] = [];

const PW = 192;
const PH = 108;
const PFPS = 5;

/**
 * Perfil de movimiento: % de píxeles que cambian (>8/255) entre muestras a 5 fps
 * en 192x108 gris. Calibrado con CatalogoPatrones: un Ken Burns lento da ~1-3 %,
 * un anillo que crece ~0.5-1 %, una pantalla quieta 0 %.
 */
const motionProfile = (mp4: string): number[] => {
  const r = spawnSync("ffmpeg", ["-v", "error", "-i", mp4, "-vf", `fps=${PFPS},scale=${PW}:${PH},format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1024 * 1024 * 512 });
  const buf = r.stdout;
  const n = Math.floor(buf.length / (PW * PH));
  const out: number[] = [];
  for (let i = 1; i < n; i++) {
    let changed = 0;
    for (let p = 0; p < PW * PH; p++) if (Math.abs(buf[i * PW * PH + p] - buf[(i - 1) * PW * PH + p]) > 8) changed++;
    out.push((changed / (PW * PH)) * 100);
  }
  return out;
};

/** Tramos de más de `minSec` segundos con menos de `thr` % de píxeles cambiando. */
const staticSpans = (pct: number[], minSec = 2.5, thr = 0.15): string[] => {
  const spans: string[] = [];
  let start = -1;
  for (let i = 0; i <= pct.length; i++) {
    const quiet = i < pct.length && pct[i] < thr;
    if (quiet && start < 0) start = i;
    if (!quiet && start >= 0) {
      const len = (i - start) / PFPS;
      if (len >= minSec) spans.push(`${(start / PFPS).toFixed(1)}s–${(i / PFPS).toFixed(1)}s (${len.toFixed(1)}s)`);
      start = -1;
    }
  }
  return spans;
};

/** Metadatos reales: importa el módulo (tsx) y lee `meta`; si falla, regex. */
const realMeta = async (id: string) => {
  const fallback = readMeta(id);
  try {
    const mod = (await import(path.join(COMPOSITIONS_DIR, `${id}.tsx`))) as { meta?: { fps: number; durationInFrames: number; width: number; height: number; style: string } };
    if (mod.meta) return { ...fallback, ...mod.meta };
  } catch (e) {
    console.log(`  (meta por regex: no se pudo importar el módulo: ${e instanceof Error ? e.message.split("\n")[0] : e})`);
  }
  return fallback;
};

/** Media de |fila i − fila i+4| de un still de 8 filas iguales (fuente del estilo vs control system-ui). */
const rowDiff = (png: string, row: number): number => {
  const crop = (r: number) => {
    const res = spawnSync("ffmpeg", ["-v", "error", "-i", png, "-vf", `crop=iw:ih/8:0:ih/8*${r},scale=384:27,format=gray`, "-f", "rawvideo", "-"], { maxBuffer: 1024 * 1024 * 32 });
    return res.stdout;
  };
  const a = crop(row);
  const b = crop(row + 4);
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) sum += Math.abs(a[i] - b[i]);
  return sum / Math.min(a.length, b.length);
};

const probar = async (id: string) => {
  const t0 = Date.now();
  const dir = path.join(base, id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const mp4 = path.join(dir, `${id}.mp4`);
  const notes: string[] = [];
  const checks: string[] = [];
  console.log(`\n▸ ${id}`);
  const meta = await realMeta(id);
  const renderArgs = ["render", ENTRY, id, mp4, "--scale=0.5", "--log=error"];
  if (guides && id === "DemoVertical") renderArgs.push('--props={"guides":true}');
  const ok = remotion(renderArgs);
  const renderSec = (Date.now() - t0) / 1000;
  if (!ok) {
    results.push({ id, ok: false, seconds: 0, renderSec, staticSpans: [], checks: ["✗ render falló"], sheet: "", notes });
    return;
  }
  const seconds = mediaDuration(mp4);
  const frames = extractFrames(mp4, path.join(dir, "frames"), 8, { maxWidth: 960, labels: true, fps: meta.fps });
  const sheet = contactSheet(frames.map((f) => f.file), path.join(dir, "contact-sheet.jpg"), 4, 480, Math.round((480 * meta.height) / meta.width));
  const diffs = motionProfile(mp4);
  const spans = staticSpans(diffs);
  const expected = meta.durationInFrames / meta.fps;
  checks.push(Math.abs(seconds - expected) < 0.2 ? `✓ duración ${seconds.toFixed(2)}s` : `✗ duración ${seconds.toFixed(2)}s ≠ ${expected.toFixed(2)}s`);
  checks.push(spans.length === 0 ? "✓ sin tramos estáticos > 2.5 s" : `! estático: ${spans.join(", ")}`);
  const firstMotion = Math.max(...diffs.slice(0, PFPS));
  if (id !== "PruebaFuentes") checks.push(firstMotion > 0.3 ? "✓ hay movimiento en el primer segundo" : "! primer segundo casi estático");

  if (id === "PruebaFuentes") {
    const still = path.join(dir, "still.png");
    if (remotion(["still", ENTRY, id, still, "--frame=40", "--log=error"])) {
      const labels = ((await import(path.join(COMPOSITIONS_DIR, "PruebaFuentes.tsx"))) as { FONT_ROWS?: string[] }).FONT_ROWS ?? ["fila 1", "fila 2", "fila 3", "fila 4"];
      labels.forEach((label, i) => {
        const d = rowDiff(still, i);
        checks.push(d > 3 ? `✓ fuente cargada: ${label} (dif. ${d.toFixed(1)})` : `✗ fuente NO cargada: ${label} (igual que system-ui, dif. ${d.toFixed(1)})`);
      });
    }
  }
  if (id === "DemoAudio") {
    const beatsFile = path.join(ROOT, "public", "demo", "clicks.beats.json");
    if (fs.existsSync(beatsFile)) {
      const b = JSON.parse(fs.readFileSync(beatsFile, "utf8")) as { beats: number[]; bpm: number | null };
      const gaps = b.beats.slice(1).map((t, i) => t - b.beats[i]);
      const regular = gaps.filter((g) => Math.abs(g - 0.5) < 0.04).length;
      checks.push(b.beats.length >= 18 && b.beats.length <= 22 ? `✓ ${b.beats.length} beats detectados (esperados 20)` : `✗ ${b.beats.length} beats detectados (esperados 20)`);
      checks.push(regular >= gaps.length - 2 ? `✓ intervalos de 0.5 s (bpm≈${b.bpm})` : `✗ intervalos irregulares: ${gaps.map((g) => g.toFixed(2)).join(" ")}`);
    } else {
      checks.push("✗ falta public/demo/clicks.beats.json (corre: npm run beats -- public/demo/clicks.wav)");
    }
  }
  results.push({ id, ok: true, seconds, renderSec, staticSpans: spans, checks, sheet: path.relative(ROOT, sheet), notes });
  for (const c of checks) console.log("  " + c);
};

for (const id of targets) {
  try {
    await probar(id);
  } catch (e) {
    const msg = e instanceof Error ? e.message.split("\n")[0] : String(e);
    console.log(`  ✗ ${msg}`);
    results.push({ id, ok: false, seconds: 0, renderSec: 0, staticSpans: [], checks: [`✗ ${msg}`], sheet: "", notes: [] });
  }
}

const lines = [
  `# Reporte de pruebas · ${new Date().toISOString()}`,
  "",
  "| Composición | Render | Duración | Tiempo render | Comprobaciones | Hoja de contacto |",
  "|---|---|---|---|---|---|",
  ...results.map((r) => `| ${r.id} | ${r.ok ? "✓" : "✗"} | ${r.seconds.toFixed(1)}s | ${r.renderSec.toFixed(0)}s | ${r.checks.join("<br>")} | ${r.sheet ? `[ver](../../${r.sheet})` : ""} |`),
  "",
  "Mira cada hoja de contacto con tus ojos (o con Read en Claude Code): las comprobaciones automáticas no ven tipografía cortada ni colores fuera del estilo.",
  "",
];
fs.writeFileSync(path.join(base, "REPORTE.md"), lines.join("\n"));
const failed = results.filter((r) => !r.ok || r.checks.some((c) => c.startsWith("✗")));
console.log(`\n${failed.length === 0 ? "✓" : "✗"} ${results.length - failed.length}/${results.length} composiciones OK · out/pruebas/REPORTE.md`);
process.exitCode = failed.length ? 1 : 0;
