import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import path from "node:path";
import { FORMATS } from "../../src/lib/composition";
import { EFFORT, FALLBACK_BETA, MODEL, assertUsable, client, describeModel, extractText, imageBlock, reportUsage, textBlock, useFallback } from "../lib/claude";
import { bold, dim, fail, info, ok, step, warn } from "../lib/log";
import { regenerateManifest } from "../lib/manifest";
import { prepareReferences } from "../lib/media";
import { COMPOSITIONS_DIR, ROOT } from "../lib/paths";
import { ANIMATOR_SYSTEM, libSources, styleContext } from "../lib/prompts";
import { loadStyle, type LoadedStyle } from "../lib/style-io";
import { typecheck } from "../lib/typecheck";

export type AnimateOptions = {
  nombre?: string;
  duracion: number; // segundos
  formato: string; // "16:9" | "9:16" | ...
  fps?: number;
  refs: number; // máximo de imágenes de referencia a enviar
  iteraciones: number; // intentos de corrección de tipos
};

/** Convierte un brief en un Id PascalCase válido y único. */
export const deriveId = (brief: string, preferred?: string): string => {
  const base = (preferred ?? brief)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && !/^(de|la|el|los|las|un|una|para|con|y|a|en|the|of|for|and)$/i.test(w))
    .slice(0, preferred ? 10 : 4)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");
  let id = /^[A-Za-z]/.test(base) ? base : `Pieza${base}`;
  if (!id) id = "Pieza";
  let candidate = id;
  let n = 2;
  while (fs.existsSync(path.join(COMPOSITIONS_DIR, `${candidate}.tsx`))) candidate = `${id}${n++}`;
  return candidate;
};

/** Saca el bloque de código más largo de una respuesta. */
export const extractCode = (text: string): string | null => {
  const blocks = [...text.matchAll(/```(?:tsx|typescript|ts|jsx)?\s*\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (blocks.length === 0) return null;
  return blocks.sort((a, b) => b.length - a.length)[0].trimEnd() + "\n";
};

const validateCode = (code: string, id: string, styleName: string): string[] => {
  const problems: string[] = [];
  if (!/export\s+const\s+meta\b/.test(code)) problems.push("Falta `export const meta`.");
  if (!/export\s+const\s+Component\b/.test(code)) problems.push("Falta `export const Component`.");
  if (!new RegExp(`id:\\s*["'\`]${id}["'\`]`).test(code)) problems.push(`meta.id debe ser exactamente "${id}".`);
  if (!code.includes(`styles/${styleName}/style.json`)) problems.push(`Debe importar ../../styles/${styleName}/style.json.`);
  if (/transition\s*:|animation\s*:|@keyframes|setTimeout|requestAnimationFrame|Math\.random/.test(code)) problems.push("No uses CSS transitions/animations, timers ni Math.random: todo debe depender del frame.");
  return problems;
};

/** Llama al modelo en streaming y devuelve el mensaje final. */
export const streamAnimator = async (messages: Anthropic.MessageParam[], system: Anthropic.TextBlockParam[]): Promise<Anthropic.Message> => {
  let chars = 0;
  const onText = (t: string) => {
    chars += t.length;
    if (chars % 2000 < t.length) process.stdout.write(dim("."));
  };
  let final: Anthropic.Message;
  if (useFallback) {
    const stream = client().beta.messages.stream({
      model: MODEL,
      max_tokens: 64000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      output_config: { effort: EFFORT },
      system,
      messages,
    });
    stream.on("text", onText);
    final = (await stream.finalMessage()) as unknown as Anthropic.Message;
  } else {
    const stream = client().messages.stream({
      model: MODEL,
      max_tokens: 64000,
      output_config: { effort: EFFORT },
      system,
      messages,
    });
    stream.on("text", onText);
    final = await stream.finalMessage();
  }
  process.stdout.write("\n");
  assertUsable(final);
  return final;
};

export const animatorSystem = (): Anthropic.TextBlockParam[] => [
  textBlock(ANIMATOR_SYSTEM),
  textBlock(`## Código fuente de src/lib (usa estos helpers y respeta sus tipos)\n\n${libSources()}`, true),
];

/**
 * Escribe la composición, regenera el manifest y corrige errores de tipos
 * conversando con el modelo hasta `iteraciones` veces.
 */
export const writeAndFix = async (
  id: string,
  styleName: string,
  firstResponse: Anthropic.Message,
  history: Anthropic.MessageParam[],
  system: Anthropic.TextBlockParam[],
  iteraciones: number,
): Promise<{ file: string; ok: boolean }> => {
  const file = path.join(COMPOSITIONS_DIR, `${id}.tsx`);
  let response = firstResponse;
  for (let attempt = 0; attempt <= iteraciones; attempt++) {
    const text = extractText(response);
    const code = extractCode(text);
    const problems = code ? validateCode(code, id, styleName) : ["La respuesta no contiene un bloque ```tsx con el archivo."];
    if (code) {
      fs.writeFileSync(file, code);
      regenerateManifest();
    }
    let tsOutput = "";
    if (problems.length === 0) {
      step("Comprobando tipos (tsc)");
      const tc = typecheck();
      if (tc.ok) {
        ok("Sin errores de tipos");
        return { file, ok: true };
      }
      tsOutput = tc.output;
      warn(`Errores de tipos:\n${tsOutput.split("\n").slice(0, 12).join("\n")}`);
    } else {
      warn(`Problemas de contrato: ${problems.join(" ")}`);
    }
    if (attempt === iteraciones) break;
    step(`Pidiendo corrección (${attempt + 1}/${iteraciones})`);
    history.push({ role: "assistant", content: response.content.filter((b) => b.type === "text") });
    history.push({
      role: "user",
      content: `Corrige y devuelve el archivo COMPLETO otra vez en un solo bloque \`\`\`tsx.\n${problems.length ? `Problemas de contrato:\n- ${problems.join("\n- ")}\n` : ""}${tsOutput ? `Errores de TypeScript:\n\`\`\`\n${tsOutput.slice(0, 6000)}\n\`\`\`` : ""}`,
    });
    response = await streamAnimator(history, system);
    reportUsage(response.usage, "Uso (corrección)");
  }
  fail(`No se pudo dejar ${path.relative(ROOT, file)} sin errores. Ábrelo y corrígelo a mano o corre de nuevo.`);
  return { file, ok: false };
};

export const buildBrief = (style: LoadedStyle, brief: string, id: string, opts: AnimateOptions): Anthropic.ContentBlockParam[] => {
  const fmt = FORMATS[opts.formato];
  if (!fmt) throw new Error(`Formato desconocido "${opts.formato}". Usa: ${Object.keys(FORMATS).join(", ")}`);
  const fps = opts.fps ?? style.json.layout.fps ?? 30;
  const frames = Math.round(opts.duracion * fps);
  const content: Anthropic.ContentBlockParam[] = [textBlock(styleContext(style))];
  const refs = prepareReferences(style.dir, opts.refs);
  if (refs.length > 0) {
    content.push(textBlock(`## Referencias visuales del estilo (${refs.length})`));
    refs.forEach((r, i) => {
      content.push(textBlock(`Referencia ${i + 1}: ${r.note}`));
      content.push(imageBlock(r.file));
    });
  }
  content.push(
    textBlock(
      `## BRIEF\n${brief}\n\n## Parámetros\n- Id de la composición: ${id}\n- Estilo: ${style.name} (importa ../../styles/${style.name}/style.json)\n- Formato: ${opts.formato} → width ${fmt.width}, height ${fmt.height}\n- fps: ${fps}\n- durationInFrames: ${frames} (${opts.duracion} s)\n\nEscribe el guion por frames y luego el archivo completo.`,
    ),
  );
  return content;
};

export const animate = async (styleName: string, brief: string, opts: AnimateOptions): Promise<void> => {
  const style = loadStyle(styleName);
  const id = deriveId(brief, opts.nombre);
  step(`Composición ${bold(id)} · estilo ${bold(style.name)} · ${opts.formato} · ${opts.duracion}s`);
  const system = animatorSystem();
  const history: Anthropic.MessageParam[] = [{ role: "user", content: buildBrief(style, brief, id, opts) }];
  step(`Generando con ${describeModel()}`);
  const response = await streamAnimator(history, system);
  reportUsage(response.usage, "Uso");
  const result = await writeAndFix(id, style.name, response, history, system, opts.iteraciones);
  console.log("");
  ok(`Archivo: ${path.relative(ROOT, result.file)}`);
  console.log(bold("Siguientes pasos:"));
  info(`Ver en vivo:   npm run studio         (abre Remotion Studio y elige ${id})`);
  info(`Revisar:       npm run revisar -- ${id} --fix   (render → frames → crítica de Opus → corrección)`);
  info(`Renderizar:    npm run ms -- render ${id}`);
};
