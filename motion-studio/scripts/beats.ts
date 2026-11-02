/**
 * Detecta beats/onsets de un audio y escribe <audio>.beats.json junto al archivo.
 *   npm run beats -- public/demo/clicks.wav [--min-gap 0.12] [--sensibilidad 1.5]
 * Usa ffmpeg para decodificar a PCM mono 22050 Hz y un detector de energía
 * (flujo de energía positivo con umbral adaptativo). Determinista, sin dependencias.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
if (!file) {
  console.error("Uso: npm run beats -- <audio> [--min-gap 0.12] [--sensibilidad 1.5]");
  process.exit(1);
}
const opt = (name: string, def: number) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};
const minGap = opt("--min-gap", 0.12);
const sensitivity = opt("--sensibilidad", 1.5);

const SR = 22050;
const HOP = 512; // ≈ 23 ms

const r = spawnSync("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "s16le", "-acodec", "pcm_s16le", "-"], { maxBuffer: 1024 * 1024 * 512 });
if (r.status !== 0) {
  console.error(`ffmpeg falló: ${r.stderr?.toString()}`);
  process.exit(1);
}
const pcm = new Int16Array(r.stdout.buffer, r.stdout.byteOffset, Math.floor(r.stdout.byteLength / 2));
const nFrames = Math.floor(pcm.length / HOP);
const energy = new Float64Array(nFrames);
for (let i = 0; i < nFrames; i++) {
  let sum = 0;
  for (let j = 0; j < HOP; j++) {
    const v = pcm[i * HOP + j] / 32768;
    sum += v * v;
  }
  energy[i] = Math.sqrt(sum / HOP);
}
// flujo: solo subidas de energía
const flux = new Float64Array(nFrames);
flux[0] = energy[0]; // un golpe en t=0 también cuenta (antes del audio hay silencio)
for (let i = 1; i < nFrames; i++) flux[i] = Math.max(0, energy[i] - energy[i - 1]);

// umbral adaptativo: media + k·desv en ventana de ±20 frames (~0.9 s)
const W = 20;
const beats: number[] = [];
const strengths: number[] = [];
let last = -Infinity;
for (let i = 0; i < nFrames - 1; i++) {
  const a = Math.max(0, i - W);
  const b = Math.min(nFrames, i + W);
  let mean = 0;
  for (let k = a; k < b; k++) mean += flux[k];
  mean /= b - a;
  let sd = 0;
  for (let k = a; k < b; k++) sd += (flux[k] - mean) ** 2;
  sd = Math.sqrt(sd / (b - a));
  const thr = mean + sensitivity * sd + 0.002;
  const t = (i * HOP) / SR;
  const prev = i > 0 ? flux[i - 1] : 0;
  if (flux[i] > thr && flux[i] >= prev && flux[i] >= flux[i + 1] && t - last >= minGap) {
    beats.push(Number(t.toFixed(3)));
    strengths.push(flux[i]);
    last = t;
  }
}
const maxS = Math.max(...strengths, 1e-9);
const norm = strengths.map((s) => Number((s / maxS).toFixed(3)));
let bpm: number | null = null;
if (beats.length > 3) {
  const gaps = beats.slice(1).map((t, i) => t - beats[i]).sort((x, y) => x - y);
  const median = gaps[Math.floor(gaps.length / 2)];
  const near = gaps.filter((g) => Math.abs(g - median) < median * 0.2);
  const mean = near.reduce((a, b) => a + b, 0) / near.length;
  bpm = Math.round(60 / mean);
}
const out = path.join(path.dirname(file), `${path.parse(file).name}.beats.json`);
fs.writeFileSync(out, JSON.stringify({ file: path.basename(file), beats, strengths: norm, bpm }, null, 2));
console.log(`${beats.length} beats · bpm≈${bpm ?? "?"} · ${out}`);
console.log(beats.slice(0, 12).map((t) => t.toFixed(2)).join(" ") + (beats.length > 12 ? " …" : ""));
