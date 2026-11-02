---
name: depurar-render
description: Diagnóstico de renders de Remotion que fallan o salen mal (Chrome no encontrado, delayRender timeout, fuentes que no cargan, audio ausente, frames negros, elementos cortados, manifest desactualizado, errores de tipos, lentitud). Úsala cuando `remotion render`, `npm run probar` o `npm run revisar` fallen o el resultado no coincida con lo esperado.
---

# Depurar un render

Orden de comprobación: **1) compila → 2) renderiza → 3) se ve bien**. No saltes niveles.

## 1. No compila / no aparece la composición
| Síntoma | Causa | Arreglo |
|---|---|---|
| `Composition with ID "X" not found` | No está en `src/compositions/manifest.ts` | `npm run manifest` (lo regenera a partir de los archivos que exportan `meta` y `Component`) |
| Error de tipos al importar `style.json` | El JSON ensancha los enums a `string` | Pásalo por `useStyle(style)`/`asStyle(style)` (validan con zod); no tipes el import a mano |
| `Cannot find module '@remotion/x'` | Paquete no instalado | `npx remotion add @remotion/x` (misma versión que `remotion`) |
| Versiones distintas entre `remotion` y `@remotion/*` | Instalación manual con `^` | `npx remotion upgrade` o fija todas a la misma versión exacta |

## 2. El render falla
| Síntoma | Causa | Arreglo |
|---|---|---|
| Descarga de Chrome falla / sin red / sandbox | Remotion no puede bajar Chrome Headless Shell | `REMOTION_BROWSER_EXECUTABLE=/ruta/a/chrome` en `.env` (lo aplica `remotion.config.ts`) o `--browser-executable=`. Playwright suele tener uno en `/opt/pw-browsers` o `~/.cache/ms-playwright` |
| `Old Headless mode has been removed` | Chrome completo muy nuevo | Usa el `headless_shell` (Playwright lo trae como `chromium_headless_shell-*/chrome-linux/headless_shell`) o deja que Remotion baje el suyo |
| `A delayRender() was called but not cleared after 28000ms` | Fuente, imagen o fetch que nunca termina | Fuentes: `useStyleFonts` ya tiene timeout de 8 s. Imágenes: comprueba la ruta en `public/` (`staticFile("demo/foto.jpg")` → `public/demo/foto.jpg`). Fetch: usa `calculateMetadata` |
| `ENOSPC` o render muy lento | Concurrencia alta en poca RAM | `--concurrency=2` o `Config.setConcurrency(2)`; renderiza a `--scale=0.5` mientras iteras |
| Timeout en `probar`/`revisar` | Composición muy larga | Prueba con `--scale=0.5`, o renderiza solo frames: `npx remotion render … --frames=0,60,120 --image-format=png` |

## 3. Renderiza pero se ve mal
| Síntoma | Causa probable | Cómo confirmarlo | Arreglo |
|---|---|---|---|
| Tipografía de sistema en vez de la del estilo | La fuente no cargó (sin red, nombre mal escrito, peso no disponible) o se pidió antes de que el CSS de Google llegara (`document.fonts.load` resuelve vacío si aún no existe la FontFace) | `npm run probar -- PruebaFuentes` compara cada fila con un control `serif` y nombra la fuente que falla | Comprueba el nombre exacto en Google Fonts y que el peso exista; `googleFont: true` en `style.json`. Si escribes tu propio cargador, espera `link.onload` antes de `fonts.load()` (así lo hace `useGoogleFont`) |
| La comprobación de fuentes dice que no cargó pero se ve bien | La fuente también está instalada en el sistema (p. ej. Inter) y el control la usa | `fc-match system-ui` | Por eso el control de `PruebaFuentes` es `serif`, no `system-ui` |
| Elementos cortados por el borde | Texto fuera del margen o `fontSize` fijo | Mira la hoja de contacto | Envuelve en `<SafeArea>`, `maxWidth`, tamaños relativos a `height` |
| Un elemento aparece antes de tiempo o no se va | Falta `clamp` o falta `exitAt` | Frame anterior al `start` lo muestra | `extrapolateLeft/Right: "clamp"`; usa `exitAt` |
| Todo entra a la vez / se ve "generado" | Sin cascada ni jerarquía | Hoja de contacto: todos los elementos en el mismo frame | `staggerStart`, `StaggerList`, una idea por escena |
| Frames negros al inicio o final | Fondo no cubre, o transición cubre de más | Frame 0 y último | `<Background>` como raíz; revisa `SceneTransition at` |
| Tramos estáticos largos | Escena sin cambios > 2.5 s | `npm run probar` lo marca con "estático" | Añade `Breathe`, un contador, una línea que crece, o acorta la escena |
| Audio no suena en el mp4 | `<Audio>` de `remotion` en vez de `@remotion/media`, o ruta mala | `ffprobe out/x.mp4` muestra si hay stream de audio | `import { Audio } from "@remotion/media"` + `staticFile` |
| Grano invisible sobre fondo claro | `mixBlendMode: overlay` sobre claro | Frame | `dark={false}` en `<Grain>` (usa `multiply`) |
| Texto grande con huecos raros entre palabras | `gap`/`margin` en `em` | Inspección | Usa px: `gap: 24 * st.scale` |
| Parpadeo entre frames | `Math.random` o Date.now() | Dos frames consecutivos distintos sin razón | `random("semilla")` de remotion |

## 4. Herramientas de diagnóstico que ya existen aquí
- `npm run ms -- doctor`: Node, ffmpeg, dependencias, credenciales.
- `npm run probar -- <Id>`: render rápido + 8 frames + hoja de contacto + comprobaciones (duración, estático, movimiento inicial, fuentes, beats).
- `npm run probar -- --guias`: `DemoVertical` con las zonas de interfaz de Reels dibujadas.
- `npx remotion still src/index.ts <Id> out/f.png --frame=N`: un frame exacto para mirarlo con Read.
- `ffprobe -v error -show_streams out/x.mp4`: comprobar audio, tamaño, fps.
- Studio: `npm run studio`, reproduce a 0.25x para ver fallos de easing.

## 5. Cuando nada de lo anterior aplica
Renderiza solo el rango sospechoso (`--frames=100-130`), aísla el componente en una composición mínima y bisecciona. Y lee el error completo: Remotion casi siempre dice el componente y el frame.
