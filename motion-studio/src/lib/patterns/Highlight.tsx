import React from "react";
import { useCurrentFrame } from "remotion";
import { progress } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  /** Frame en que empieza a dibujarse. */
  start?: number;
  variant?: "marker" | "underline" | "box";
  color?: string;
  children?: React.ReactNode;
};

/**
 * Resaltado animado detrás/debajo de una palabra (marcador, subrayado o caja).
 * Úsalo dentro de un texto: <p>Esto es <Highlight ...>clave</Highlight>.</p>
 */
export const Highlight: React.FC<Props> = ({ style, start = 0, variant = "marker", color, children }) => {
  const frame = useCurrentFrame();
  const { s, eases, d, scale } = style;
  const p = progress(frame, start, d.medium, eases.out);
  const c = color ?? s.palette.accent;
  const thickness = Math.max(3, s.shapes.strokeWidth * 2 * scale);
  const common: React.CSSProperties = { position: "absolute", left: 0, background: c, pointerEvents: "none" };
  return (
    <span style={{ position: "relative", display: "inline-block", whiteSpace: "nowrap" }}>
      {variant === "marker" && <span style={{ ...common, bottom: "0.05em", height: "0.5em", width: `${p * 100}%`, opacity: 0.55, zIndex: 0, borderRadius: s.shapes.cornerRadius * scale * 0.5 }} />}
      {variant === "underline" && <span style={{ ...common, bottom: "-0.08em", height: thickness, width: `${p * 100}%`, borderRadius: thickness }} />}
      {variant === "box" && (
        <span style={{ position: "absolute", inset: "-0.12em -0.25em", border: `${thickness}px solid ${c}`, borderRadius: s.shapes.cornerRadius * scale, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, pointerEvents: "none" }} />
      )}
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
