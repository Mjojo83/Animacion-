import { z } from "zod";
import { StyleSchema } from "../src/lib/style-schema";

/** Salida estructurada de `estilo aprender`. */
export const StyleAnalysisSchema = z.object({
  style: StyleSchema,
  styleGuideMarkdown: z.string().describe("STYLE.md completo en Markdown, en español, con las secciones indicadas"),
});
export type StyleAnalysis = z.infer<typeof StyleAnalysisSchema>;

/** Salida estructurada de `revisar`. */
export const CritiqueSchema = z.object({
  scores: z.object({
    styleAdherence: z.number().describe("0-10: ¿parece hecho por el mismo estudio que las referencias?"),
    motionQuality: z.number().describe("0-10: timing, easing, cadencia, limpieza de entradas y salidas"),
    typography: z.number().describe("0-10: jerarquía, tamaños, tracking, legibilidad"),
    composition: z.number().describe("0-10: uso del espacio, márgenes, equilibrio, foco"),
    readability: z.number().describe("0-10: ¿se lee todo el texto el tiempo suficiente?"),
    overall: z.number().describe("0-10: nota global, no es el promedio: pesa lo que más importa"),
  }),
  verdict: z.enum(["approve", "revise"]).describe("approve solo si overall >= 8 y no hay issues high"),
  summary: z.string().describe("3-5 frases: qué funciona y qué no, con referencias a frames (f123)"),
  strengths: z.array(z.string()),
  issues: z.array(
    z.object({
      frame: z.number().nullable().describe("Frame aproximado donde se ve el problema, o null si es general"),
      severity: z.enum(["low", "medium", "high"]),
      description: z.string(),
      fix: z.string().describe("Instrucción concreta para quien edita el código Remotion: qué cambiar y a qué valor"),
    }),
  ),
  lessons: z.array(z.string()).describe("Lecciones generalizables al ESTILO (no a esta pieza), para futuras piezas. 0-4 entradas"),
});
export type Critique = z.infer<typeof CritiqueSchema>;
