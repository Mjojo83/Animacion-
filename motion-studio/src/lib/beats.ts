import { useVideoConfig } from "remotion";

export type BeatsFile = { file: string; beats: number[]; strengths: number[]; bpm: number | null };

export type Beats = {
  /** Frames (enteros) en los que cae cada beat. */
  frames: number[];
  /** Índice del último beat ocurrido en o antes de `frame`, o -1. */
  indexAt: (frame: number) => number;
  /** 1 en el frame del beat y decae linealmente a 0 en `decay` frames. */
  pulse: (frame: number, decay?: number) => number;
  /** true solo en el frame exacto del beat. */
  isBeat: (frame: number) => boolean;
  /** Fuerza relativa 0-1 del beat `i` (acentos = más fuerte). */
  strength: (i: number) => number;
  bpm: number | null;
};

/**
 * Convierte un beats.json (generado con `npm run beats -- <audio>`) en
 * utilidades por frame para sincronizar animación con música.
 */
export const useBeats = (data: BeatsFile, decayFrames = 8): Beats => {
  const { fps } = useVideoConfig();
  const frames = data.beats.map((t) => Math.round(t * fps));
  const indexAt = (frame: number) => {
    let idx = -1;
    for (let i = 0; i < frames.length; i++) {
      if (frames[i] <= frame) idx = i;
      else break;
    }
    return idx;
  };
  return {
    frames,
    indexAt,
    isBeat: (frame) => frames.includes(frame),
    pulse: (frame, decay = decayFrames) => {
      const i = indexAt(frame);
      if (i < 0) return 0;
      const since = frame - frames[i];
      return Math.max(0, 1 - since / decay);
    },
    strength: (i) => data.strengths[i] ?? 1,
    bpm: data.bpm,
  };
};
