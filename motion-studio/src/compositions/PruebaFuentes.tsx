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
  description: "Prueba de carga de fuentes: arriba cada fuente de Google con respaldo `serif`, abajo el mismo texto forzado a `serif`. Si una fila es igual a su control, esa fuente no cargó.",
};

const SAMPLE = "Hamburgefonstiv 0123 ¿Qué tal? ÁÉÍÓÚ ñ";

/** Etiquetas de las 4 filas, en orden; `npm run probar` compara cada una con su control. */
export const FONT_ROWS = [
  `${tech.typography.display.family} ${tech.typography.display.weight}`,
  `${tech.typography.mono?.family ?? "mono"} ${tech.typography.mono?.weight ?? ""}`,
  `${editorial.typography.display.family} ${editorial.typography.display.weight}`,
  `${editorial.typography.body.family} ${editorial.typography.body.weight}`,
];

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
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, paddingLeft: 40 }}>
      <span style={{ fontFamily: "sans-serif", fontSize: 18, color: "#888" }}>
        {fallback ? `serif (control de ${label})` : label}
      </span>
      {/* El respaldo es `serif` a propósito: si la fuente de Google no carga, la fila queda idéntica a su control. */}
      <span style={{ ...css, fontSize: 64, lineHeight: 1.1, color: "#111", whiteSpace: "nowrap", fontFamily: fallback ? "serif" : `${String(css.fontFamily).split(",")[0]}, serif` }}>{SAMPLE}</span>
    </div>
  );
  // 8 filas de igual altura (12.5 % cada una): arriba las fuentes del estilo, abajo los controles.
  return (
    <AbsoluteFill style={{ background: "#fff", display: "grid", gridTemplateRows: "repeat(8, 1fr)" }}>
      {rows.map((r) => (
        <Row key={r.label} css={r.css} label={r.label} />
      ))}
      {rows.map((r) => (
        <Row key={r.label + "-fb"} css={r.css} label={r.label} fallback />
      ))}
    </AbsoluteFill>
  );
};

export default Component;
