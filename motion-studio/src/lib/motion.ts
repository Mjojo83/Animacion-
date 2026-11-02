import { Easing, interpolate, spring } from "remotion";
import type { Style } from "./style-schema";

/**
 * Utilidades de movimiento. Todas reciben el frame actual y devuelven valores
 * listos para usar en estilos CSS. Están pensadas para que Opus genere código
 * corto y consistente con el estilo.
 */

export type EasingFn = (t: number) => number;

/** Convierte "cubic-bezier(0.2, 0, 0, 1)" en una función de Remotion. */
export const bezierFromString = (value: string): EasingFn => {
  const match = value.match(/cubic-bezier\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)/i);
  if (!match) {
    const named: Record<string, EasingFn> = {
      linear: Easing.linear,
      ease: Easing.bezier(0.25, 0.1, 0.25, 1),
      "ease-in": Easing.in(Easing.quad),
      "ease-out": Easing.out(Easing.quad),
      "ease-in-out": Easing.inOut(Easing.quad),
    };
    return named[value.trim()] ?? Easing.bezier(0.2, 0, 0, 1);
  }
  const [x1, y1, x2, y2] = match.slice(1, 5).map(Number);
  return Easing.bezier(x1, y1, x2, y2);
};

export type Eases = { in: EasingFn; out: EasingFn; inOut: EasingFn };

export const easesFromStyle = (style: Style): Eases => ({
  in: bezierFromString(style.motion.easing.in),
  out: bezierFromString(style.motion.easing.out),
  inOut: bezierFromString(style.motion.easing.inOut),
});

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

/** Progreso 0→1 entre start y start+duration, con easing. */
export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: EasingFn = Easing.bezier(0.2, 0, 0, 1),
): number => interpolate(frame, [start, start + duration], [0, 1], { ...clamp, easing });

/** Progreso 1→0 (salida). */
export const progressOut = (
  frame: number,
  start: number,
  duration: number,
  easing: EasingFn = Easing.bezier(0.4, 0, 1, 1),
): number => 1 - progress(frame, start, duration, easing);

/** Entrada y salida en una sola curva: 0→1 se mantiene y vuelve a 0 al final. */
export const inOut = (
  frame: number,
  start: number,
  end: number,
  inDuration: number,
  outDuration: number,
  eases: Eases,
): number => {
  const a = progress(frame, start, inDuration, eases.out);
  const b = progressOut(frame, end - outDuration, outDuration, eases.in);
  return Math.min(a, b);
};

/** Frame de inicio para el elemento `index` en una cascada. */
export const staggerStart = (index: number, base: number, step: number): number => base + index * step;

/** Spring normalizado 0→1 con la configuración del estilo. */
export const springIn = (frame: number, fps: number, style: Style, delay = 0): number =>
  spring({
    frame: frame - delay,
    fps,
    config: {
      damping: style.motion.spring.damping,
      stiffness: style.motion.spring.stiffness,
      mass: style.motion.spring.mass,
    },
  });

/** Texto que se va escribiendo. `cps` = caracteres por segundo. */
export const typewriter = (frame: number, fps: number, text: string, start: number, cps = 24): string => {
  const chars = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  return text.slice(0, Math.min(text.length, chars));
};

/** Mezcla lineal (útil para colores numéricos, posiciones, etc.). */
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Oscilación suave (respiración, flotación). */
export const breathe = (frame: number, fps: number, periodSeconds = 3, amplitude = 1): number =>
  Math.sin((frame / fps / periodSeconds) * Math.PI * 2) * amplitude;

/** Convierte segundos a frames con el fps de la composición. */
export const sec = (seconds: number, fps: number): number => Math.round(seconds * fps);
