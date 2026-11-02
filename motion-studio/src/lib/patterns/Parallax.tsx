import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type Layer = { depth: number; children: React.ReactNode };

type Props = {
  /** Capas de fondo a frente. depth 0 = fija, 1 = se mueve lo máximo. */
  layers: Layer[];
  /** Desplazamiento total en px de la capa más profunda a lo largo de la Sequence. */
  travel?: number;
  axis?: "x" | "y";
  duration?: number;
};

/** Profundidad instantánea: cada capa se desplaza según su `depth`. */
export const Parallax: React.FC<Props> = ({ layers, travel = 80, axis = "x", duration }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const total = duration ?? durationInFrames;
  const t = interpolate(frame, [0, total], [-0.5, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      {layers.map((l, i) => {
        const off = t * travel * l.depth;
        return (
          <AbsoluteFill key={i} style={{ translate: axis === "x" ? `${off}px 0` : `0 ${off}px` }}>
            {l.children}
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
