import type React from "react";

/** Metadatos que cada archivo de src/compositions/*.tsx debe exportar como `meta`. */
export type CompositionMeta = {
  /** Identificador único, PascalCase, sin espacios. Es el que usa `remotion render`. */
  id: string;
  width: number;
  height: number;
  fps: number;
  durationInFrames: number;
  /** Nombre del estilo en styles/<nombre> con el que se creó. */
  style: string;
  /** Qué es este video, en una frase. */
  description: string;
};

export type CompositionModule = {
  meta: CompositionMeta;
  Component: React.FC;
};

export const FORMATS: Record<string, { width: number; height: number }> = {
  "16:9": { width: 1920, height: 1080 },
  "9:16": { width: 1080, height: 1920 },
  "1:1": { width: 1080, height: 1080 },
  "4:5": { width: 1080, height: 1350 },
  "21:9": { width: 2560, height: 1080 },
};
