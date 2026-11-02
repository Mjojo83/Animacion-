#!/usr/bin/env node
import { Command } from "commander";
import { animate } from "./commands/animate";
import { doctor } from "./commands/doctor";
import { render } from "./commands/render";
import { review } from "./commands/review";
import { styleLearn } from "./commands/style-learn";
import { styleNew } from "./commands/style-new";
import { bold, fail, info } from "./lib/log";
import { regenerateManifest } from "./lib/manifest";
import { listStyles, loadStyle } from "./lib/style-io";

const program = new Command();
program
  .name("motion-studio")
  .description("Motion graphics con Remotion + Claude Opus 5.5 y estilos aprendidos de tus referencias.")
  .version("0.1.0")
  .showHelpAfterError();

const estilo = program.command("estilo").description("Crear, aprender y consultar estilos (styles/<nombre>)");

estilo
  .command("nuevo <nombre>")
  .description("Crea la carpeta de un estilo nuevo a partir de la plantilla")
  .action((nombre: string) => run(() => styleNew(nombre)));

estilo
  .command("aprender <nombre>")
  .description("Analiza styles/<nombre>/references con Opus y escribe style.json + STYLE.md")
  .option("--max-imagenes <n>", "máximo de imágenes a enviar", (v) => Number(v), 20)
  .option("--frames-por-video <n>", "frames que se extraen de cada video", (v) => Number(v), 6)
  .action((nombre: string, o) => run(() => styleLearn(nombre, { maxImagenes: o.maxImagenes, framesPorVideo: o.framesPorVideo })));

estilo
  .command("listar")
  .description("Lista los estilos disponibles")
  .action(() =>
    run(() => {
      for (const s of listStyles()) {
        const st = loadStyle(s);
        console.log(`${bold(s)} v${st.json.version} · ${st.json.motion.tempo} · ${st.exemplars.length} ejemplares\n  ${st.json.summary}`);
      }
    }),
  );

estilo
  .command("ver <nombre>")
  .description("Muestra el resumen de un estilo")
  .action((nombre: string) =>
    run(() => {
      const st = loadStyle(nombre);
      console.log(bold(`${st.name} v${st.json.version}`));
      console.log(st.json.summary);
      info(`Mood: ${st.json.mood.join(", ")}`);
      info(`Paleta: fondo ${st.json.palette.background} · texto ${st.json.palette.foreground} · primario ${st.json.palette.primary} · acento ${st.json.palette.accent}`);
      info(`Tipografía: ${st.json.typography.display.family} ${st.json.typography.display.weight} / ${st.json.typography.body.family}`);
      info(`Movimiento: ${st.json.motion.tempo} · entradas ${st.json.motion.durations.short}f · stagger ${st.json.motion.staggerFrames}f · easing out ${st.json.motion.easing.out}`);
      info(`Firma: ${st.json.motion.signatureMoves.join(" | ")}`);
      info(`Nunca: ${st.json.doNot.join(" | ")}`);
      info(`Ejemplares: ${st.exemplars.map((e) => e.file).join(", ") || "ninguno"}`);
    }),
  );

program
  .command("animar <estilo> <brief...>")
  .description('Genera una composición: animar mi-estilo "intro de 10 s para un podcast de ciencia"')
  .option("-n, --nombre <Id>", "Id de la composición (PascalCase); si no, se deriva del brief")
  .option("-d, --duracion <segundos>", "duración en segundos", (v) => Number(v), 10)
  .option("-f, --formato <ratio>", "16:9, 9:16, 1:1, 4:5, 21:9", "16:9")
  .option("--fps <n>", "frames por segundo (por defecto el del estilo)", (v) => Number(v))
  .option("--refs <n>", "cuántas imágenes de referencia enviar", (v) => Number(v), 6)
  .option("--iteraciones <n>", "intentos de corrección de tipos", (v) => Number(v), 2)
  .action((estiloName: string, brief: string[], o) =>
    run(() => animate(estiloName, brief.join(" "), { nombre: o.nombre, duracion: o.duracion, formato: o.formato, fps: o.fps, refs: o.refs, iteraciones: o.iteraciones })),
  );

program
  .command("revisar <composicion>")
  .description("Renderiza, extrae frames y pide a Opus una crítica contra el estilo (opcional: corrige y aprueba)")
  .option("-e, --estilo <nombre>", "estilo contra el que comparar (por defecto el de meta.style)")
  .option("--frames <n>", "frames a extraer", (v) => Number(v), 12)
  .option("--refs <n>", "imágenes de referencia a enviar", (v) => Number(v), 4)
  .option("--fix", "aplica los fixes con Opus, re-renderiza y re-evalúa", false)
  .option("--iteraciones <n>", "máximo de rondas de corrección con --fix", (v) => Number(v), 2)
  .option("--aprobar", "copia la pieza a exemplars/ y guarda las lecciones", false)
  .option("--no-render", "reutiliza out/<Id>/<Id>.mp4 si existe")
  .action((comp: string, o) =>
    run(() => review(comp, { estilo: o.estilo, frames: o.frames, refs: o.refs, fix: o.fix, iteraciones: o.iteraciones, aprobar: o.aprobar, render: o.render })),
  );

program
  .command("render <composicion>")
  .description("Renderiza una composición a video (envuelve `remotion render`)")
  .option("-o, --salida <ruta>", "archivo de salida (por defecto out/<Id>.mp4)")
  .option("--codec <codec>", "h264, h265, vp8, vp9, prores, gif", "h264")
  .option("--escala <n>", "escala de salida (0.5 = mitad)", (v) => Number(v), 1)
  .option("--calidad <n>", "calidad JPEG de los frames (1-100)", (v) => Number(v))
  .action((comp: string, o) => run(() => render(comp, { salida: o.salida, codec: o.codec, escala: o.escala, calidad: o.calidad })));

program
  .command("manifest")
  .description("Regenera src/compositions/manifest.ts con todas las composiciones")
  .action(() =>
    run(() => {
      const r = regenerateManifest();
      console.log(`Composiciones: ${r.included.join(", ") || "ninguna"}`);
      if (r.skipped.length) info(`Omitidas (sin meta/Component): ${r.skipped.join(", ")}`);
    }),
  );

program
  .command("doctor")
  .description("Comprueba Node, ffmpeg, dependencias y credenciales")
  .action(() => {
    if (!doctor()) process.exitCode = 1;
  });

const run = async (fn: () => void | Promise<void>) => {
  try {
    await fn();
  } catch (e) {
    fail(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  }
};

program.parseAsync(process.argv);
