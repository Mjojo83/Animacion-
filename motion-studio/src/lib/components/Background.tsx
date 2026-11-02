import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  /** 'solid' usa palette.background; 'gradient' mezcla background→surface; 'grid' dibuja retícula sutil. */
  variant?: "solid" | "gradient" | "grid";
  /** Opacidad de la retícula/grano, 0-1. */
  textureOpacity?: number;
  children?: React.ReactNode;
};

/** Fondo del estilo con textura opcional. Siempre va al fondo del árbol. */
export const Background: React.FC<Props> = ({ style, variant = "solid", textureOpacity = 0.08, children }) => {
  const { s, scale } = style;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wantsGrid = variant === "grid" || s.shapes.textures.includes("grid");
  const wantsGrain = s.shapes.textures.includes("grain") || s.shapes.textures.includes("noise");
  const cell = Math.round(64 * scale);
  const drift = ((frame / fps) * 4) % cell; // deriva lenta de la retícula

  const background =
    variant === "gradient"
      ? `linear-gradient(160deg, ${s.palette.background} 0%, ${s.palette.surface} 100%)`
      : s.palette.background;

  return (
    <AbsoluteFill style={{ background }}>
      {wantsGrid && (
        <AbsoluteFill
          style={{
            opacity: textureOpacity,
            backgroundImage: `linear-gradient(${s.palette.foreground} 1px, transparent 1px), linear-gradient(90deg, ${s.palette.foreground} 1px, transparent 1px)`,
            backgroundSize: `${cell}px ${cell}px`,
            backgroundPosition: `${drift}px ${drift}px`,
          }}
        />
      )}
      {wantsGrain && (
        <AbsoluteFill
          style={{
            opacity: Math.min(0.35, textureOpacity * 2),
            mixBlendMode: "overlay",
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")",
            backgroundSize: `${160 * scale}px ${160 * scale}px`,
            transform: `translate(${(frame % 3) * 2}px, ${(frame % 2) * -2}px)`,
          }}
        />
      )}
      {children}
    </AbsoluteFill>
  );
};
