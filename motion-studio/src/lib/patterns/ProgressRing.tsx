import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  /** 0-1 */
  value: number;
  start?: number;
  duration?: number;
  /** Diámetro como fracción del alto del video. */
  size?: number;
  label?: string;
  color?: string;
};

/** Anillo de progreso SVG (stroke-dashoffset) con el porcentaje en el centro. */
export const ProgressRing: React.FC<Props> = ({ style, value, start = 0, duration, size = 0.3, label, color }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const { s, eases, d, scale } = style;
  const p = progress(frame, start, duration ?? d.long, eases.out);
  const px = height * size;
  const stroke = Math.max(6, s.shapes.strokeWidth * 5 * scale);
  const r = px / 2 - stroke;
  const c = 2 * Math.PI * r;
  const shown = value * p;
  return (
    <div style={{ position: "relative", width: px, height: px }}>
      <svg width={px} height={px} style={{ rotate: "-90deg" }}>
        <circle cx={px / 2} cy={px / 2} r={r} stroke={s.palette.surface} strokeWidth={stroke} fill="none" />
        <circle cx={px / 2} cy={px / 2} r={r} stroke={color ?? s.palette.primary} strokeWidth={stroke} fill="none" strokeLinecap={s.shapes.cornerRadius > 0 ? "round" : "butt"} strokeDasharray={c} strokeDashoffset={c * (1 - shown)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ ...style.fonts.display, fontSize: px * 0.26, color: s.palette.foreground, fontVariantNumeric: "tabular-nums" }}>{Math.round(shown * 100)}%</span>
        {label && <span style={{ ...style.fonts.body, fontSize: px * 0.08, color: s.palette.muted }}>{label}</span>}
      </div>
    </div>
  );
};
