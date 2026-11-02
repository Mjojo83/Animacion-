import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import fs from "node:fs";
import path from "node:path";
import { StyleSchema } from "../../src/lib/style-schema";
import { EFFORT, MODEL, assertUsable, client, describeModel, imageBlock, reportUsage, textBlock } from "../lib/claude";
import { bold, info, ok, step, warn } from "../lib/log";
import { prepareReferences, requireFfmpeg } from "../lib/media";
import { ROOT } from "../lib/paths";
import { ANALYST_SYSTEM } from "../lib/prompts";
import { saveLearned, styleDir, styleExists } from "../lib/style-io";
import { StyleAnalysisSchema } from "../schemas";

type Options = { maxImagenes: number; framesPorVideo: number };

/**
 * Aprende un estilo: referencias → Opus 5.5 (visión) → style.json + STYLE.md.
 */
export const styleLearn = async (name: string, opts: Options): Promise<void> => {
  if (!styleExists(name)) throw new Error(`No existe styles/${name}. Créalo con: npm run estilo -- nuevo ${name}`);
  requireFfmpeg();
  const dir = styleDir(name);

  step(`Preparando referencias de styles/${name}/references`);
  const refs = prepareReferences(dir, opts.maxImagenes, opts.framesPorVideo);
  if (refs.length === 0) {
    throw new Error(`No hay referencias en styles/${name}/references. Pon imágenes (png/jpg/webp/gif) o videos (mp4/mov/webm) y vuelve a correr.`);
  }
  ok(`${refs.length} imágenes listas (${refs.filter((r) => r.kind === "video-frame").length} son frames de video)`);

  const notesFile = path.join(dir, "notes.md");
  const notes = fs.existsSync(notesFile) ? fs.readFileSync(notesFile, "utf8") : "";
  const prevFile = path.join(dir, "style.json");
  let prevVersion = 0;
  let prevJson = "";
  if (fs.existsSync(prevFile)) {
    try {
      const prev = StyleSchema.parse(JSON.parse(fs.readFileSync(prevFile, "utf8")));
      prevVersion = prev.version;
      prevJson = JSON.stringify(prev, null, 2);
      info(`Ya existe un style.json (v${prevVersion}); se re-aprende y se guarda copia en style.prev.json`);
    } catch {
      warn("El style.json anterior no es válido; se ignora.");
    }
  }

  const content: Anthropic.ContentBlockParam[] = [];
  content.push(textBlock(`Nombre del estilo (usa exactamente este en style.name): ${name}\nVersión a escribir: ${prevVersion + 1}`));
  if (notes.trim()) content.push(textBlock(`## Notas del usuario (prioridad sobre tu interpretación)\n${notes}`));
  if (prevJson) content.push(textBlock(`## style.json anterior (mejóralo; conserva lo que siga siendo cierto)\n\`\`\`json\n${prevJson}\n\`\`\``));
  content.push(textBlock(`## Referencias (${refs.length})`));
  refs.forEach((r, i) => {
    content.push(textBlock(`Referencia ${i + 1}: ${r.note}`));
    content.push(imageBlock(r.file));
  });
  content.push(textBlock("Analiza todas las referencias y devuelve el estilo destilado."));

  step(`Analizando con ${describeModel()}`);
  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: [textBlock(ANALYST_SYSTEM, true)],
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(StyleAnalysisSchema), effort: EFFORT },
  });
  assertUsable(response);
  reportUsage(response.usage, "Uso");
  const parsed = response.parsed_output;
  if (!parsed) throw new Error("La respuesta no se pudo validar contra el esquema. Vuelve a intentar.");

  const style = { ...parsed.style, name, version: prevVersion + 1 };
  saveLearned(name, style, parsed.styleGuideMarkdown);
  ok(`Guardado styles/${name}/style.json (v${style.version}) y STYLE.md`);
  console.log("");
  console.log(bold(`Resumen: `) + style.summary);
  info(`Mood: ${style.mood.join(", ")}`);
  info(`Paleta: ${style.palette.background} / ${style.palette.foreground} / ${style.palette.primary} / ${style.palette.accent}`);
  info(`Tipografía: ${style.typography.display.family} ${style.typography.display.weight} · cuerpo ${style.typography.body.family}`);
  info(`Tempo: ${style.motion.tempo} · stagger ${style.motion.staggerFrames}f · entradas ${style.motion.durations.short}f`);
  console.log("");
  info(`Revisa y edita a mano si quieres: ${path.relative(ROOT, path.join(dir, "STYLE.md"))}`);
  info(`Luego anima: npm run animar -- ${name} "intro de 10 segundos para ..."`);
};
