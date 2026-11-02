import path from "node:path";
import { ok, step } from "../lib/log";
import { readMeta } from "../lib/manifest";
import { ENTRY, OUT_DIR, ROOT } from "../lib/paths";
import { remotion } from "../lib/typecheck";

export type RenderOptions = { salida?: string; codec: string; escala: number; calidad?: number };

export const render = (id: string, opts: RenderOptions): void => {
  readMeta(id); // valida que exista
  const ext = opts.codec === "gif" ? "gif" : opts.codec === "vp8" || opts.codec === "vp9" ? "webm" : opts.codec === "prores" ? "mov" : "mp4";
  const out = opts.salida ?? path.join(OUT_DIR, `${id}.${ext}`);
  const args = ["render", ENTRY, id, out, `--codec=${opts.codec}`, `--scale=${opts.escala}`];
  if (opts.calidad !== undefined) args.push(`--jpeg-quality=${opts.calidad}`);
  step(`Renderizando ${id} (${opts.codec}, escala ${opts.escala})`);
  if (!remotion(args)) throw new Error("El render falló.");
  ok(`Listo: ${path.relative(ROOT, out)}`);
};
