---
name: revision-frames
description: Procedimiento para revisar una composición renderizada mirando sus frames (render a media escala, extracción con ffmpeg, hoja de contacto, rúbrica de 0-10 y formato de issues con fix). Úsalo al revisar, criticar, aprobar o corregir una pieza, o cuando el usuario pregunte "¿cómo quedó?".
---

# Revisión por frames

## Por qué
Un modelo no ve el video; ve frames. Revisar sin mirar frames es adivinar. El loop render → frames → crítica → corrección es lo que separa "generado" de "entregable".

## Procedimiento
1. Render rápido: `npx remotion render src/index.ts <Id> out/<Id>/<Id>.mp4 --scale=0.5`.
2. Frames: 12 repartidos con etiqueta (frame y segundo) con ffmpeg (`drawtext`). Con la CLI: `npm run revisar -- <Id>` lo hace y además arma `contact-sheet.jpg`.
3. Mirar con Read: primero la hoja de contacto (ritmo y continuidad), después 4-6 frames sueltos (detalle: tipografía, bordes, fuente cargada).
4. Comparar con 3-4 referencias del estilo abiertas en la misma sesión.
5. Escribir la crítica en el formato de abajo.

## Rúbrica (0-10)
- **Estilo**: ¿parece del mismo estudio que las referencias? Paleta, tipografía, densidad, tempo, movimientos firma, `doNot`.
- **Movimiento**: entradas/salidas limpias, cadencia, nada cortado, nada flotando sin intención.
- **Tipografía**: jerarquía, tamaños, tracking, dos líneas máximo, fuente correcta.
- **Composición**: espacio, márgenes, equilibrio, foco único.
- **Legibilidad**: todo se lee el tiempo suficiente y con contraste.
- **Global**: no es promedio; pesa lo que más importa para esa pieza.
Escala: 9-10 excelente · 8 entregable · 6-7 "se nota que es generado" · < 6 rehacer.

## Formato de issue
`[severidad] f<frame>: <qué está mal> → fix: <qué cambiar, en qué componente/línea, a qué valor>`
El fix debe poder aplicarlo alguien sin volver a preguntar.

## Veredicto
`approve` solo si global ≥ 8 y no hay issues high. Si approve: proponer `/aprobar <Id>` (guarda ejemplar + lecciones).

## Lecciones
Extraer 0-4 reglas **generalizables al estilo** (no a la pieza), p. ej. "en 9:16 los titulares de este estilo funcionan a 0.06 del alto". Van a `styles/<estilo>/lessons.md`.
