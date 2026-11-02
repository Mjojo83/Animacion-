---
name: patrones-motion
description: Catálogo de patrones de motion graphics ya implementados y probados en src/lib (entradas, cascadas, revelado de texto, resaltados, Ken Burns, gráficos de barras, anillo de progreso, revelado de logo, parallax, tarjeta, respiración, grano, viñeta, transiciones, tercio inferior, contador) con cuándo usar cada uno, sus props y sus trampas. Úsalo al construir cualquier pieza para no reinventar componentes y para elegir el patrón correcto por intención.
---

# Patrones de motion (src/lib/patterns y src/lib/components)

Todos reciben `style={st}` (de `useStyle`) y sacan de ahí colores, easings, duraciones y márgenes. Todos están renderizados en `CatalogoPatrones` (3 s cada uno): `npm run probar -- CatalogoPatrones` y mira `out/pruebas/CatalogoPatrones/contact-sheet.jpg`.

## Elegir por intención
| Quiero… | Patrón | Notas |
|---|---|---|
| Que un bloque entre con calidad | `Entrance` | opacidad + desplazamiento + escala a la vez. `from="up|down|left|right"`, `mode="spring"` para más carácter. Nunca un fade solo. |
| Una lista que se construye | `StaggerList` | `marker="dot|dash|number|none"`. Desfase por defecto 2× el stagger del estilo. |
| Titular que aparece | `TextReveal` | `variant="mask-up"` (limpio), `"words"` (cascada), `"chars"` (letra a letra, solo textos cortos), `"typewriter"` (mono), `"fade-up"`, `"scale"`. |
| Énfasis en una palabra | `Highlight` | `variant="marker|underline|box"`. Dentro de un `<p>`; empieza 10-15 frames después de que el texto esté quieto. |
| Una foto fija que no se vea muerta | `KenBurns` | Siempre en fotos. `zoomTo 1.06-1.12`, `panX -2..-4`. Alterna zoom-in/zoom-out entre planos. Lineal a propósito. |
| Datos comparados | `BarChart` | `highlightIndex` para la barra protagonista (color primario). `format` para unidades. |
| Un porcentaje | `ProgressRing` | `value 0-1`, `label`. Cifras tabulares automáticas. |
| Un número que impresiona | `Counter` | `to`, `prefix/suffix`, `decimals`. Duración `d.long` por defecto. |
| Logo o marca | `LogoReveal` | `variant="mask"` (sube desde una línea), `"wipe"` (barra de acento que revela), `"scale"` (spring). Termina en reposo: déjalo quieto ≥ 1 s. |
| Profundidad | `Parallax` | 2-3 capas con `depth` 0.2 / 0.6 / 1. `travel` 80-160 px. |
| Un bloque sobre superficie | `Card` | radio y borde del estilo; sombra solo si el estilo la tiene. |
| Algo quieto > 2 s | `Breathe` | micro-movimiento de 4 px; envuelve el bloque. |
| Textura de cine | `Grain` + `Vignette` | siempre las capas más altas; `Grain dark={false}` sobre fondos claros (multiply). |
| Cambio de escena | `SceneTransition` (wipe/slide/fade de color) o `TransitionSeries` de @remotion/transitions (fade/slide/wipe entre contenidos) | `SceneTransition` va encima de ambas escenas con `at`; `TransitionSeries` sustituye a las `Sequence` consecutivas. |
| Rótulo de persona | `LowerThird` | `name`, `title`, `position`. No compite con un titular en la misma escena. |
| Fondo | `Background` | `variant="solid|gradient|grid"`; respeta `textures` del estilo. |
| Subtítulos por palabra | `Captions` | ver skill `captions`. |
| Reaccionar a música | `useBeats` | ver skill `audio-sync`. |

## Reglas de combinación (lo que se vio en las pruebas)
1. **Orden de capas**: `Background` → contenido (dentro de `SafeArea`) → `SceneTransition` → `Grain` → `Vignette`.
2. **Entrada = 2-3 propiedades**; salida más corta que entrada (`exitAt` lo hace solo).
3. **Cascadas**: palabras 3 f, líneas de lista 6 f, bloques 8-10 f. Si la cascada dura más de 1 s, acórtala.
4. **Un protagonista por frame**: el color primario/acento en un solo elemento a la vez.
5. **Holds**: tras cada entrada, 15-25 frames sin nada nuevo. Las pausas hacen que lo demás parezca caro.
6. **Nada nuevo durante una transición**: la escena siguiente empieza sus entradas cuando la cortinilla ya descubrió (≈ `at + d.medium`).
7. **Logos y contadores terminan quietos**; no los saques con la misma velocidad con que entraron.

## Trampas concretas
- `TextReveal variant="mask-up"` recorta descendentes si el contenedor no tiene `paddingBottom`; ya lo lleva, no lo quites.
- `Highlight` necesita que el texto esté en una sola línea (`whiteSpace: nowrap` interno): no lo uses en frases largas.
- `KenBurns` con `rounded` usa el radio del estilo ×2; para sangrar a pantalla completa pasa `rounded={false}`.
- `BarChart` necesita un contenedor con `width` definido.
- `Parallax` es una `AbsoluteFill`: ponlo dentro de la `Sequence`, no dentro de `SafeArea` con flex.
- `TransitionSeries` acorta la duración total en la suma de las transiciones.

## Crear un patrón nuevo
Copia `src/lib/patterns/Entrance.tsx` como plantilla: recibe `style: ResolvedStyle`, usa `progress`/`springIn` de `../motion`, nunca valores mágicos que no vengan de `st.d.*`, `st.eases.*`, `st.s.palette.*`, `st.scale`. Añádelo a `patterns/index.ts` y a `CatalogoPatrones` para que `npm run probar` lo cubra.
