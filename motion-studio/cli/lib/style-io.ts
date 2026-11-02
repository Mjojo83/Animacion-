import fs from "node:fs";
import path from "node:path";
import { StyleSchema, type Style } from "../../src/lib/style-schema";
import { STYLES_DIR, TEMPLATE_DIR } from "./paths";

export type LoadedStyle = {
  name: string;
  dir: string;
  json: Style;
  md: string;
  notes: string;
  lessons: string;
  exemplars: Array<{ file: string; code: string }>;
};

export const styleDir = (name: string) => path.join(STYLES_DIR, name);

export const validStyleName = (name: string) => /^[a-z0-9][a-z0-9-_]*$/.test(name) && !name.startsWith("_");

export const listStyles = (): string[] =>
  fs
    .readdirSync(STYLES_DIR)
    .filter((d) => !d.startsWith("_") && !d.startsWith(".") && fs.existsSync(path.join(STYLES_DIR, d, "style.json")))
    .sort();

export const styleExists = (name: string) => fs.existsSync(styleDir(name));

const readIf = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "");

export const loadStyle = (name: string): LoadedStyle => {
  const dir = styleDir(name);
  const jsonFile = path.join(dir, "style.json");
  if (!fs.existsSync(dir)) throw new Error(`No existe el estilo "${name}". Crea uno con: npm run estilo -- nuevo ${name}`);
  let json: Style;
  if (fs.existsSync(jsonFile)) {
    const parsed = StyleSchema.safeParse(JSON.parse(fs.readFileSync(jsonFile, "utf8")));
    if (!parsed.success) {
      throw new Error(`styles/${name}/style.json inválido: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    }
    json = parsed.data;
  } else {
    throw new Error(`El estilo "${name}" no tiene style.json todavía. Pon referencias en styles/${name}/references y corre: npm run estilo -- aprender ${name}`);
  }
  const exDir = path.join(dir, "exemplars");
  const exemplars = fs.existsSync(exDir)
    ? fs
        .readdirSync(exDir)
        .filter((f) => f.endsWith(".tsx"))
        .sort()
        .map((f) => ({ file: f, code: fs.readFileSync(path.join(exDir, f), "utf8") }))
    : [];
  return {
    name,
    dir,
    json,
    md: readIf(path.join(dir, "STYLE.md")),
    notes: readIf(path.join(dir, "notes.md")),
    lessons: readIf(path.join(dir, "lessons.md")),
    exemplars,
  };
};

/** Crea styles/<name> a partir de la plantilla. */
export const scaffoldStyle = (name: string): string => {
  if (!validStyleName(name)) throw new Error("Nombre inválido: usa minúsculas, números y guiones (p. ej. 'editorial-calido').");
  const dir = styleDir(name);
  if (fs.existsSync(dir)) throw new Error(`Ya existe styles/${name}`);
  fs.cpSync(TEMPLATE_DIR, dir, { recursive: true });
  return dir;
};

export const saveLearned = (name: string, style: Style, md: string): void => {
  const dir = styleDir(name);
  const jsonFile = path.join(dir, "style.json");
  const mdFile = path.join(dir, "STYLE.md");
  if (fs.existsSync(jsonFile)) fs.copyFileSync(jsonFile, path.join(dir, "style.prev.json"));
  if (fs.existsSync(mdFile)) fs.copyFileSync(mdFile, path.join(dir, "STYLE.prev.md"));
  fs.writeFileSync(jsonFile, JSON.stringify(style, null, 2) + "\n");
  fs.writeFileSync(mdFile, md.trimEnd() + "\n");
};

export const appendLessons = (name: string, lessons: string[], source: string): void => {
  if (lessons.length === 0) return;
  const file = path.join(styleDir(name), "lessons.md");
  const date = new Date().toISOString().slice(0, 10);
  const block = lessons.map((l) => `- (${date} · ${source}) ${l.trim()}`).join("\n");
  const prev = readIf(file) || "# Lecciones aprendidas\n";
  fs.writeFileSync(file, `${prev.trimEnd()}\n${block}\n`);
};

export const addExemplar = (name: string, compositionFile: string): string => {
  const exDir = path.join(styleDir(name), "exemplars");
  fs.mkdirSync(exDir, { recursive: true });
  const dst = path.join(exDir, path.basename(compositionFile));
  fs.copyFileSync(compositionFile, dst);
  return dst;
};
