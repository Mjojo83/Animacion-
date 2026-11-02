import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { dim, info } from "./log";
import "./paths"; // carga .env

export const MODEL = process.env.MOTION_MODEL ?? "claude-opus-5-5";
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";
const EFFORTS: Effort[] = ["low", "medium", "high", "xhigh", "max"];
export const EFFORT: Effort = EFFORTS.includes(process.env.MOTION_EFFORT as Effort) ? (process.env.MOTION_EFFORT as Effort) : "high";

/**
 * Fallback del lado del servidor: si los clasificadores de seguridad de
 * Opus 5.5 rechazan una petición (raro en motion graphics, pero posible con
 * ciertas imágenes), la API la reintenta sola en otro modelo en la misma
 * llamada. Se puede desactivar con MOTION_NO_FALLBACK=1.
 */
export const FALLBACK_BETA = "server-side-fallback-2026-07-01";
export const useFallback = !process.env.MOTION_NO_FALLBACK;

let _client: Anthropic | null = null;
export const client = (): Anthropic => {
  if (!_client) _client = new Anthropic();
  return _client;
};

const MEDIA: Record<string, "image/png" | "image/jpeg" | "image/webp" | "image/gif"> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

/** Bloque de imagen base64 a partir de un archivo local. */
export const imageBlock = (file: string): Anthropic.ImageBlockParam => {
  const media = MEDIA[path.extname(file).toLowerCase()];
  if (!media) throw new Error(`Formato de imagen no soportado: ${file}`);
  return {
    type: "image",
    source: { type: "base64", media_type: media, data: fs.readFileSync(file).toString("base64") },
  };
};

export const textBlock = (text: string, cache = false): Anthropic.TextBlockParam =>
  cache ? { type: "text", text, cache_control: { type: "ephemeral" } } : { type: "text", text };

/** Precios por millón de tokens (USD). Solo para estimar; la factura real manda. */
const PRICES: Record<string, { in: number; out: number; cacheRead: number; cacheWrite: number }> = {
  "claude-opus-5-5": { in: 4, out: 20, cacheRead: 0.2, cacheWrite: 5 },
  "claude-sonnet-5-5": { in: 2, out: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
};

export type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};

export const reportUsage = (usage: Usage, label: string, model = MODEL): void => {
  const p = PRICES[model];
  const cr = usage.cache_read_input_tokens ?? 0;
  const cw = usage.cache_creation_input_tokens ?? 0;
  let cost = "";
  if (p) {
    const usd = (usage.input_tokens * p.in + usage.output_tokens * p.out + cr * p.cacheRead + cw * p.cacheWrite) / 1e6;
    cost = ` ≈ $${usd.toFixed(3)}`;
  }
  info(`${label}: ${usage.input_tokens} in · ${usage.output_tokens} out · caché ${cr} leídos / ${cw} escritos${cost}`);
};

/** Texto plano de una respuesta (concatena los bloques de texto). */
export const extractText = (msg: { content: Array<{ type: string; text?: string }> }): string =>
  msg.content
    .filter((b): b is { type: "text"; text: string } => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");

export const assertUsable = (msg: { stop_reason: string | null; stop_details?: { category?: string | null; explanation?: string | null } | null }): void => {
  if (msg.stop_reason === "refusal") {
    const d = msg.stop_details;
    throw new Error(`El modelo rechazó la petición (${d?.category ?? "sin categoría"}): ${d?.explanation ?? ""}`);
  }
  if (msg.stop_reason === "max_tokens") {
    throw new Error("La respuesta se cortó por max_tokens. Pide algo más corto o sube el límite.");
  }
};

export const describeModel = (): string => `${MODEL} ${dim(`(effort ${EFFORT}${useFallback ? ", fallback activo" : ""})`)}`;
