import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import style from "../../styles/ejemplo-minimal-tech/style.json";
import type { CompositionMeta } from "../lib/composition";
import { useStyle, type ResolvedStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";
import { Accent, Background, Counter, LowerThird, SafeArea, TextReveal } from "../lib/components";
import { BarChart, Breathe, Card, Entrance, Grain, Highlight, KenBurns, LogoReveal, Parallax, ProgressRing, StaggerList, Vignette } from "../lib/patterns";

const SCENE = 90; // 3 s por patrón

const scenes = ["Entrance", "StaggerList", "TextReveal", "Highlight", "KenBurns", "BarChart", "ProgressRing", "LogoReveal", "Parallax", "Card+Breathe", "TransitionSeries", "LowerThird+Counter"] as const;

export const meta: CompositionMeta = {
  id: "CatalogoPatrones",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: SCENE * scenes.length,
  style: "ejemplo-minimal-tech",
  description: "Catálogo de todos los patrones de src/lib/patterns, 3 s cada uno. Sirve para probar y como referencia visual.",
};

const Label: React.FC<{ st: ResolvedStyle; text: string; index: number }> = ({ st, text, index }) => (
  <div style={{ position: "absolute", top: st.margin * 0.5, left: st.margin * 0.5, ...st.fonts.mono, fontSize: 22 * st.scale, color: st.s.palette.accent }}>
    {String(index + 1).padStart(2, "0")} · {text}
  </div>
);

export const Component: React.FC = () => {
  const st = useStyle(style);
  useStyleFonts(style);
  const { width, height } = useVideoConfig();
  const { s } = st;

  return (
    <Background style={st} variant="grid">
      {scenes.map((name, i) => (
        <Sequence key={name} from={i * SCENE} durationInFrames={SCENE} name={name}>
          <Label st={st} text={name} index={i} />
          <SafeArea style={st} align={name === "LogoReveal" || name === "ProgressRing" ? "center" : "start"} justify="center">
            {name === "Entrance" && (
              <>
                <Entrance style={st} start={5} exitAt={SCENE - 14}>
                  <p style={{ ...st.fonts.display, fontSize: height * 0.09, margin: 0, color: s.palette.foreground }}>Entrance: opacidad + subida + escala</p>
                </Entrance>
                <Entrance style={st} start={5 + st.d.stagger * 2} exitAt={SCENE - 12} from="left" mode="spring">
                  <p style={{ ...st.fonts.body, fontSize: height * 0.03, margin: 0, color: s.palette.muted }}>mode="spring" desde la izquierda, con la cadencia del estilo</p>
                </Entrance>
              </>
            )}
            {name === "StaggerList" && <StaggerList style={st} items={["Primero el guion por frames", "Una idea por escena", "Salidas más rápidas que entradas", "Nada fuera del margen seguro"]} start={4} exitAt={SCENE - 20} marker="number" />}
            {name === "TextReveal" && (
              <>
                <TextReveal style={st} text="words: cascada de palabras" start={4} exitAt={SCENE - 14} variant="words" size={0.07} />
                <TextReveal style={st} text="chars: letra a letra" start={14} exitAt={SCENE - 14} variant="chars" size={0.05} color={s.palette.muted} />
                <TextReveal style={st} text="> typewriter con cursor" start={24} exitAt={SCENE - 14} variant="typewriter" role="mono" size={0.035} color={s.palette.accent} />
              </>
            )}
            {name === "Highlight" && (
              <p style={{ ...st.fonts.display, fontSize: height * 0.075, margin: 0, color: s.palette.foreground, maxWidth: width * 0.75, lineHeight: 1.25 }}>
                Resalta <Highlight style={st} start={10} variant="marker">una palabra</Highlight>, <Highlight style={st} start={25} variant="underline" color={s.palette.primary}>subraya otra</Highlight> o{" "}
                <Highlight style={st} start={40} variant="box">encierra</Highlight> la clave.
              </p>
            )}
            {name === "KenBurns" && (
              <div style={{ width: width * 0.6, height: height * 0.6 }}>
                <KenBurns style={st} src="demo/foto.jpg" zoomTo={1.1} panX={-3} duration={SCENE} />
              </div>
            )}
            {name === "BarChart" && (
              <div style={{ width: width * 0.6 }}>
                <BarChart style={st} data={[{ label: "Ene", value: 42 }, { label: "Feb", value: 58 }, { label: "Mar", value: 35 }, { label: "Abr", value: 81 }, { label: "May", value: 66 }]} start={4} highlightIndex={3} format={(v) => `${Math.round(v)}k`} />
              </div>
            )}
            {name === "ProgressRing" && <ProgressRing style={st} value={0.78} start={4} label="completado" />}
            {name === "LogoReveal" && (
              <div style={{ display: "flex", gap: width * 0.06, alignItems: "center" }}>
                <LogoReveal style={st} src="demo/logo.png" start={4} exitAt={SCENE - 12} size={0.28} variant="mask" />
                <LogoReveal style={st} text="wordmark" start={14} exitAt={SCENE - 12} size={0.22} variant="wipe" />
                <LogoReveal style={st} text="scale" start={24} exitAt={SCENE - 12} size={0.22} variant="scale" />
              </div>
            )}
            {name === "Parallax" && (
              <Parallax
                travel={160}
                duration={SCENE}
                layers={[
                  { depth: 0.2, children: <div style={{ position: "absolute", left: "15%", top: "25%", width: 500, height: 500, borderRadius: "50%", background: `${s.palette.primary}22` }} /> },
                  { depth: 0.6, children: <div style={{ position: "absolute", left: "55%", top: "35%", width: 320, height: 320, borderRadius: st.s.shapes.cornerRadius * 4, background: `${s.palette.secondary}44` }} /> },
                  { depth: 1, children: <p style={{ position: "absolute", left: "30%", top: "42%", ...st.fonts.display, fontSize: height * 0.08, color: s.palette.foreground, margin: 0 }}>Parallax en 3 capas</p> },
                ]}
              />
            )}
            {name === "Card+Breathe" && (
              <Entrance style={st} start={4} exitAt={SCENE - 14}>
                <Breathe style={st}>
                  <Card style={st} styleOverride={{ width: width * 0.45 }}>
                    <p style={{ ...st.fonts.mono, fontSize: height * 0.022, color: s.palette.accent, margin: 0 }}>// tarjeta</p>
                    <p style={{ ...st.fonts.display, fontSize: height * 0.05, color: s.palette.foreground, margin: `${8 * st.scale}px 0` }}>Respira mientras espera</p>
                    <p style={{ ...st.fonts.body, fontSize: height * 0.026, color: s.palette.muted, margin: 0 }}>Micro-movimiento sinusoidal de 4 px para que nada parezca congelado.</p>
                  </Card>
                </Breathe>
              </Entrance>
            )}
            {name === "TransitionSeries" && (
              <AbsoluteFill>
                <TransitionSeries>
                  <TransitionSeries.Sequence durationInFrames={35}>
                    <Slide st={st} text="Escena A" color={s.palette.surface} />
                  </TransitionSeries.Sequence>
                  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 12 })} />
                  <TransitionSeries.Sequence durationInFrames={35}>
                    <Slide st={st} text="Escena B (fade)" color={s.palette.primary} />
                  </TransitionSeries.Sequence>
                  <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 12 })} />
                  <TransitionSeries.Sequence durationInFrames={44}>
                    <Slide st={st} text="Escena C (slide)" color={s.palette.secondary} />
                  </TransitionSeries.Sequence>
                </TransitionSeries>
              </AbsoluteFill>
            )}
            {name === "LowerThird+Counter" && (
              <>
                <Counter style={st} to={12480} suffix=" visitas" start={4} size={0.14} />
                <LowerThird style={st} name="Ana Ruiz" title="Directora de arte" start={10} exitAt={SCENE - 14} />
                <Accent style={st} variant="frame" start={2} exitAt={SCENE - 10} />
              </>
            )}
          </SafeArea>
        </Sequence>
      ))}
      <Grain opacity={0.05} />
      <Vignette strength={0.18} />
    </Background>
  );
};

const Slide: React.FC<{ st: ResolvedStyle; text: string; color: string }> = ({ st, text, color }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ ...st.fonts.display, fontSize: height * 0.08, color: st.s.palette.foreground, margin: 0, opacity: Math.min(1, frame / 6) }}>{text}</p>
    </AbsoluteFill>
  );
};

export default Component;
