# Registro de pruebas (el loop)

Cómo se probó cada skill y cada patrón: escribir una composición que lo use → `npm run probar` (render a media escala con Remotion + Chromium, 8 frames con ffmpeg, hoja de contacto, comprobaciones automáticas) → mirar la hoja de contacto → corregir → repetir. Todo lo de abajo se puede reproducir en tu máquina con los mismos comandos.

## Entorno de la prueba
- Node 22.23, ffmpeg 6.1, Remotion 4.0.540, Chromium de Playwright vía `REMOTION_BROWSER_EXECUTABLE`.
- Sin clave de API: los comandos que llaman a Opus (`estilo aprender`, `animar`, `revisar`) compilan pero no se ejecutaron aquí. Todo lo demás sí.

## Ronda 1 → fallos encontrados y arreglos
| Qué falló | Causa | Arreglo |
|---|---|---|
| `CatalogoPatrones`: "duración 36 s ≠ 0.40 s" | `readMeta` leía `durationInFrames: 12` de un `linearTiming({...})`, no del objeto `meta` | `readMeta` busca solo dentro de `export const meta = {...}`; `probar` además importa el módulo con tsx y lee `meta` real |
| `DemoCaptions`: "Padded dimensions cannot be smaller than input dimensions" | La hoja de contacto escalaba a 480×853 y `pad` recibía 854 | Dimensiones pares + `force_divisible_by=2` en `contactSheet` |
| El loop se detenía en el primer error | Sin try/catch por composición | Cada composición se prueba aislada y el reporte sigue |
| Falsos "tramos estáticos" en Ken Burns, anillo y parallax | Métrica media de diferencia a 48×27 no veía movimientos sutiles | Nueva métrica: % de píxeles que cambian > 8/255 a 192×108 y 5 fps; umbral 0.15 % calibrado con el catálogo (Ken Burns lento = 0.5-0.9 %, anillo = 0.2-0.9 %, quieto = 0 %) |
| Barras del `BarChart` casi invisibles | Color `surface` sobre `background` oscuro | Barras no destacadas en primario al 33 % |
| `beats.ts` detectaba 19 de 20 beats | El golpe en t=0 no tenía frame anterior con el que comparar | `flux[0] = energy[0]`; bpm con media de intervalos cercanos a la mediana (118 → 120) |

## Ronda 2 → 7/7 renderizan; dos hallazgos más
| Qué falló | Causa | Arreglo |
|---|---|---|
| `PruebaFuentes`: Playfair Display salía en sans aunque `DemoEditorial` sí la mostraba en serif | **Carrera de carga**: `useGoogleFont` inyectaba el `<link>` y llamaba `document.fonts.load()` al instante; como el CSS aún no había llegado, no existía ninguna `FontFace` de esa familia y la promesa resolvía vacía → `continueRender` antes de descargar la fuente. En `DemoEditorial` ganaba la carrera por caché del navegador | `useGoogleFont` espera `link.onload` (promesa compartida por hoja de estilos) y después pide cada peso en normal e itálica; timeout de 12 s como red de seguridad |
| La comprobación de fuentes daba "Inter no cargada" tras el arreglo | Falso negativo: en esta máquina `system-ui` resuelve a **Inter instalada en el sistema** (`fc-match system-ui`), así que fila y control eran iguales aunque la fuente de Google sí cargó | La fila de prueba usa `"<Familia>", serif` y el control `serif`: si la fuente no carga, ambas son DejaVu Serif y la diferencia es ~0. Ahora se comprueba fila a fila y se nombra la fuente que falla |
| `DemoEditorial`: 3.0 s estáticos entre el titular y el fundido | El estilo pide pausas largas, pero 3 s sin ningún cambio se siente muerto | Filete fino (`Accent`) que se dibuja despacio durante la pausa, movimiento firma del propio estilo; el enlace final entra con `Entrance` en vez de aparecer de golpe |
| `DemoVertical`: los wipes "up"/"down" se movían en horizontal | `SceneTransition` solo aplicaba `direction` a la variante `slide` | Wipe con `clip-path` en las cuatro direcciones |

## Ronda 3 → todo en verde
Resultado de `npm run probar -- --guias` (tabla copiada de `out/pruebas/REPORTE.md`):

RONDA3_TABLA

## Qué se verificó visualmente (hojas de contacto)
- **PruebaFuentes**: Inter 700, JetBrains Mono 500, Playfair Display 600 y DM Sans 400 cargadas (diferencia frente al control serif ≈ 17-24 en una escala 0-255).
- **DemoEditorial**: papel crema, etiqueta en versalitas letra a letra, titular Playfair con "despacio" en itálica terracota, filete que se dibuja, fundido a papel, foto en tarjeta con Ken Burns, cita en itálica, firma en versalitas, subrayado ocre del enlace.
- **DemoVertical** (con `--guias`): todo el texto dentro del 64 % central; los wipes suben y bajan; CTA quieta al final.
- **DemoCaptions**: una sola palabra resaltada por frame, líneas de 4 palabras, caja al 80 % sobre la foto, dentro de la zona segura.
- **CatalogoPatrones**: Entrance (3 propiedades), StaggerList numerada, TextReveal words/chars/typewriter, Highlight marker/underline/box, Ken Burns sobre `demo/foto.jpg`, BarChart con barra destacada, ProgressRing al 78 %, LogoReveal mask/wipe/scale con `demo/logo.png`, Parallax de 3 capas, Card con Breathe, TransitionSeries fade+slide, LowerThird + Counter + marco Accent. Fuentes Inter y JetBrains Mono cargadas (se distingue la mono en etiquetas).
- **DemoAudio**: anillo al máximo en los frames de beat, acentos en verde cada 2 s (beats 1, 5, 9, 13, 17), barra de progreso por beat. 20/20 beats, 120 bpm.
- **DemoMinimalTech**: la pieza original de 10 s (cascada, contador, rótulo, wipes).

## Cómo añadir una prueba
1. Crea `src/compositions/<Id>.tsx` con `meta` + `Component`.
2. `npm run manifest && npm run probar -- <Id>`.
3. Mira `out/pruebas/<Id>/contact-sheet.jpg`. Si algo falla, el arreglo va a `src/lib` (para que lo hereden todas las piezas) y la lección a la skill correspondiente.
