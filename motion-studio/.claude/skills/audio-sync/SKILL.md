---
name: audio-sync
description: Sincronizar animación con música o voz: detectar beats de un audio con `npm run beats`, usar `useBeats` para pulsos y acentos por frame, colocar cortes en el beat, ducking de música bajo voz, y SFX en entradas. Úsala cuando haya música, voz en off, "al ritmo", "con el beat" o efectos de sonido en el brief.
---

# Sincronía con audio

Verificado con `DemoAudio`: un click track de 10 s a 120 bpm detectado al 100 % (20/20 beats) y un anillo que pulsa en cada uno.

## 1. Detectar beats (sin dependencias)
```bash
npm run beats -- public/musica.mp3            # → public/musica.beats.json
npm run beats -- public/voz.wav --min-gap 0.3 --sensibilidad 2   # voz: menos onsets
```
Salida: `{ beats: [segundos], strengths: [0-1], bpm }`. Detector de energía (flujo positivo + umbral adaptativo). Para música con bombo claro funciona bien; para pads o voz, sube `--sensibilidad` o usa el BPM: `framesPerBeat = fps * 60 / bpm`.

## 2. Usarlos en la composición
```tsx
import beats from "../../public/musica.beats.json";
import { useBeats } from "../lib/beats";
const b = useBeats(beats, 8);          // 8 frames de decaimiento del pulso
const p = b.pulse(frame);              // 1 en el beat, decae a 0
const i = b.indexAt(frame);            // índice del último beat
const fuerte = i >= 0 && b.strength(i) > 0.7;   // acento
<div style={{ scale: `${1 + 0.15 * p}` }} />
```
- `b.frames` tiene los beats en frames: úsalo para `from` de `Sequence`s ("corte en el beat 8").
- Para que una entrada "caiga" en el beat, empieza su animación **2-3 frames antes**: lo que llega tarde parece roto.

## 3. Música + voz
```tsx
import { Audio } from "@remotion/media";
<Audio src={staticFile("musica.mp3")} volume={(f) => interpolate(f, [vozInicio - fps, vozInicio], [0.6, 0.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
<Audio src={staticFile("voz.mp3")} from={vozInicio} />
```
Ducking: música a 0.5-0.6 sola, 0.15-0.25 bajo voz, con 1 s de transición. Fundido de salida en el último segundo.

## 4. SFX
- Whoosh/click en entradas grandes, empezando 2-3 frames antes del movimiento.
- Riser antes de un corte, golpe en el corte.
- Tick suave bajo contadores.
- Fuentes gratuitas: Pixabay, Mixkit, freesound. El skill oficial de Remotion lista algunos en `https://remotion.media/*.wav`.
- Sin assets: un script Node puede sintetizar un kit básico a WAV (ruido filtrado = whoosh, seno con decaimiento = golpe). ffmpeg también: `ffmpeg -f lavfi -i "aevalsrc=0.8*sin(2*PI*220*t)*exp(-25*t):d=0.5" golpe.wav`.

## 5. Comprobar
`npm run probar -- DemoAudio` verifica beats.json (cantidad e intervalos). Para una pieza propia: extrae los frames de 3 beats (`npx remotion still … --frame=<b.frames[i]>`) y mira que el pulso esté en su máximo en ese frame.
