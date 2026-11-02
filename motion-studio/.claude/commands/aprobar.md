---
description: Marca una composición como ejemplar del estilo y guarda las lecciones aprendidas
argument-hint: <Id> [lección opcional]
allowed-tools: Bash(cp:*), Bash(npm run:*), Read, Write, Edit
---
Aprueba la composición **$ARGUMENTS** como ejemplar de su estilo.

1. Lee `meta.style` en `src/compositions/<Id>.tsx`.
2. Copia el archivo a `styles/<estilo>/exemplars/<Id>.tsx`.
3. Si existe `out/<Id>/critique.md` o `out/<Id>/review-*/critique.md`, toma sus "lecciones" y añádelas a `styles/<estilo>/lessons.md` como viñetas con fecha y el Id. Si el usuario escribió una lección en el argumento, añádela también.
4. Si hay más de 4 ejemplares, sugiere al usuario cuáles conservar (los 3-4 más distintos entre sí): demasiados ejemplares diluyen el contexto.
5. Confirma en 2 líneas qué se guardó.
