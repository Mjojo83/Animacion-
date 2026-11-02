---
description: Genera una composición Remotion en un estilo con nombre a partir de un brief
argument-hint: <estilo> "<brief>" [--formato 9:16] [--duracion 15]
allowed-tools: Bash(npm run:*), Bash(npx remotion:*), Bash(npx tsc:*), Bash(ffmpeg:*), Bash(ffprobe:*), Read, Write, Edit, Glob, Grep
---
Crea una pieza de motion graphics: **$ARGUMENTS**

El primer argumento es el estilo (carpeta en `styles/`), el resto es el brief; `--formato` (16:9 por defecto) y `--duracion` (10 s por defecto) son opcionales.

Pasos (no te saltes ninguno):
1. Lee completos `styles/<estilo>/STYLE.md`, `style.json`, `lessons.md` y hasta 2 archivos de `exemplars/`. Mira 3-6 referencias de `references/` (o `references/_frames/`) con Read.
2. Lee `src/compositions/DemoMinimalTech.tsx` como plantilla del contrato (`meta` + `Component`, import del `style.json`, `useStyle` + `useStyleFonts`, componentes de `src/lib/components`).
3. Escribe el **guion por frames** (escenas, qué entra, qué sale, pausas) y muéstraselo al usuario en 5-8 líneas antes de codificar.
4. Escribe `src/compositions/<Id>.tsx` (Id en PascalCase derivado del brief). Usa los tokens del estilo para todo: colores, fuentes, duraciones (`st.d.*`), easings (`st.eases.*`), margen (`SafeArea`). Respeta `doNot`.
5. `npm run manifest && npm run typecheck`. Corrige hasta que no haya errores.
6. Renderiza a media escala y mira frames: `npx remotion render src/index.ts <Id> out/<Id>/<Id>.mp4 --scale=0.5` y luego extrae 8 frames repartidos con ffmpeg y míralos con Read. Compara mentalmente con las referencias. Si algo no es del estilo o no se lee, corrígelo y vuelve a renderizar.
7. Termina diciendo: ruta del archivo, qué decisiones tomaste a favor del estilo, y cómo verlo (`npm run studio`) y renderizarlo en calidad final.
