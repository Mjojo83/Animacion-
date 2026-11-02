---
description: Crea un estilo nuevo con nombre (carpeta en styles/) y explica qué referencias subir
argument-hint: <nombre-del-estilo>
allowed-tools: Bash(npm run:*), Bash(npx tsx:*), Read, Write
---
Crea el estilo **$ARGUMENTS** ejecutando `npm run estilo -- nuevo $ARGUMENTS`.

Después:
1. Pregunta al usuario (en una sola pregunta corta) para qué tipo de videos es el estilo, qué formatos usará (16:9, 9:16…) y qué marcas/estudios le sirven de referencia.
2. Escribe sus respuestas en `styles/$ARGUMENTS/notes.md`.
3. Dile que copie entre 4 y 20 imágenes o videos en `styles/$ARGUMENTS/references/` y que luego corra `/estilo-aprender $ARGUMENTS`.
