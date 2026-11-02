---
description: Analiza las referencias de un estilo y escribe style.json + STYLE.md (aprendizaje del estilo)
argument-hint: <nombre-del-estilo>
allowed-tools: Bash(npm run:*), Bash(npx tsx:*), Bash(ffmpeg:*), Bash(ffprobe:*), Read, Write, Edit, Glob
---
Aprende el estilo **$ARGUMENTS** a partir de `styles/$ARGUMENTS/references/`.

Hay dos caminos. Elige el primero si hay `ANTHROPIC_API_KEY` en `.env`; si no, el segundo.

**A. Con la CLI (salida estructurada, recomendado):**
`npm run estilo -- aprender $ARGUMENTS`. Luego lee `styles/$ARGUMENTS/STYLE.md` y `style.json`, resume al usuario en 6-8 líneas qué se detectó (paleta, tipografía, tempo, movimientos firma, doNot) y pregunta si quiere ajustar algo.

**B. Tú mismo, con visión:**
1. Lista `styles/$ARGUMENTS/references/`. Para cada video extrae 6 frames repartidos con ffmpeg a `references/_frames/<video>/` (p. ej. `ffmpeg -ss <t> -i <video> -frames:v 1 -vf scale=1280:-2 <out>.jpg`).
2. Mira TODAS las imágenes con Read. Lee `notes.md` si existe (tiene prioridad sobre tu interpretación).
3. Escribe `styles/$ARGUMENTS/style.json` siguiendo exactamente el esquema de `src/lib/style-schema.ts` (todos los campos; usa `null` donde el esquema lo permita). Colores hex reales, fuentes de Google Fonts parecidas, easings cubic-bezier, duraciones en frames a 30 fps, lista `doNot` concreta.
4. Escribe `styles/$ARGUMENTS/STYLE.md` con las secciones: Esencia · Cómo se ve · Cómo se mueve · Estructura típica de una pieza (guion por frames de 10 s) · Lo que nunca hace · Qué aportó cada referencia.
5. Valida: `npx tsx -e "import('./src/lib/style-schema.ts').then(m=>console.log(m.StyleSchema.parse(JSON.parse(require('fs').readFileSync('styles/$ARGUMENTS/style.json','utf8'))).name))"`.
6. Resume al usuario lo detectado y pregunta si quiere ajustar algo.
