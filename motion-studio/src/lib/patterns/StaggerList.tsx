import React from "react";
import { useVideoConfig } from "remotion";
import { staggerStart } from "../motion";
import type { ResolvedStyle } from "../style";
import { Entrance } from "./Entrance";

type Props = {
  style: ResolvedStyle;
  items: string[];
  start?: number;
  exitAt?: number;
  /** Frames entre elementos; por defecto el doble del stagger del estilo. */
  step?: number;
  size?: number;
  marker?: "dot" | "dash" | "number" | "none";
  color?: string;
  gap?: number;
};

/** Lista de viñetas en cascada con el marcador del estilo. */
export const StaggerList: React.FC<Props> = ({ style, items, start = 0, exitAt, step, size = 0.04, marker = "dot", color, gap }) => {
  const { height } = useVideoConfig();
  const { s, d, scale } = style;
  const fontSize = Math.round(height * size);
  const st = step ?? d.stagger * 2;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: gap ?? fontSize * 0.5 }}>
      {items.map((item, i) => (
        <Entrance key={i} style={style} start={staggerStart(i, start, st)} exitAt={exitAt === undefined ? undefined : exitAt + i * Math.round(st / 2)} from="left" distance={24 * scale}>
          <div style={{ display: "flex", alignItems: "center", gap: fontSize * 0.5 }}>
            {marker === "dot" && <span style={{ width: fontSize * 0.28, height: fontSize * 0.28, borderRadius: "50%", background: s.palette.accent, flexShrink: 0 }} />}
            {marker === "dash" && <span style={{ width: fontSize * 0.6, height: Math.max(2, s.shapes.strokeWidth * scale), background: s.palette.accent, flexShrink: 0 }} />}
            {marker === "number" && (
              <span style={{ ...style.fonts.mono, fontSize: fontSize * 0.6, color: s.palette.accent, minWidth: fontSize * 0.9 }}>{String(i + 1).padStart(2, "0")}</span>
            )}
            <span style={{ ...style.fonts.body, fontSize, color: color ?? s.palette.foreground }}>{item}</span>
          </div>
        </Entrance>
      ))}
    </div>
  );
};
