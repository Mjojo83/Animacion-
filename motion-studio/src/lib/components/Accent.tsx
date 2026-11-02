import React from "react";
import { useCurrentFrame } from "remotion";
import { progress, progressOut } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  variant?: "line" | "bar" | "dot" | "frame";
  start?: number;
  exitAt?: number;
  /** Largo en px (line/bar) o diámetro (dot). Por defecto proporcional al estilo. */
  length?: number;
  thickness?: number;
  color?: string;
  orientation?: "horizontal" | "vertical";
};

/** Detalle gráfico (línea, barra, punto, marco) que crece con el easing del estilo. */
export const Accent: React.FC<Props> = ({ style, variant = "line", start = 0, exitAt, length, thickness, color, orientation = "horizontal" }) => {
  const frame = useCurrentFrame();
  const { s, eases, d, scale } = style;
  const c = color ?? s.palette.accent;
  const p = progress(frame, start, d.medium, eases.out);
  const exit = exitAt === undefined ? 1 : progressOut(frame, exitAt, d.short, eases.in);
  const th = thickness ?? Math.max(2, s.shapes.strokeWidth * scale);
  const len = length ?? 220 * scale;

  if (variant === "dot") {
    return <div style={{ width: len / 4, height: len / 4, borderRadius: "50%", background: c, transform: `scale(${p})`, opacity: exit }} />;
  }
  if (variant === "frame") {
    return (
      <div
        style={{
          position: "absolute",
          inset: style.margin,
          border: `${th}px solid ${c}`,
          borderRadius: s.shapes.cornerRadius * scale,
          clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
          opacity: exit,
        }}
      />
    );
  }
  const horizontal = orientation === "horizontal";
  return (
    <div
      style={{
        width: horizontal ? len * p : th,
        height: horizontal ? (variant === "bar" ? th * 4 : th) : len * p,
        background: c,
        borderRadius: variant === "bar" ? s.shapes.cornerRadius * scale : 0,
        opacity: exit,
      }}
    />
  );
};
