import path from "node:path";
import { bold, info, ok } from "../lib/log";
import { ROOT } from "../lib/paths";
import { scaffoldStyle } from "../lib/style-io";

export const styleNew = (name: string): void => {
  const dir = scaffoldStyle(name);
  ok(`Estilo creado en ${path.relative(ROOT, dir)}`);
  console.log("");
  console.log(bold("Siguientes pasos:"));
  info(`1. Copia imágenes y videos de referencia en styles/${name}/references/`);
  info(`2. (Opcional) Escribe lo que quieres en styles/${name}/notes.md`);
  info(`3. Corre: npm run estilo -- aprender ${name}`);
};
