import React from "react";
import { AbsoluteFill } from "remotion";
import tech from "../../styles/ejemplo-minimal-tech/style.json";
import editorial from "../../styles/ejemplo-editorial-calido/style.json";
import type { CompositionMeta } from "../lib/composition";
import { useStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";

export const meta: CompositionMeta = {
  id: "PruebaFuentes",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 60,
  style: "ejemplo-minimal-tech",
  description: "Prueba de carga de fuentes: arriba con las fuentes de Google de cada estilo, abajo el mismo texto forzado a system-ui. Si ambas mitades son iguales, las fuentes no cargaron.",
};

const SAMPLE = "Hamburgefonstiv 0123 ¿Qué tal? ÁÉÍÓÚ ñ";

export const Component: React.FC = () => {
  const a = useStyle(tech);
  const b = useStyle(editorial);
  useStyleFonts(tech);
  useStyleFonts(editorial);
  const rows = [
    { label: `${tech.typography.display.family} ${tech.typography.display.weight} (display tech)`, css: a.fonts.display },
    { label: `${tech.typography.mono?.family} (mono tech)`, css: a.fonts.mono },
    { label: `${editorial.typography.display.family} ${editorial.typography.display.weight} (display editorial)`, css: b.fonts.display },
    { label: `${editorial.typography.body.family} (body editorial)`, css: b.fonts.body },
  ];
  const Row: React.FC<{ css: React.CSSProperties; label: string; fallback?: boolean }> = ({ css, label, fallback }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: "system-ui", fontSize: 18, color: "#888" }}>
        {fallback ? "system-ui (control)" : label}
      </span>
      <span style={{ ...css, fontSize: 64, lineHeight: 1.1, color: "#111", ...(fallback ? { fontFamily: "system-ui" } : {}) }}>{SAMPLE}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#fff", padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "50%" }}>
        {rows.map((r) => (
          <Row key={r.label} css={r.css} label={r.label} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "50%", borderTop: "2px dashed #ddd", paddingTop: 10 }}>
        {rows.map((r) => (
          <Row key={r.label + "-fb"} css={r.css} label={r.label} fallback />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default Component;
