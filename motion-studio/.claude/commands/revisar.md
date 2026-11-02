---
description: Renderiza una composición, extrae frames y la critica contra su estilo (con fixes concretos)
argument-hint: <Id> [--fix]
allowed-tools: Bash(npm run:*), Bash(npx remotion:*), Bash(npx tsc:*), Bash(ffmpeg:*), Bash(ffprobe:*), Read, Write, Edit, Glob
---
Revisa la composición **$ARGUMENTS** contra su estilo.

Si hay `ANTHROPIC_API_KEY` en `.env`, la vía rápida es `npm run revisar -- $ARGUMENTS` (añade `--fix` si el usuario lo pidió) y después leer `out/<Id>/review-1/critique.md` para resumir.

Si no, hazlo tú (usa el subagente `critico-motion` para la crítica, así la hace alguien que no escribió el código):
1. Lee `meta.style` en `src/compositions/<Id>.tsx` y carga el estilo (STYLE.md, style.json, lessons.md).
2. `npm run probar -- <Id>`: renderiza a media escala, extrae 8 frames etiquetados y arma `out/pruebas/<Id>/contact-sheet.jpg` (más comprobaciones automáticas de duración, tramos estáticos y movimiento inicial).
3. Si necesitas más detalle en un momento concreto: `npx remotion still src/index.ts <Id> out/f.png --frame=<n>`.
4. Pide al subagente `critico-motion` que mire los frames, 3-4 referencias y el código, y devuelva: notas 0-10 (estilo, movimiento, tipografía, composición, legibilidad, global), veredicto approve/revise, issues con frame + fix concreto, y lecciones para el estilo.
5. Si el usuario pasó `--fix` y el veredicto es revise: aplica los fixes en el código, `npm run typecheck`, re-renderiza y repite la crítica una vez más.
6. Guarda la crítica en `out/<Id>/critique.md` y resúmela al usuario. Si es approve, sugiere `/aprobar <Id>`.
