import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { breathe } from "../motion";
import type { ResolvedStyle } from "../style";

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")";

/** Grano procedural animado. Va ENCIMA del contenido, debajo de la viñeta. */
export const Grain: React.FC<{ opacity?: number; dark?: boolean }> = ({ opacity = 0.06, dark = true }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: NOISE,
        backgroundSize: "220px 220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity,
        mixBlendMode: dark ? "overlay" : "multiply",
      }}
    />
  );
};

/** Viñeta suave. Siempre la capa más alta. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.22 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,${strength}) 100%)` }} />
);

/** Micro-movimiento para elementos que están quietos más de 2 s. */
export const Breathe: React.FC<{ style: ResolvedStyle; amplitude?: number; period?: number; children?: React.ReactNode }> = ({ style, amplitude, period = 3.2, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const amp = amplitude ?? 4 * style.scale;
  const y = breathe(frame, fps, period, amp);
  const sc = 1 + breathe(frame + fps, fps, period * 1.3, 0.006);
  return <div style={{ translate: `0 ${y}px`, scale: `${sc}` }}>{children}</div>;
};

/** Tarjeta sobre `surface` con el radio del estilo. */
export const Card: React.FC<{ style: ResolvedStyle; padding?: number; children?: React.ReactNode; styleOverride?: React.CSSProperties }> = ({ style, padding, children, styleOverride }) => {
  const { s, scale } = style;
  return (
    <div
      style={{
        background: s.palette.surface,
        borderRadius: s.shapes.cornerRadius * 2 * scale,
        padding: padding ?? 36 * scale,
        border: `${Math.max(1, s.shapes.strokeWidth * scale)}px solid ${s.palette.muted}33`,
        boxShadow: s.shapes.shadows === "none" ? undefined : `0 ${24 * scale}px ${60 * scale}px -${20 * scale}px rgba(0,0,0,0.5)`,
        ...styleOverride,
      }}
    >
      {children}
    </div>
  );
};
