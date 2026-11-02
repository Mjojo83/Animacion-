import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import style from "../../styles/ejemplo-minimal-tech/style.json";
import type { CompositionMeta } from "../lib/composition";
import { useStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";
import { Accent, Background, Counter, LowerThird, SafeArea, SceneTransition, TextReveal } from "../lib/components";
import { progress } from "../lib/motion";

export const meta: CompositionMeta = {
  id: "DemoMinimalTech",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 300,
  style: "ejemplo-minimal-tech",
  description: "Intro de 10 s de producto de software en el estilo de ejemplo. Sirve de plantilla.",
};

/*
 * Guion (300 frames @30):
 *   0-120   Escena 1: línea de acento + titular en cascada + subtítulo
 *   110-154 Wipe
 *   132-232 Escena 2: dato grande con contador + etiqueta mono + rótulo
 *   222-266 Wipe
 *   244-300 Escena 3: cierre centrado
 */
export const Component: React.FC = () => {
  const st = useStyle(style);
  useStyleFonts(style);
  const { s, d, eases, margin } = st;
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();

  return (
    <Background style={st} variant="grid">
      {/* Escena 1 */}
      <Sequence from={0} durationInFrames={132} name="Titular">
        <SafeArea style={st} align="start" justify="center">
          <Accent style={st} variant="line" start={4} exitAt={118} length={width * 0.18} />
          <TextReveal style={st} text="Animaciones que aprenden tu estilo." start={14} exitAt={118} variant="words" size={0.095} maxWidth={width * 0.72} />
          <TextReveal
            style={st}
            text="Nombras un estilo, subes referencias y Opus 5.5 anima con ellas."
            start={14 + d.stagger * 6}
            exitAt={120}
            variant="fade-up"
            role="body"
            size={0.03}
            color={s.palette.muted}
            maxWidth={width * 0.5}
          />
        </SafeArea>
      </Sequence>

      {/* Escena 2 */}
      <Sequence from={132} durationInFrames={112} name="Dato">
        <SafeArea style={st} align="start" justify="center">
          <TextReveal style={st} text="// render en segundos" start={4} exitAt={100} variant="typewriter" role="mono" size={0.026} color={s.palette.accent} />
          <Counter style={st} to={300} suffix=" frames" start={8} duration={d.long} size={0.16} />
          <TextReveal style={st} text="cada uno dibujado en código, sin keyframes a mano" start={20} exitAt={100} variant="mask-up" role="body" size={0.03} color={s.palette.muted} />
        </SafeArea>
        <LowerThird style={st} name="motion-studio" title="Remotion + Claude Opus 5.5" start={30} exitAt={98} />
      </Sequence>

      {/* Escena 3 */}
      <Sequence from={244} name="Cierre">
        <Closing st={st} />
      </Sequence>

      {/* Cortinillas, encima de todo */}
      <SceneTransition style={st} at={110} variant="wipe" />
      <SceneTransition style={st} at={222} variant="wipe" direction="left" />

      {/* Marca de agua discreta en la esquina (demo de posicionamiento absoluto) */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            top: margin,
            right: margin,
            ...st.fonts.mono,
            fontSize: 18 * st.scale,
            color: s.palette.muted,
            opacity: progress(frame, 10, d.medium, eases.out) * 0.8,
          }}
        >
          v{style.version} · {s.name}
        </div>
      </AbsoluteFill>
    </Background>
  );
};

const Closing: React.FC<{ st: ReturnType<typeof useStyle> }> = ({ st }) => {
  const { width } = useVideoConfig();
  return (
    <SafeArea style={st} align="center" justify="center" gap={st.margin * 0.4}>
      <TextReveal style={st} text="motion-studio" start={6} variant="scale" size={0.11} align="center" />
      <Accent style={st} variant="line" start={14} length={width * 0.12} color={st.s.palette.primary} />
      <TextReveal style={st} text="tu estilo, en código" start={18} variant="fade-up" role="body" size={0.03} color={st.s.palette.muted} align="center" />
    </SafeArea>
  );
};

export default Component;
