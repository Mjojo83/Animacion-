import React from "react";
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import style from "../../styles/ejemplo-minimal-tech/style.json";
import type { CompositionMeta } from "../lib/composition";
import { useStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";
import { Accent, Background, Counter, SafeArea, SceneTransition, TextReveal } from "../lib/components";
import { Entrance, StaggerList, Vignette } from "../lib/patterns";

export const meta: CompositionMeta = {
  id: "DemoVertical",
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 240,
  style: "ejemplo-minimal-tech",
  description: "Reel vertical de 8 s: gancho, tres puntos, dato y CTA, respetando las zonas de interfaz de Reels/TikTok.",
};

export type Props = { guides?: boolean };

/*
 * GUION (240 f @30), 9:16:
 *   0-80     Gancho: titular grande + línea
 *   70-114   Wipe
 *   92-180   Lista de 3 puntos en cascada
 *   170-214  Wipe
 *   192-240  Dato + CTA
 * Zona segura vertical: 12 % arriba y 18 % abajo libres (interfaz de la app).
 */
export const Component: React.FC<Props> = ({ guides = false }) => {
  const st = useStyle(style);
  useStyleFonts(style);
  const { width, height } = useVideoConfig();
  const { s } = st;
  const top = height * 0.12;
  const bottom = height * 0.18;

  return (
    <Background style={st} variant="grid">
      <AbsoluteFill style={{ paddingTop: top, paddingBottom: bottom, boxSizing: "border-box" }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Sequence from={0} durationInFrames={92} name="Gancho">
            <SafeArea style={st} align="start" justify="center">
              <Accent style={st} variant="bar" start={2} exitAt={76} length={width * 0.18} />
              <TextReveal style={st} text="Tu estilo, en cada video." start={10} exitAt={78} variant="words" size={0.062} maxWidth={width * 0.86} />
              <TextReveal style={st} text="Sin keyframes a mano" start={26} exitAt={80} variant="fade-up" role="body" size={0.026} color={s.palette.muted} />
            </SafeArea>
          </Sequence>
          <Sequence from={92} durationInFrames={100} name="Lista">
            <SafeArea style={st} align="start" justify="center">
              <TextReveal style={st} text="Cómo funciona" start={4} exitAt={84} variant="mask-up" size={0.045} color={s.palette.accent} />
              <StaggerList style={st} items={["Nombras un estilo", "Subes referencias", "Opus anima con ellas"]} start={14} exitAt={84} marker="number" size={0.036} />
            </SafeArea>
          </Sequence>
          <Sequence from={192} name="Dato y CTA">
            <SafeArea style={st} align="center" justify="center">
              <Counter style={st} to={10} suffix=" s" start={4} size={0.14} />
              <TextReveal style={st} text="por pieza, de brief a render" start={10} variant="fade-up" role="body" size={0.026} color={s.palette.muted} align="center" />
              <Entrance style={st} start={22} mode="spring">
                <div style={{ marginTop: height * 0.02, padding: `${height * 0.012}px ${width * 0.06}px`, background: s.palette.primary, borderRadius: s.shapes.cornerRadius * st.scale * 2, ...st.fonts.display, fontSize: height * 0.028, color: s.palette.background }}>
                  Pruébalo
                </div>
              </Entrance>
            </SafeArea>
          </Sequence>
        </div>
      </AbsoluteFill>
      <SceneTransition style={st} at={70} variant="wipe" direction="up" />
      <SceneTransition style={st} at={170} variant="wipe" direction="down" />
      <Vignette strength={0.15} />
      {guides && (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: top, background: "rgba(255,0,0,0.18)", borderBottom: "2px dashed rgba(255,80,80,0.8)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bottom, background: "rgba(255,0,0,0.18)", borderTop: "2px dashed rgba(255,80,80,0.8)" }} />
          <div style={{ position: "absolute", inset: `${top + st.margin}px ${st.margin}px ${bottom + st.margin}px`, border: "2px dashed rgba(54,226,180,0.6)" }} />
        </AbsoluteFill>
      )}
    </Background>
  );
};

export default Component;
