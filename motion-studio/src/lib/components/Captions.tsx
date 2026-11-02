import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ResolvedStyle } from "../style";

export type CaptionWord = { text: string; start: number; end: number };

type Props = {
  style: ResolvedStyle;
  words: CaptionWord[];
  /** Palabras máximas por línea en pantalla. */
  maxWords?: number;
  /** 'karaoke' muestra la línea y resalta la palabra activa; 'pop' hace aparecer cada palabra. */
  mode?: "karaoke" | "pop";
  size?: number;
  /** Posición vertical como fracción del alto (0.78 = tercio inferior). */
  y?: number;
  highlight?: string;
  box?: boolean;
};

/**
 * Subtítulos sincronizados por palabra (formato tipo Whisper: start/end en s).
 * Agrupa en líneas de `maxWords`, respeta el margen seguro y resalta la palabra activa.
 */
export const Captions: React.FC<Props> = ({ style, words, maxWords = 4, mode = "karaoke", size = 0.045, y = 0.78, highlight, box = true }) => {
  const frame = useCurrentFrame();
  const { fps, height, width } = useVideoConfig();
  const { s, scale, margin } = style;
  const t = frame / fps;
  const fontSize = Math.round(height * size);

  // agrupamos en líneas: corte por maxWords o por silencio > 0.7 s
  const lines: CaptionWord[][] = [];
  let cur: CaptionWord[] = [];
  for (const w of words) {
    const gap = cur.length ? w.start - cur[cur.length - 1].end : 0;
    if (cur.length >= maxWords || gap > 0.7) {
      lines.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) lines.push(cur);

  const line = lines.find((l) => t >= l[0].start - 0.05 && t <= l[l.length - 1].end + 0.25);
  if (!line) return null;
  const hi = highlight ?? s.palette.accent;

  return (
    <div style={{ position: "absolute", left: margin, right: margin, top: height * y, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: `${fontSize * 0.1}px ${fontSize * 0.35}px`,
          maxWidth: width - margin * 2,
          padding: box ? `${fontSize * 0.25}px ${fontSize * 0.5}px` : 0,
          background: box ? `${s.palette.background}CC` : "transparent",
          borderRadius: s.shapes.cornerRadius * scale,
        }}
      >
        {line.map((w, i) => {
          const active = t >= w.start && t < w.end;
          const seen = t >= w.start;
          const since = Math.max(0, t - w.start);
          const pop = Math.min(1, since / 0.12);
          const visible = mode === "pop" ? (seen ? 1 : 0) : 1;
          return (
            <span
              key={i}
              style={{
                ...style.fonts.display,
                fontSize,
                color: active ? hi : seen ? s.palette.foreground : `${s.palette.foreground}99`,
                opacity: visible,
                scale: active ? `${1 + 0.08 * (1 - pop)}` : "1",
                translate: mode === "pop" ? `0 ${(1 - pop) * fontSize * 0.3}px` : "0 0",
                display: "inline-block",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
