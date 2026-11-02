---
description: Renderiza una composición, extrae frames y la critica contra su estilo (con fixes concretos)
argument-hint: <Id> [--fix]
allowed-tools: Bash(npm run:*), Bash(npx remotion:*), Bash(npx tsc:*), Bash(ffmpeg:*), Bash(ffprobe:*), Read, Write, Edit, Glob
---
Revisa la composición **$ARGUMENTS** contra su estilo.

Si hay `ANTHROPIC_API_KEY` en `.env`, la vía rápida es `npm run revisar -- $ARGUMENTS` (añade `--fix` si el usuario lo pidió) y después leer `out/<Id>/review-1/critique.md` para resumir.

Si no, hazlo tú (usa el subagente `critico-motion` para la crítica, así la hace alguien que no escribió el código):
1. Lee `meta.style` en `src/compositions/<Id>.tsx` y carga el estilo (STYLE.md, style.json, lessons.md).
2. Renderiza: `npx remotion render src/index.ts <Id> out/<Id>/<Id>.mp4 --scale=0.5`.
3. Extrae 12 frames repartidos con etiqueta de frame: para i en 0..11, t = dur·(i+0.5)/12, `ffmpeg -y -ss <t> -i out/<Id>/<Id>.mp4 -frames:v 1 -vf "scale=1280:-2,drawtext=text='f<frame> <t>s':x=14:y=14:fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6" out/<Id>/frames/f-<i>.jpg`.
4. Pide al subagente `critico-motion` que mire los frames, 3-4 referencias y el código, y devuelva: notas 0-10 (estilo, movimiento, tipografía, composición, legibilidad, global), veredicto approve/revise, issues con frame + fix concreto, y lecciones para el estilo.
5. Si el usuario pasó `--fix` y el veredicto es revise: aplica los fixes en el código, `npm run typecheck`, re-renderiza y repite la crítica una vez más.
6. Guarda la crítica en `out/<Id>/critique.md` y resúmela al usuario. Si es approve, sugiere `/aprobar <Id>`.
