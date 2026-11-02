import React from "react";
import { useVideoConfig } from "remotion";
import style from "../../styles/ejemplo-minimal-tech/style.json";
import type { CompositionMeta } from "../lib/composition";
import { useStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";
import { Background, Captions, SafeArea, TextReveal, type CaptionWord } from "../lib/components";
import { KenBurns } from "../lib/patterns";

export const meta: CompositionMeta = {
  id: "DemoCaptions",
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 270,
  style: "ejemplo-minimal-tech",
  description: "Subtítulos sincronizados por palabra (formato Whisper) sobre una imagen con Ken Burns, en vertical.",
};

// Palabras con tiempos (lo que devuelve Whisper / @remotion/install-whisper-cpp). Aquí sintéticas.
const text = "Así se ven los subtítulos por palabra: la activa se resalta con el color de acento y las líneas cambian solas";
const words: CaptionWord[] = text.split(" ").map((w, i) => ({ text: w, start: 0.6 + i * 0.36, end: 0.6 + i * 0.36 + 0.34 }));

export const Component: React.FC = () => {
  const st = useStyle(style);
  useStyleFonts(style);
  const { height } = useVideoConfig();
  return (
    <Background style={st}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <KenBurns style={st} src="demo/foto.jpg" zoomTo={1.12} panX={-4} rounded={false} />
      </div>
      <SafeArea style={st} align="start" justify="start">
        <div style={{ marginTop: height * 0.12 }}>
          <TextReveal style={st} text="Captions" start={4} variant="mask-up" size={0.05} />
          <TextReveal style={st} text="modo karaoke · 4 palabras por línea" start={10} variant="fade-up" role="body" size={0.024} color={st.s.palette.muted} />
        </div>
      </SafeArea>
      <Captions style={st} words={words} maxWords={4} mode="karaoke" size={0.042} y={0.66} />
    </Background>
  );
};

export default Component;
