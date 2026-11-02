import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, progressOut } from "../motion";
import type { ResolvedStyle } from "../style";
import { TextReveal } from "./TextReveal";

type Props = {
  style: ResolvedStyle;
  name: string;
  title?: string;
  start?: number;
  exitAt?: number;
  position?: "left" | "right";
};

/** Rótulo de tercio inferior: barra de acento + nombre + cargo. */
export const LowerThird: React.FC<Props> = ({ style, name, title, start = 0, exitAt, position = "left" }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const { s, eases, d, margin, scale } = style;
  const bar = progress(frame, start, d.medium, eases.out);
  const exit = exitAt === undefined ? 1 : progressOut(frame, exitAt, d.short, eases.in);
  return (
    <div
      style={{
        position: "absolute",
        bottom: margin,
        [position]: margin,
        display: "flex",
        gap: 18 * scale,
        alignItems: "stretch",
        opacity: exit,
      }}
    >
      <div style={{ width: Math.max(4, s.shapes.strokeWidth * 2 * scale), background: s.palette.primary, transform: `scaleY(${bar})`, transformOrigin: "bottom", borderRadius: s.shapes.cornerRadius * scale }} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <TextReveal style={style} text={name} start={start + Math.round(d.stagger / 2)} size={0.045} variant="mask-up" />
        {title && (
          <TextReveal style={style} text={title} start={start + d.stagger} size={0.026} role="body" color={s.palette.muted} variant="mask-up" styleOverride={{ marginTop: height * 0.004 }} />
        )}
      </div>
    </div>
  );
};
