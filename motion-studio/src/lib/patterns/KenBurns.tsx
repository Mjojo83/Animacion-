import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  /** Ruta dentro de public/, p. ej. "demo/foto.jpg". */
  src: string;
  /** Escala final (1.08 = acerca un 8 % a lo largo de la duración). */
  zoomTo?: number;
  /** Desplazamiento horizontal total en % del ancho. */
  panX?: number;
  panY?: number;
  /** Duración del movimiento en frames; por defecto toda la Sequence. */
  duration?: number;
  /** Radio de esquina (por defecto el del estilo) y borde opcional. */
  rounded?: boolean;
  styleOverride?: React.CSSProperties;
};

/**
 * Toda imagen fija lleva Ken Burns: zoom lento + paneo. Alterna zoom-in y
 * zoom-out entre planos consecutivos. Lineal a propósito: a esta velocidad el
 * easing se nota como "frenazo".
 */
export const KenBurns: React.FC<Props> = ({ style, src, zoomTo = 1.08, panX = -2, panY = 0, duration, rounded = true, styleOverride }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { s, scale } = style;
  const total = duration ?? durationInFrames;
  const z = interpolate(frame, [0, total], [1, zoomTo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, total], [0, panX], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = interpolate(frame, [0, total], [0, panY], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ overflow: "hidden", width: "100%", height: "100%", borderRadius: rounded ? s.shapes.cornerRadius * 2 * scale : 0, ...styleOverride }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", scale: `${z}`, translate: `${x}% ${y}%` }} />
    </div>
  );
};
