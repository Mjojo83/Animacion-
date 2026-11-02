import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import fs from "node:fs";
import path from "node:path";
import { EFFORT, MODEL, assertUsable, client, describeModel, imageBlock, reportUsage, textBlock } from "../lib/claude";
import { bold, dim, green, info, ok, red, step, warn, yellow } from "../lib/log";
import { readMeta } from "../lib/manifest";
import { contactSheet, extractFrames, prepareReferences, requireFfmpeg } from "../lib/media";
import { ENTRY, OUT_DIR, ROOT } from "../lib/paths";
import { CRITIC_SYSTEM, styleContext } from "../lib/prompts";
import { addExemplar, appendLessons, loadStyle } from "../lib/style-io";
import { remotion } from "../lib/typecheck";
import { CritiqueSchema, type Critique } from "../schemas";
import { animatorSystem, streamAnimator, writeAndFix } from "./animate";

export type ReviewOptions = {
  estilo?: string;
  frames: number;
  fix: boolean;
  iteraciones: number;
  aprobar: boolean;
  render: boolean;
  refs: number;
};

const renderMp4 = (id: string, out: string): string => {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  step(`Renderizando ${id} → ${path.relative(ROOT, out)}`);
  if (!remotion(["render", ENTRY, id, out])) throw new Error("El render falló (ver salida de Remotion arriba).");
  return out;
};

const critique = async (id: string, styleName: string, mp4: string, round: number, opts: ReviewOptions): Promise<Critique> => {
  const style = loadStyle(styleName);
  const meta = readMeta(id);
  const dir = path.join(OUT_DIR, id, `review-${round}`);
  fs.rmSync(dir, { recursive: true, force: true });
  step(`Extrayendo ${opts.frames} frames y hoja de contacto`);
  const frames = extractFrames(mp4, path.join(dir, "frames"), opts.frames, { maxWidth: 1280, labels: true, fps: meta.fps });
  const sheet = contactSheet(
    frames.map((f) => f.file),
    path.join(dir, "contact-sheet.jpg"),
    4,
    480,
    Math.round((480 * meta.height) / meta.width),
  );
  const refs = prepareReferences(style.dir, opts.refs);
  const code = fs.readFileSync(meta.file, "utf8");

  const content: Anthropic.ContentBlockParam[] = [textBlock(styleContext(style, { exemplars: 0 }))];
  if (refs.length > 0) {
    content.push(textBlock(`## Referencias del estilo (${refs.length}) — el objetivo a parecerse`));
    refs.forEach((r, i) => {
      content.push(textBlock(`Referencia ${i + 1}: ${r.note}`));
      content.push(imageBlock(r.file));
    });
  }
  content.push(textBlock(`## Pieza a evaluar: ${id} (${meta.width}x${meta.height}, ${meta.fps} fps, ${meta.durationInFrames} frames)\nHoja de contacto con ${frames.length} frames en orden (etiqueta = número de frame y segundo):`));
  content.push(imageBlock(sheet));
  const detail = frames.filter((_, i) => i % Math.max(1, Math.round(frames.length / 6)) === 0).slice(0, 6);
  content.push(textBlock(`Frames sueltos a mayor tamaño (${detail.length}):`));
  detail.forEach((f) => {
    content.push(textBlock(`f${f.frame} · ${f.t.toFixed(2)}s`));
    content.push(imageBlock(f.file));
  });
  content.push(textBlock(`## Código Remotion de la pieza\n\`\`\`tsx\n${code}\n\`\`\`\n\nEvalúa la pieza contra el estilo y devuelve la crítica estructurada.`));

  step(`Crítica con ${describeModel()}`);
  const response = await client().messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: [textBlock(CRITIC_SYSTEM, true)],
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(CritiqueSchema), effort: EFFORT },
  });
  assertUsable(response);
  reportUsage(response.usage, "Uso (crítica)");
  const result = response.parsed_output;
  if (!result) throw new Error("La crítica no se pudo validar contra el esquema. Vuelve a intentar.");

  fs.writeFileSync(path.join(dir, "critique.json"), JSON.stringify(result, null, 2));
  fs.writeFileSync(path.join(dir, "critique.md"), critiqueMarkdown(id, result));
  printCritique(result);
  info(`Guardado en ${path.relative(ROOT, dir)}/ (critique.md, contact-sheet.jpg, frames/)`);
  return result;
};

const scoreColor = (n: number) => (n >= 8 ? green : n >= 6 ? yellow : red);

const printCritique = (c: Critique): void => {
  console.log("");
  const s = c.scores;
  console.log(
    `${bold("Notas")}  estilo ${scoreColor(s.styleAdherence)(s.styleAdherence.toFixed(1))} · movimiento ${scoreColor(s.motionQuality)(s.motionQuality.toFixed(1))} · tipografía ${scoreColor(s.typography)(s.typography.toFixed(1))} · composición ${scoreColor(s.composition)(s.composition.toFixed(1))} · legibilidad ${scoreColor(s.readability)(s.readability.toFixed(1))} → ${bold(scoreColor(s.overall)(`global ${s.overall.toFixed(1)}`))}`,
  );
  console.log(`${bold("Veredicto")} ${c.verdict === "approve" ? green("APROBAR") : yellow("REVISAR")}`);
  console.log(c.summary);
  if (c.issues.length) {
    console.log(bold("Issues:"));
    for (const i of c.issues) console.log(`  ${i.severity === "high" ? red("●") : i.severity === "medium" ? yellow("●") : dim("●")} ${i.frame !== null ? `f${i.frame} · ` : ""}${i.description}\n    ${dim("→ " + i.fix)}`);
  }
  if (c.lessons.length) console.log(`${bold("Lecciones para el estilo:")}\n${c.lessons.map((l) => `  · ${l}`).join("\n")}`);
  console.log("");
};

const critiqueMarkdown = (id: string, c: Critique): string => {
  const s = c.scores;
  return [
    `# Revisión de ${id}`,
    "",
    `| Estilo | Movimiento | Tipografía | Composición | Legibilidad | Global |`,
    `|---|---|---|---|---|---|`,
    `| ${s.styleAdherence} | ${s.motionQuality} | ${s.typography} | ${s.composition} | ${s.readability} | **${s.overall}** |`,
    "",
    `**Veredicto:** ${c.verdict}`,
    "",
    c.summary,
    "",
    "## Fortalezas",
    ...c.strengths.map((x) => `- ${x}`),
    "",
    "## Issues",
    ...c.issues.map((i) => `- **${i.severity}** ${i.frame !== null ? `(f${i.frame}) ` : ""}${i.description}\n  - Fix: ${i.fix}`),
    "",
    "## Lecciones para el estilo",
    ...c.lessons.map((x) => `- ${x}`),
    "",
  ].join("\n");
};

export const review = async (id: string, opts: ReviewOptions): Promise<void> => {
  requireFfmpeg();
  const meta = readMeta(id);
  const styleName = opts.estilo ?? meta.style;
  if (!styleName) throw new Error("No sé con qué estilo comparar: pásalo con --estilo <nombre>.");
  const mp4 = path.join(OUT_DIR, id, `${id}.mp4`);
  let round = 1;
  if (opts.render || !fs.existsSync(mp4)) renderMp4(id, mp4);
  else info(`Usando render existente ${path.relative(ROOT, mp4)} (quita --no-render para re-renderizar)`);

  let result = await critique(id, styleName, mp4, round, opts);

  if (opts.fix) {
    const system = animatorSystem();
    for (let i = 0; i < opts.iteraciones && result.verdict === "revise"; i++) {
      step(`Corrigiendo la pieza según la crítica (${i + 1}/${opts.iteraciones})`);
      const style = loadStyle(styleName);
      const code = fs.readFileSync(meta.file, "utf8");
      const history: Anthropic.MessageParam[] = [
        {
          role: "user",
          content: [
            textBlock(styleContext(style)),
            textBlock(
              `## Pieza actual: src/compositions/${id}.tsx\n\`\`\`tsx\n${code}\n\`\`\`\n\n## Crítica del director\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n\nAplica TODOS los fixes (prioriza high y medium), conserva lo que funciona y devuelve el archivo COMPLETO en un solo bloque \`\`\`tsx. Mantén meta.id = "${id}" y el import del estilo.`,
            ),
          ],
        },
      ];
      const response = await streamAnimator(history, system);
      reportUsage(response.usage, "Uso (corrección)");
      const fixed = await writeAndFix(id, styleName, response, history, system, 2);
      if (!fixed.ok) break;
      round++;
      renderMp4(id, mp4);
      result = await critique(id, styleName, mp4, round, opts);
    }
  }

  if (opts.aprobar || (opts.fix && result.verdict === "approve")) {
    if (result.verdict !== "approve" && !opts.aprobar) return;
    const dst = addExemplar(styleName, meta.file);
    appendLessons(styleName, result.lessons, id);
    ok(`Aprobada: copiada a ${path.relative(ROOT, dst)} y lecciones añadidas a styles/${styleName}/lessons.md`);
  } else if (result.verdict === "approve") {
    info(`Para que sirva de ejemplo en futuras piezas: npm run revisar -- ${id} --no-render --aprobar`);
  } else {
    warn(`Veredicto: revisar. Corrección automática: npm run revisar -- ${id} --no-render --fix`);
  }
};
