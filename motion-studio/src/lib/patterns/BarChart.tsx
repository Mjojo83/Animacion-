import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, staggerStart } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  data: Array<{ label: string; value: number }>;
  start?: number;
  /** Altura del área de barras como fracción del alto del video. */
  height?: number;
  width?: number | string;
  max?: number;
  format?: (v: number) => string;
  highlightIndex?: number;
};

/** Gráfico de barras que crece en cascada; la barra destacada usa el color primario. */
export const BarChart: React.FC<Props> = ({ style, data, start = 0, height = 0.4, width = "100%", max, format = (v) => String(Math.round(v)), highlightIndex }) => {
  const frame = useCurrentFrame();
  const { height: H } = useVideoConfig();
  const { s, eases, d, scale } = style;
  const top = max ?? Math.max(...data.map((x) => x.value));
  const areaH = H * height;
  const labelSize = Math.round(H * 0.024);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18 * scale, width, height: areaH + labelSize * 3 }}>
      {data.map((item, i) => {
        const p = progress(frame, staggerStart(i, start, d.stagger * 2), d.long * 0.6, eases.out);
        const h = (item.value / top) * areaH * p;
        const hi = highlightIndex === i;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <span style={{ ...style.fonts.mono, fontSize: labelSize, color: hi ? s.palette.primary : s.palette.muted, opacity: p, marginBottom: 6 * scale, fontVariantNumeric: "tabular-nums" }}>
              {format(item.value * p)}
            </span>
            <div style={{ width: "100%", height: h, background: hi ? s.palette.primary : `${s.palette.primary}55`, borderRadius: `${s.shapes.cornerRadius * scale}px ${s.shapes.cornerRadius * scale}px 0 0` }} />
            <span style={{ ...style.fonts.body, fontSize: labelSize, color: s.palette.muted, marginTop: 8 * scale, opacity: progress(frame, start + i * d.stagger, d.short, eases.out) }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};
