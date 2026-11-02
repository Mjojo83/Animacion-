import React from "react";
import { AbsoluteFill } from "remotion";
import type { ResolvedStyle } from "../style";

type Props = {
  style: ResolvedStyle;
  /** Alineación del contenido dentro del área segura. */
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "space-between";
  direction?: "row" | "column";
  gap?: number;
  children?: React.ReactNode;
};

/** Caja con el margen seguro del estilo. Todo el texto debe vivir dentro. */
export const SafeArea: React.FC<Props> = ({ style, align = "start", justify = "center", direction = "column", gap, children }) => (
  <AbsoluteFill
    style={{
      padding: style.margin,
      display: "flex",
      flexDirection: direction,
      alignItems: align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center",
      justifyContent: justify === "start" ? "flex-start" : justify === "end" ? "flex-end" : justify,
      gap: gap ?? style.margin / 2,
      boxSizing: "border-box",
    }}
  >
    {children}
  </AbsoluteFill>
);
