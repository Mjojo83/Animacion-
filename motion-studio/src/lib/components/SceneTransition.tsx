import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { progress } from "../motion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  /** Frame en el que arranca la cortinilla. */
  at: number;
  variant?: "wipe" | "fade" | "slide";
  color?: string;
  direction?: "left" | "right" | "up" | "down";
};

/**
 * Cortinilla entre escenas. Se coloca encima de las dos escenas; cubre la
 * pantalla en d.medium frames y la descubre en los siguientes d.medium.
 */
export const SceneTransition: React.FC<Props> = ({ style, at, variant = "wipe", color, direction = "right" }) => {
  const frame = useCurrentFrame();
  const { s, eases, d } = style;
  const c = color ?? s.palette.primary;
  const cover = progress(frame, at, d.medium, eases.inOut);
  const reveal = progress(frame, at + d.medium, d.medium, eases.inOut);
  if (frame < at || frame > at + d.medium * 2) return null;

  if (variant === "fade") {
    return <AbsoluteFill style={{ background: c, opacity: cover - reveal }} />;
  }
  const axis = direction === "left" || direction === "right" ? "X" : "Y";
  const sign = direction === "left" || direction === "up" ? -1 : 1;
  const t = reveal > 0 ? reveal * 100 * sign : (cover - 1) * 100 * -sign;
  if (variant === "slide") {
    return <AbsoluteFill style={{ background: c, transform: `translate${axis}(${t}%)` }} />;
  }
  // wipe: clip-path que avanza en la dirección indicada (cubre y luego descubre)
  const cv = (1 - cover) * 100;
  const rv = reveal * 100;
  const inset =
    direction === "up"
      ? reveal > 0 ? `inset(0 0 ${rv}% 0)` : `inset(${cv}% 0 0 0)`
      : direction === "down"
        ? reveal > 0 ? `inset(${rv}% 0 0 0)` : `inset(0 0 ${cv}% 0)`
        : direction === "left"
          ? reveal > 0 ? `inset(0 ${rv}% 0 0)` : `inset(0 0 0 ${cv}%)`
          : reveal > 0 ? `inset(0 0 0 ${rv}%)` : `inset(0 ${cv}% 0 0)`;
  return <AbsoluteFill style={{ background: c, clipPath: inset }} />;
};
