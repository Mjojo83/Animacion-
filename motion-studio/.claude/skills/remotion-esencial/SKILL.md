---
name: remotion-esencial
description: Referencia condensada y verificada de la API de Remotion 4.0.540 tal como se usa en este proyecto (frames, interpolate, spring, Sequence, Track, TransitionSeries, @remotion/media, imágenes, fuentes, props, render CLI) y las reglas de código que evitan renders rotos. Úsala al escribir o corregir cualquier composición si el plugin oficial de Remotion no está instalado; si está, úsala como resumen y consulta /remotion-markup para detalles.
---

# Remotion esencial (v4.0.540, verificado en este proyecto)

Destilado de los skills oficiales `remotion-dev/skills` y de lo que renderizó bien aquí (`npm run probar`).

## 1. Regla madre
Todo es función del frame. `useCurrentFrame()` + `interpolate()`/`spring()`. Prohibido y causa renders mal: CSS `transition`/`animation`, clases de animación de Tailwind, `setTimeout`, `requestAnimationFrame`, `Math.random` (usa `random("semilla")` de remotion), estado que cambie con el tiempo.

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
const frame = useCurrentFrame();
const { fps, width, height, durationInFrames } = useVideoConfig();
const o = interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
const s = spring({ frame, fps, config: { damping: 200 } }); // damping alto = sin rebote
```
- SIEMPRE `extrapolateLeft/Right: "clamp"` (si no, el valor se sale del rango antes y después).
- Segundos → frames con `fps` de `useVideoConfig()`, nunca una constante.
- Para escalas: `output: "perceptual-scale"` en `interpolate` compensa la percepción.
- Prefiere las propiedades CSS individuales `scale`, `translate`, `rotate` sobre `transform: "..."` (el Studio las puede editar; además se combinan sin orden).
- Mantén `useCurrentFrame()` en el componente más pequeño que lo necesite: si lo pones en la raíz, todo re-renderiza cada frame.

## 2. Estructura temporal
| Necesito | Uso |
|---|---|
| Una escena que empieza en el frame N y dura M | `<Sequence from={N} durationInFrames={M} name="...">` (dentro, `useCurrentFrame()` arranca en 0) |
| Escenas consecutivas que se reajustan si cambio una duración, con transiciones | `<TransitionSeries>` + `<TransitionSeries.Sequence durationInFrames>` + `<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 15})}/>` (`@remotion/transitions`, presentaciones en `@remotion/transitions/fade|slide|wipe|flip|clock-wipe|iris|…`) |
| Clips con inicio independiente sin solaparse | `<Track name="...">` con `from`/`durationInFrames` en cada hijo |
| Capa que llena todo | `<AbsoluteFill>` |
| Repetir | `<Loop durationInFrames>` o prop `loop` en media |
Las transiciones ACORTAN la línea de tiempo (las dos escenas se solapan durante la transición): réstalo al calcular `durationInFrames` total.

Props de tiempo que aceptan `<Sequence>`, `<Img>`, `<Video>`, `<Audio>`, `<Interactive.*>`: `from`, `trimBefore`, `durationInFrames`, `playbackRate`, `loop`.

## 3. Media
```tsx
import { Audio, Video } from "@remotion/media";     // ← paquete nuevo (no `Audio` de remotion)
import { Img, staticFile } from "remotion";
<Audio src={staticFile("musica.mp3")} volume={0.6} from={fps} trimBefore={2 * fps} />
<Video src={staticFile("clip.mp4")} trimBefore={4 * fps} durationInFrames={3 * fps} />
<Img src={staticFile("foto.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
```
- Archivos en `public/`, referenciados con `staticFile("ruta/relativa")`. Verificado aquí con `demo/foto.jpg`, `demo/logo.png`, `demo/clicks.wav`.
- Volumen con keyframes: `volume={interpolate(frame, [0, fps], [0, 1], {clamp…})}`.
- GIF/WebP animado: `<AnimatedImage>`. Imagen con efectos (blur, grano, viñeta por GPU): `<CanvasImage effects={[…]}>` + `@remotion/effects` (no instalado aquí; `npx remotion add @remotion/effects`).
- Metadatos de un video para la duración de la composición: `calculateMetadata` en `<Composition>` + `getVideoMetadata` de `@remotion/media-utils`.

## 4. Fuentes
- Este proyecto: `useStyleFonts(style)` carga las fuentes de Google de un `style.json` (dinámico): inyecta el CSS, espera a que cargue y solo entonces pide cada peso (normal e itálica) con `document.fonts.load`, reteniendo el render con `delayRender`. Verificado con Inter, JetBrains Mono, Playfair Display y DM Sans (`PruebaFuentes`). Pedir la fuente antes de que el CSS llegue es la causa típica de "a veces sale en sans".
- Alternativa oficial (tipada, por fuente): `import { loadFont } from "@remotion/google-fonts/Inter"; const { fontFamily } = loadFont("normal", { weights: ["400","700"], subsets: ["latin"] });` (ya instalado).
- Fuentes locales: `@remotion/fonts` `loadFont({ family, url: staticFile("x.woff2"), weight })`.
- Medir texto / ajustar a un ancho: `@remotion/layout-utils` → `measureText`, `fitText`, `fillTextBox` (instalado). Llamar solo después de que la fuente cargó.

## 5. Composiciones y props
```tsx
<Composition id="Intro" component={Intro} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ titulo: "Hola" }} />
```
- En este proyecto cada archivo de `src/compositions/` exporta `meta` + `Component` y `npm run manifest` los registra.
- Props editables desde fuera: `npx remotion render … --props='{"guides":true}'` (verificado con `DemoVertical`).
- Esquema zod para validar props en Studio: `schema={z.object({...})}` en `<Composition>`.
- Duración dinámica: `calculateMetadata={async ({ props }) => ({ durationInFrames, width, height, props })}`.

## 6. CLI (lo que se usa de verdad)
```bash
npx remotion studio                                   # preview en vivo (abre el navegador)
npx remotion render src/index.ts <Id> out/x.mp4       # h264 por defecto
npx remotion render src/index.ts <Id> out/x.mp4 --scale=0.5 --log=error   # rápido para revisar
npx remotion still  src/index.ts <Id> out/f.png --frame=40                # un frame exacto
npx remotion render src/index.ts <Id> out/frames --frames=0,30,90 --image-format=png   # varios frames
npx remotion render … --codec=vp9|prores|gif  --crf=16  --jpeg-quality=90  --concurrency=4
npx remotion add @remotion/<paquete>                  # instala a la versión correcta
```
Remotion descarga su propio Chrome Headless Shell la primera vez. Solo si falla (sandbox, CI sin red) pasa `REMOTION_BROWSER_EXECUTABLE` (lo lee `remotion.config.ts`) o `--browser-executable`.

## 7. Patrones de layout que no fallan
- Texto siempre dentro de un contenedor con `padding` = margen seguro (`<SafeArea style={st}>` aquí).
- Tamaños relativos: `fontSize: height * 0.08`. Nunca px fijos pensados para 1080p.
- `gap`/`margin` en flex con texto grande: usar px, no `em` (em se resuelve contra el padre, no contra el texto grande).
- Un elemento que entra debe salir o quedarse con sentido; usa `exitAt` en los componentes de `src/lib`.
- Dos líneas máximo de titular; `maxWidth` siempre.
- Para que el Studio pueda editar, deja `interpolate()` inline en `style` y nombres literales en `name="..."`.

## 8. Checklist antes de dar una pieza por buena
1. `npm run manifest && npm run typecheck` sin errores.
2. `npm run probar -- <Id>`: render OK, sin tramos estáticos > 2.5 s, hay movimiento en el primer segundo.
3. Mirar `out/pruebas/<Id>/contact-sheet.jpg` con Read: fuente cargada, nada cortado, nada fuera del estilo.
