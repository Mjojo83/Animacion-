import { z } from "zod";

/**
 * Esquema de un estilo. Es la "memoria" estructurada que Opus 5.5 produce al
 * analizar tus referencias y que después usa para animar. Vive en
 * styles/<nombre>/style.json. Puedes editarlo a mano: es la fuente de verdad.
 *
 * Reglas: nada opcional (usa null), para que sirva como salida estructurada
 * de la API sin ambigüedad.
 */

export const FontSpecSchema = z.object({
  family: z.string().describe("Nombre de la familia, p. ej. 'Inter' o 'Space Grotesk'"),
  weight: z.number().describe("Peso numérico principal: 300, 400, 500, 600, 700, 800, 900"),
  letterSpacing: z.string().describe("Tracking en em, p. ej. '-0.02em' o '0.12em'"),
  lineHeight: z.number().describe("Interlineado relativo, p. ej. 0.95 para titulares, 1.4 para cuerpo"),
  googleFont: z.boolean().describe("true si la fuente está en Google Fonts (se carga sola)"),
});

export const StyleSchema = z.object({
  name: z.string().describe("Identificador del estilo (carpeta en styles/)"),
  version: z.number().describe("Se incrementa cada vez que se re-aprende"),
  summary: z.string().describe("Resumen de 2-4 frases: qué es este estilo y cómo se siente"),
  mood: z.array(z.string()).describe("5-8 adjetivos: 'limpio', 'brutalista', 'cálido', 'editorial'..."),
  references: z.array(z.string()).describe("Referentes culturales o de estudios/marcas que evoca (si aplica)"),

  palette: z.object({
    background: z.string().describe("Color de fondo dominante, hex"),
    surface: z.string().describe("Color de superficies/tarjetas, hex"),
    foreground: z.string().describe("Color principal de texto, hex"),
    muted: z.string().describe("Texto secundario, hex"),
    primary: z.string().describe("Color de marca principal, hex"),
    secondary: z.string().describe("Color secundario, hex"),
    accent: z.string().describe("Acento para detalles pequeños, hex"),
    extra: z.array(z.string()).describe("Otros colores observados, hex"),
    usage: z.string().describe("Reglas de uso: proporciones, qué va sobre qué, qué nunca se combina"),
  }),

  typography: z.object({
    display: FontSpecSchema.describe("Titulares"),
    body: FontSpecSchema.describe("Texto de apoyo"),
    mono: FontSpecSchema.nullable().describe("Monoespaciada si el estilo la usa, si no null"),
    caseStyle: z.enum(["normal", "uppercase", "lowercase", "mixed"]).describe("Tratamiento de mayúsculas en titulares"),
    scaleHint: z.string().describe("Relación de tamaños: p. ej. 'titulares enormes (12-18% del alto), cuerpo pequeño'"),
    rules: z.array(z.string()).describe("Reglas tipográficas observadas"),
  }),

  motion: z.object({
    tempo: z.enum(["slow", "medium", "fast"]).describe("Velocidad general del montaje"),
    easing: z.object({
      in: z.string().describe("cubic-bezier(x1, y1, x2, y2) para entradas"),
      out: z.string().describe("cubic-bezier para salidas"),
      inOut: z.string().describe("cubic-bezier para movimientos continuos"),
    }),
    spring: z.object({
      damping: z.number().describe("Remotion spring damping, típico 10-30"),
      stiffness: z.number().describe("Remotion spring stiffness, típico 80-250"),
      mass: z.number().describe("Remotion spring mass, típico 0.5-1.5"),
    }),
    staggerFrames: z.number().describe("Frames de desfase entre elementos en cascada (a 30 fps)"),
    durations: z.object({
      micro: z.number().describe("Frames para micro-movimientos (parpadeos, hover): 4-8"),
      short: z.number().describe("Frames para entradas de texto: 10-20"),
      medium: z.number().describe("Frames para transiciones de escena: 18-36"),
      long: z.number().describe("Frames para movimientos de cámara/lentos: 40-120"),
    }),
    principles: z.array(z.string()).describe("Cómo se mueve todo: 'nada rebota', 'entradas por máscara', 'overshoot sutil'..."),
    signatureMoves: z.array(z.string()).describe("Movimientos firma reconocibles del estilo, descritos para poder codificarlos"),
  }),

  layout: z.object({
    fps: z.number().describe("Frames por segundo por defecto, normalmente 30"),
    aspectRatios: z.array(z.string()).describe("Formatos típicos: '16:9', '9:16', '1:1'"),
    marginPct: z.number().describe("Margen seguro como % del lado menor, p. ej. 6"),
    density: z.enum(["minimal", "balanced", "dense"]).describe("Cuántos elementos conviven en pantalla"),
    alignment: z.string().describe("Alineación dominante: 'izquierda a la retícula', 'centrado', 'esquinas'"),
    rules: z.array(z.string()).describe("Reglas de composición observadas"),
  }),

  shapes: z.object({
    cornerRadius: z.number().describe("Radio de esquinas en px a 1080p; 0 si es todo recto"),
    strokeWidth: z.number().describe("Grosor de líneas en px a 1080p"),
    shadows: z.string().describe("'none' o descripción del sombreado"),
    textures: z.array(z.string()).describe("'grain', 'grid', 'noise', 'halftone', 'none'..."),
  }),

  transitions: z.array(z.string()).describe("Tipos de transición entre escenas que usa el estilo"),
  doNot: z.array(z.string()).describe("Lo que este estilo NUNCA hace. Muy importante para no contaminar"),
});

export type Style = z.infer<typeof StyleSchema>;
export type FontSpec = z.infer<typeof FontSpecSchema>;
