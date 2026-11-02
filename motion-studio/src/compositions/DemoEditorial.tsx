import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import style from "../../styles/ejemplo-editorial-calido/style.json";
import type { CompositionMeta } from "../lib/composition";
import { useStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";
import { Accent, Background, SafeArea, SceneTransition, TextReveal } from "../lib/components";
import { Entrance, Grain, Highlight, KenBurns } from "../lib/patterns";

export const meta: CompositionMeta = {
  id: "DemoEditorial",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 300,
  style: "ejemplo-editorial-calido",
  description: "Apertura editorial de 10 s con el estilo claro/serif: etiqueta, titular con palabra en terracota, foto con Ken Burns y cita.",
};

/*
 * GUION (300 f @30):
 *   0-150   Escena 1: filete + etiqueta versalitas + titular (cascada) + cuerpo
 *   140-208 Fundido a papel (SceneTransition fade)
 *   160-300 Escena 2: foto en tarjeta (Ken Burns) + cita + cierre
 */
export const Component: React.FC = () => {
  const st = useStyle(style);
  useStyleFonts(style);
  const { width, height } = useVideoConfig();
  const { s, d } = st;

  return (
    <Background style={st} variant="solid" textureOpacity={0.07}>
      <Sequence from={0} durationInFrames={160} name="Apertura">
        <SafeArea style={st} align="start" justify="center" gap={height * 0.02}>
          <Accent style={st} variant="line" start={2} exitAt={142} length={width * 0.1} color={s.palette.foreground} thickness={1.5} />
          <TextReveal style={st} text="CUADERNO DE VIAJE · Nº 12" start={8} exitAt={142} variant="chars" role="body" size={0.02} color={s.palette.muted} styleOverride={{ letterSpacing: "0.18em" }} />
          <p style={{ ...st.fonts.display, fontSize: height * 0.085, color: s.palette.foreground, margin: 0, maxWidth: width * 0.55, lineHeight: 1.05 }}>
            <TextReveal style={st} text="El café que se cultiva" start={16} exitAt={144} variant="words" size={0.085} styleOverride={{ display: "inline" }} />{" "}
            <span style={{ fontStyle: "italic", color: s.palette.primary }}>
              <TextReveal style={st} text="despacio" start={16 + d.stagger * 4} exitAt={144} variant="words" size={0.085} color={s.palette.primary} styleOverride={{ display: "inline", fontStyle: "italic" }} />
            </span>
          </p>
          <TextReveal
            style={st}
            text="Tres fincas, una cosecha y la paciencia de quienes esperan a que madure el fruto."
            start={40}
            exitAt={146}
            variant="fade-up"
            role="body"
            size={0.028}
            color={s.palette.muted}
            maxWidth={width * 0.42}
          />
          {/* Filete que se dibuja despacio durante la pausa de lectura (movimiento firma del estilo) */}
          <Accent style={st} variant="line" start={64} exitAt={142} length={width * 0.42} color={s.palette.secondary} thickness={1} />
        </SafeArea>
      </Sequence>

      <Sequence from={160} name="Foto y cita">
        <SafeArea style={st} direction="row" align="center" justify="space-between">
          <Entrance style={st} start={6} fromScale={1} distance={24}>
            <div style={{ width: width * 0.4, height: height * 0.62 }}>
              <KenBurns style={st} src="demo/foto.jpg" zoomTo={1.06} panX={-2} duration={140} />
            </div>
          </Entrance>
          <div style={{ width: width * 0.38, display: "flex", flexDirection: "column", gap: height * 0.02 }}>
            <span style={{ ...st.fonts.display, fontSize: height * 0.16, color: s.palette.primary, lineHeight: 0.6, marginBottom: height * 0.02 }}>“</span>
            <TextReveal style={st} text="Aquí nadie tiene prisa, ni siquiera el agua." start={14} variant="words" size={0.055} styleOverride={{ fontStyle: "italic", lineHeight: 1.15 }} />
            <p style={{ ...st.fonts.body, fontSize: height * 0.024, color: s.palette.muted, margin: 0, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              <TextReveal style={st} text="Lucía Herrera · productora" start={48} variant="fade-up" role="body" size={0.022} color={s.palette.muted} styleOverride={{ letterSpacing: "0.18em", textTransform: "uppercase" }} />
            </p>
            <Entrance style={st} start={56} fromScale={1} distance={16}>
              <div style={{ marginTop: height * 0.02 }}>
                <Highlight style={st} start={74} variant="underline" color={s.palette.accent}>
                  <span style={{ ...st.fonts.body, fontSize: height * 0.026, color: s.palette.foreground }}>Leer el reportaje completo</span>
                </Highlight>
              </div>
            </Entrance>
          </div>
        </SafeArea>
      </Sequence>

      <SceneTransition style={st} at={140} variant="fade" color={s.palette.background} />
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <Grain opacity={0.08} dark={false} />
      </AbsoluteFill>
    </Background>
  );
};

export default Component;
