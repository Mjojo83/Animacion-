import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  from?: number;
  to: number;
  start?: number;
  /** Duración en frames; por defecto d.long. */
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: number;
  color?: string;
};

/** Número que cuenta de `from` a `to` con el easing del estilo. */
export const Counter: React.FC<Props> = ({ style, from = 0, to, start = 0, duration, prefix = "", suffix = "", decimals = 0, size = 0.12, color }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const { s, eases, d } = style;
  const p = progress(frame, start, duration ?? d.long, eases.out);
  const value = from + (to - from) * p;
  return (
    <p style={{ ...style.fonts.display, fontSize: height * size, color: color ?? s.palette.primary, margin: 0, fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {value.toLocaleString("es-MX", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </p>
  );
};
