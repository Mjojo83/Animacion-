import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, progressOut, springIn } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  start?: number;
  exitAt?: number;
  /** Dirección desde la que entra. */
  from?: "up" | "down" | "left" | "right" | "none";
  /** Distancia del desplazamiento en px (ya escalada por el estilo). */
  distance?: number;
  /** 'spring' usa la configuración spring del estilo; 'bezier' el easing out. */
  mode?: "spring" | "bezier";
  /** Escala inicial (0.94 = entra creciendo un 6 %). 1 = sin escala. */
  fromScale?: number;
  children?: React.ReactNode;
  styleOverride?: React.CSSProperties;
};

/**
 * Entrada "premium": opacidad + desplazamiento + escala a la vez, con la
 * cadencia del estilo. Es el patrón por defecto para cualquier bloque.
 */
export const Entrance: React.FC<Props> = ({ style, start = 0, exitAt, from = "up", distance, mode = "bezier", fromScale = 0.96, children, styleOverride }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { s, eases, d, scale } = style;
  const p = mode === "spring" ? Math.min(1, springIn(frame, fps, s, start)) : progress(frame, start, d.short, eases.out);
  const exit = exitAt === undefined ? 1 : progressOut(frame, exitAt, Math.round(d.short * 0.7), eases.in);
  const dist = (distance ?? 40 * scale) * (1 - p);
  const x = from === "left" ? -dist : from === "right" ? dist : 0;
  const y = from === "up" ? dist : from === "down" ? -dist : 0;
  return (
    <div
      style={{
        opacity: p * exit,
        translate: `${x}px ${y + (1 - exit) * -12 * scale}px`,
        scale: `${fromScale + (1 - fromScale) * p}`,
        ...styleOverride,
      }}
    >
      {children}
    </div>
  );
};
