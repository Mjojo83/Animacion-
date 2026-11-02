import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { progress, progressOut, springIn } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  /** Imagen en public/ (opcional). Si no hay, se usa `text` como wordmark. */
  src?: string;
  text?: string;
  start?: number;
  exitAt?: number;
  /** Tamaño como fracción del alto. */
  size?: number;
  variant?: "mask" | "scale" | "wipe";
};

/**
 * Revelado de logo: máscara (sube desde abajo), escala con spring, o wipe con
 * barra de acento. Termina en reposo total para que el logo "asiente".
 */
export const LogoReveal: React.FC<Props> = ({ style, src, text = "LOGO", start = 0, exitAt, size = 0.22, variant = "mask" }) => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const { s, eases, d, scale } = style;
  const px = height * size;
  const exit = exitAt === undefined ? 1 : progressOut(frame, exitAt, d.short, eases.in);
  const content = src ? (
    <Img src={staticFile(src)} style={{ height: px, width: "auto", borderRadius: s.shapes.cornerRadius * scale }} />
  ) : (
    <span style={{ ...style.fonts.display, fontSize: px * 0.6, color: s.palette.foreground, whiteSpace: "nowrap" }}>{text}</span>
  );

  if (variant === "scale") {
    const p = springIn(frame, fps, s, start);
    return <div style={{ opacity: Math.min(1, p * 1.4) * exit, scale: `${0.7 + 0.3 * p}` }}>{content}</div>;
  }
  if (variant === "wipe") {
    const bar = progress(frame, start, d.medium, eases.inOut);
    const reveal = progress(frame, start + Math.round(d.medium * 0.6), d.medium, eases.out);
    return (
      <div style={{ position: "relative", display: "inline-block", opacity: exit }}>
        <div style={{ clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)` }}>{content}</div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${Math.min(bar, reveal) * 100}%`, width: Math.max(4, s.shapes.strokeWidth * 3 * scale), background: s.palette.accent, opacity: bar < 1 ? 1 : 1 - reveal }} />
      </div>
    );
  }
  const p = progress(frame, start, d.medium, eases.out);
  return (
    <div style={{ overflow: "hidden", display: "inline-block", opacity: exit, paddingBottom: px * 0.08 }}>
      <div style={{ translate: `0 ${(1 - p) * 110}%` }}>{content}</div>
    </div>
  );
};
