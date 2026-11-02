import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { warn } from "./log";

export const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
export const VIDEO_EXT = new Set([".mp4", ".mov", ".webm", ".mkv", ".m4v", ".avi"]);

export const isImage = (f: string) => IMAGE_EXT.has(path.extname(f).toLowerCase());
export const isVideo = (f: string) => VIDEO_EXT.has(path.extname(f).toLowerCase());

const run = (cmd: string, args: string[]): { ok: boolean; out: string } => {
  const r = spawnSync(cmd, args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
};

export const hasFfmpeg = (): boolean => run("ffmpeg", ["-version"]).ok && run("ffprobe", ["-version"]).ok;

export const requireFfmpeg = (): void => {
  if (!hasFfmpeg()) {
    throw new Error("Necesitas ffmpeg y ffprobe en el PATH. macOS: brew install ffmpeg · Ubuntu: sudo apt install ffmpeg · Windows: winget install ffmpeg");
  }
};

/** Duración en segundos. */
export const mediaDuration = (file: string): number => {
  const r = run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file]);
  const n = parseFloat(r.out.trim());
  return Number.isFinite(n) ? n : 0;
};

/** Frames por segundo reales de un video. */
export const mediaFps = (file: string): number => {
  const r = run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "default=nw=1:nk=1", file]);
  const [a, b] = r.out.trim().split("/").map(Number);
  return a && b ? a / b : 30;
};

const escapeDrawtext = (s: string) => s.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'").replace(/%/g, "%%");

/**
 * Extrae un frame en el segundo `t`, escalado a `maxWidth`, con etiqueta
 * opcional (número de frame y tiempo). Si drawtext no está disponible en
 * este ffmpeg, lo guarda sin etiqueta.
 */
export const extractFrameAt = (video: string, t: number, out: string, opts: { maxWidth?: number; label?: string } = {}): string => {
  const maxWidth = opts.maxWidth ?? 1280;
  const scale = `scale='min(${maxWidth},iw)':-2`;
  const base = ["-y", "-v", "error", "-ss", t.toFixed(3), "-i", video, "-frames:v", "1", "-q:v", "3"];
  if (opts.label) {
    const vf = `${scale},drawtext=text='${escapeDrawtext(opts.label)}':x=14:y=14:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=10`;
    const r = run("ffmpeg", [...base, "-vf", vf, out]);
    if (r.ok) return out;
  }
  const r = run("ffmpeg", [...base, "-vf", scale, out]);
  if (!r.ok) throw new Error(`ffmpeg falló extrayendo frame: ${r.out}`);
  return out;
};

/** N frames repartidos uniformemente en el video. */
export const extractFrames = (video: string, outDir: string, count: number, opts: { maxWidth?: number; labels?: boolean; fps?: number } = {}): Array<{ file: string; t: number; frame: number }> => {
  fs.mkdirSync(outDir, { recursive: true });
  const dur = mediaDuration(video);
  const fps = opts.fps ?? mediaFps(video);
  const n = Math.max(1, count);
  const result: Array<{ file: string; t: number; frame: number }> = [];
  for (let i = 0; i < n; i++) {
    // evitamos el frame 0 exacto y el último (suelen ser negros o cortados)
    const t = n === 1 ? dur / 2 : (dur * (i + 0.5)) / n;
    const frame = Math.round(t * fps);
    const file = path.join(outDir, `frame-${String(i).padStart(3, "0")}.jpg`);
    extractFrameAt(video, t, file, { maxWidth: opts.maxWidth, label: opts.labels ? `f${frame}  ${t.toFixed(2)}s` : undefined });
    result.push({ file, t, frame });
  }
  return result;
};

/** Normaliza una imagen (jpg, lado máximo `maxSide`) para mandarla a la API. */
export const normalizeImage = (src: string, dst: string, maxSide = 1568): string => {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const vf = `scale='min(${maxSide},iw)':'min(${maxSide},ih)':force_original_aspect_ratio=decrease`;
  const r = run("ffmpeg", ["-y", "-v", "error", "-i", src, "-frames:v", "1", "-vf", vf, "-q:v", "3", dst]);
  if (!r.ok) throw new Error(`ffmpeg falló normalizando ${src}: ${r.out}`);
  return dst;
};

/** Hoja de contacto (mosaico) a partir de una lista de frames. */
export const contactSheet = (frames: string[], out: string, cols = 4, tileW = 480, tileH = 270): string => {
  const tmp = fs.mkdtempSync(path.join(path.dirname(out), "sheet-"));
  frames.forEach((f, i) => fs.copyFileSync(f, path.join(tmp, `t-${String(i).padStart(3, "0")}.jpg`)));
  const rows = Math.ceil(frames.length / cols);
  const vf = `scale=${tileW}:${tileH}:force_original_aspect_ratio=decrease,pad=${tileW}:${tileH}:(ow-iw)/2:(oh-ih)/2:color=0x111111,tile=${cols}x${rows}:padding=6:margin=6:color=0x202020`;
  const r = run("ffmpeg", ["-y", "-v", "error", "-framerate", "1", "-start_number", "0", "-i", path.join(tmp, "t-%03d.jpg"), "-vf", vf, "-frames:v", "1", "-q:v", "3", out]);
  fs.rmSync(tmp, { recursive: true, force: true });
  if (!r.ok) throw new Error(`ffmpeg falló creando la hoja de contacto: ${r.out}`);
  return out;
};

export type PreparedReference = { file: string; source: string; kind: "image" | "video-frame"; note: string };

/**
 * Lee styles/<x>/references, extrae frames de los videos y normaliza todo a
 * jpg en references/_cache. Devuelve hasta `maxImages` imágenes listas.
 */
export const prepareReferences = (styleDir: string, maxImages = 20, framesPerVideo = 6): PreparedReference[] => {
  const refDir = path.join(styleDir, "references");
  if (!fs.existsSync(refDir)) return [];
  const cache = path.join(refDir, "_cache");
  const framesDir = path.join(refDir, "_frames");
  fs.mkdirSync(cache, { recursive: true });
  const entries = fs
    .readdirSync(refDir)
    .filter((f) => !f.startsWith("_") && !f.startsWith("."))
    .sort();
  const images = entries.filter(isImage);
  const videos = entries.filter(isVideo);
  if (images.length + videos.length === 0) return [];

  const out: PreparedReference[] = [];
  for (const v of videos) {
    const src = path.join(refDir, v);
    const dir = path.join(framesDir, path.parse(v).name);
    const frames = extractFrames(src, dir, framesPerVideo, { maxWidth: 1568, labels: false });
    frames.forEach((fr, i) => out.push({ file: fr.file, source: v, kind: "video-frame", note: `${v} · frame ${i + 1}/${frames.length} · t=${fr.t.toFixed(1)}s` }));
  }
  for (const img of images) {
    const src = path.join(refDir, img);
    const dst = path.join(cache, `${path.parse(img).name}.jpg`);
    const fresh = fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= fs.statSync(src).mtimeMs;
    if (!fresh) normalizeImage(src, dst);
    out.push({ file: dst, source: img, kind: "image", note: img });
  }
  if (out.length > maxImages) {
    warn(`Hay ${out.length} referencias; se usan ${maxImages} repartidas (sube --max-imagenes si quieres más).`);
    const step = out.length / maxImages;
    return Array.from({ length: maxImages }, (_, i) => out[Math.floor(i * step)]);
  }
  return out;
};
