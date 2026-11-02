import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { progress, progressOut, springIn, staggerStart, typewriter } from "../motion";
import type { ResolvedStyle } from "../style";

type Variant = "fade-up" | "mask-up" | "words" | "chars" | "typewriter" | "scale";

type Props = {
  style: ResolvedStyle;
  text: string;
  /** Frame en el que empieza a aparecer. */
  start?: number;
  /** Frame en el que empieza a desaparecer (opcional). */
  exitAt?: number;
  variant?: Variant;
  role?: "display" | "body" | "mono";
  /** Tamaño como fracción del alto del video (0.1 = 10% del alto). */
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  maxWidth?: number | string;
  styleOverride?: React.CSSProperties;
};

/**
 * Texto que entra (y opcionalmente sale) con la cadencia del estilo.
 * Las variantes cubren el 90% de los casos de motion tipográfico.
 */
export const TextReveal: React.FC<Props> = ({
  style,
  text,
  start = 0,
  exitAt,
  variant = "mask-up",
  role = "display",
  size = 0.08,
  color,
  align = "left",
  maxWidth,
  styleOverride,
}) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const { s, eases, d } = style;
  const fontSize = Math.round(height * size);
  const base: React.CSSProperties = {
    ...style.fonts[role],
    fontSize,
    color: color ?? s.palette.foreground,
    textAlign: align,
    maxWidth,
    margin: 0,
    whiteSpace: "pre-wrap",
    ...styleOverride,
  };
  const exit = exitAt === undefined ? 1 : progressOut(frame, exitAt, d.short, eases.in);

  if (variant === "typewriter") {
    const shown = typewriter(frame, fps, text, start, s.motion.tempo === "fast" ? 36 : s.motion.tempo === "slow" ? 14 : 24);
    const caret = Math.floor(frame / Math.max(2, d.micro)) % 2 === 0 ? "▍" : " ";
    return (
      <p style={{ ...base, opacity: exit }}>
        {shown}
        <span style={{ color: s.palette.accent }}>{shown.length < text.length ? caret : ""}</span>
      </p>
    );
  }

  if (variant === "words" || variant === "chars") {
    const parts = variant === "words" ? text.split(/(\s+)/) : Array.from(text);
    let i = 0;
    return (
      <p style={{ ...base, opacity: exit, display: "block" }}>
        {parts.map((part, idx) => {
          if (/^\s+$/.test(part)) return <span key={idx}>{part}</span>;
          const k = i++;
          const st = staggerStart(k, start, variant === "words" ? d.stagger : Math.max(1, Math.round(d.stagger / 3)));
          const p = progress(frame, st, d.short, eases.out);
          return (
            <span
              key={idx}
              style={{
                display: "inline-block",
                opacity: p,
                transform: `translateY(${(1 - p) * fontSize * 0.5}px)`,
              }}
            >
              {part}
            </span>
          );
        })}
      </p>
    );
  }

  if (variant === "scale") {
    const p = springIn(frame, fps, s, start);
    return (
      <p style={{ ...base, opacity: Math.min(1, p * 1.5) * exit, transform: `scale(${0.85 + 0.15 * p})`, transformOrigin: align === "center" ? "center" : "left center" }}>
        {text}
      </p>
    );
  }

  if (variant === "fade-up") {
    const p = progress(frame, start, d.short, eases.out);
    return (
      <p style={{ ...base, opacity: p * exit, transform: `translateY(${(1 - p) * fontSize * 0.4}px)` }}>{text}</p>
    );
  }

  // mask-up: el texto sube desde dentro de una máscara (clásico de motion limpio)
  const p = progress(frame, start, d.short, eases.out);
  return (
    <div style={{ overflow: "hidden", display: "inline-block", opacity: exit, paddingBottom: fontSize * 0.15, marginBottom: -fontSize * 0.15 }}>
      <p style={{ ...base, transform: `translateY(${(1 - p) * 110}%)` }}>{text}</p>
    </div>
  );
};
