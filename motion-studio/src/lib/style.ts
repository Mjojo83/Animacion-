import { useMemo } from "react";
import { useVideoConfig } from "remotion";
import { easesFromStyle, type Eases } from "./motion";
import { StyleSchema, type Style } from "./style-schema";

export type { Style, FontSpec } from "./style-schema";

/** Un style.json importado (TS ensancha los enums a string) o un Style ya tipado. */
export type StyleInput = Style | Record<string, unknown>;

const parsed = new WeakMap<object, Style>();

/** Valida y tipa un style.json. Lanza un error claro si el JSON está mal. */
export const asStyle = (input: StyleInput): Style => {
  const hit = parsed.get(input);
  if (hit) return hit;
  const result = StyleSchema.safeParse(input);
  if (!result.success) {
    throw new Error(`style.json inválido: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  }
  parsed.set(input, result.data);
  return result.data;
};

export type ResolvedStyle = {
  s: Style;
  eases: Eases;
  /** Duraciones en frames ya ajustadas al fps real de la composición. */
  d: { micro: number; short: number; medium: number; long: number; stagger: number };
  /** Margen seguro en px para esta composición. */
  margin: number;
  /** Escala relativa a 1080p del lado menor (para que los px del estilo sirvan en 4K o 9:16). */
  scale: number;
  fonts: {
    display: React.CSSProperties;
    body: React.CSSProperties;
    mono: React.CSSProperties;
  };
};

const fontCss = (f: Style["typography"]["display"], caseStyle: Style["typography"]["caseStyle"], scale: number): React.CSSProperties => ({
  fontFamily: `"${f.family}", system-ui, sans-serif`,
  fontWeight: f.weight,
  letterSpacing: f.letterSpacing,
  lineHeight: f.lineHeight,
  textTransform: caseStyle === "uppercase" ? "uppercase" : caseStyle === "lowercase" ? "lowercase" : "none",
  // fontSize lo pone cada componente, pero dejamos una base proporcional
  fontSize: 32 * scale,
});

/**
 * Hook principal: pásale el style.json importado y te devuelve tokens listos.
 *
 *   import style from "../../styles/mi-estilo/style.json";
 *   const { s, eases, d, margin, fonts } = useStyle(style);
 */
export const useStyle = (input: StyleInput): ResolvedStyle => {
  const { fps, width, height } = useVideoConfig();
  return useMemo(() => {
    const style = asStyle(input);
    const ratio = fps / (style.layout.fps || 30);
    const short = Math.min(width, height);
    const scale = short / 1080;
    const r = (n: number) => Math.max(1, Math.round(n * ratio));
    return {
      s: style,
      eases: easesFromStyle(style),
      d: {
        micro: r(style.motion.durations.micro),
        short: r(style.motion.durations.short),
        medium: r(style.motion.durations.medium),
        long: r(style.motion.durations.long),
        stagger: r(style.motion.staggerFrames),
      },
      margin: Math.round((style.layout.marginPct / 100) * short),
      scale,
      fonts: {
        display: fontCss(style.typography.display, style.typography.caseStyle, scale),
        body: fontCss(style.typography.body, "normal", scale),
        mono: fontCss(style.typography.mono ?? { ...style.typography.body, family: "JetBrains Mono" }, "normal", scale),
      },
    };
  }, [input, fps, width, height]);
};
