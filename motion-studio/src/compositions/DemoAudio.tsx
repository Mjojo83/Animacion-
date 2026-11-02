import React from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import style from "../../styles/ejemplo-minimal-tech/style.json";
import beatsData from "../../public/demo/clicks.beats.json";
import type { CompositionMeta } from "../lib/composition";
import { useStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";
import { useBeats } from "../lib/beats";
import { Background, SafeArea, TextReveal } from "../lib/components";
import { Vignette } from "../lib/patterns";

export const meta: CompositionMeta = {
  id: "DemoAudio",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 300,
  style: "ejemplo-minimal-tech",
  description: "Sincronía con música: el anillo y las barras reaccionan a los beats detectados con `npm run beats`.",
};

/*
 * Flujo: npm run beats -- public/demo/clicks.wav  →  clicks.beats.json
 * useBeats() convierte los tiempos a frames; pulse() vale 1 en el beat y decae.
 * Los acentos (beats con strength alta) disparan el cambio de color.
 */
export const Component: React.FC = () => {
  const st = useStyle(style);
  useStyleFonts(style);
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();
  const beats = useBeats(beatsData, 8);
  const { s } = st;
  const p = beats.pulse(frame);
  const idx = beats.indexAt(frame);
  const accent = idx >= 0 && beats.strength(idx) > 0.7;
  const ring = height * 0.34;

  return (
    <Background style={st} variant="grid">
      <Audio src={staticFile("demo/clicks.wav")} volume={0.8} />
      <SafeArea style={st} align="center" justify="center" gap={height * 0.04}>
        <div style={{ position: "relative", width: ring, height: ring }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `${Math.max(3, st.s.shapes.strokeWidth * 3 * st.scale)}px solid ${accent ? s.palette.accent : s.palette.primary}`, scale: `${1 + 0.18 * p}`, opacity: 0.35 + 0.65 * p }} />
          <div style={{ position: "absolute", inset: ring * 0.3, borderRadius: "50%", background: accent ? s.palette.accent : s.palette.primary, scale: `${0.85 + 0.25 * p}` }} />
        </div>
        <div style={{ display: "flex", gap: 8 * st.scale, alignItems: "flex-end", height: height * 0.12 }}>
          {beats.frames.map((bf, i) => {
            const since = frame - bf;
            const h = since < 0 ? 0.15 : Math.max(0.15, 1 - since / 20);
            return <div key={i} style={{ width: (width * 0.5) / beats.frames.length - 8 * st.scale, height: `${h * 100}%`, background: beats.strength(i) > 0.7 ? s.palette.accent : s.palette.primary, opacity: since < 0 ? 0.25 : 1, borderRadius: 2 }} />;
          })}
        </div>
        <TextReveal style={st} text={`beat ${Math.max(0, idx + 1)} / ${beats.frames.length} · ${beats.bpm ?? "?"} bpm`} start={0} role="mono" size={0.028} color={s.palette.muted} variant="fade-up" align="center" />
      </SafeArea>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <Vignette strength={0.2} />
      </AbsoluteFill>
    </Background>
  );
};

export default Component;
