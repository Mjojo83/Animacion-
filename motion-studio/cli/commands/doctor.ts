import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { MODEL } from "../lib/claude";
import { bold, fail, info, ok, warn } from "../lib/log";
import { ROOT } from "../lib/paths";
import { listStyles } from "../lib/style-io";

const has = (cmd: string, args: string[] = ["-version"]) => spawnSync(cmd, args, { encoding: "utf8", shell: process.platform === "win32" }).status === 0;

/** Comprueba que la máquina tiene todo lo necesario. */
export const doctor = (): boolean => {
  let good = true;
  console.log(bold("motion-studio · diagnóstico"));
  const major = Number(process.versions.node.split(".")[0]);
  if (major >= 22) ok(`Node ${process.versions.node}`);
  else {
    fail(`Node ${process.versions.node}: se necesita 22 o superior (https://nodejs.org)`);
    good = false;
  }
  if (has("ffmpeg") && has("ffprobe")) ok("ffmpeg y ffprobe");
  else {
    fail("ffmpeg/ffprobe no están en el PATH. macOS: brew install ffmpeg · Windows: winget install Gyan.FFmpeg · Ubuntu/Debian: sudo apt install ffmpeg");
    good = false;
  }
  if (fs.existsSync(path.join(ROOT, "node_modules", "remotion"))) ok("Dependencias instaladas (node_modules)");
  else {
    fail("Faltan dependencias: corre npm install");
    good = false;
  }
  if (process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN) ok(`Credenciales de Anthropic presentes · modelo ${MODEL}`);
  else {
    warn("No hay ANTHROPIC_API_KEY. Copia .env.example a .env y pon tu clave (solo hace falta para la CLI; en Claude Code no).");
  }
  if (process.env.REMOTION_BROWSER_EXECUTABLE) info(`Chrome propio: ${process.env.REMOTION_BROWSER_EXECUTABLE}`);
  else info("Remotion descargará Chrome Headless Shell (~150 MB) la primera vez que renderices.");
  const styles = listStyles();
  info(`Estilos disponibles: ${styles.length ? styles.join(", ") : "ninguno (npm run estilo -- nuevo <nombre>)"}`);
  if (good) ok("Todo listo.");
  return good;
};
