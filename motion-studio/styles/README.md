# styles/

Cada carpeta es un estilo con nombre. Estructura:

```
styles/<nombre>/
├── style.json      # tokens exactos (colores, fuentes, easing, duraciones, reglas). Fuente de verdad.
├── STYLE.md        # guía en prosa: esencia, cómo se ve, cómo se mueve, estructura típica.
├── notes.md        # tus notas en tu idioma; Opus las lee al aprender.
├── lessons.md      # lo que se va aprendiendo pieza a pieza (lo añade la revisión o tú).
├── references/     # tus imágenes y videos de referencia (de los videos se extraen frames).
│   ├── _frames/    # frames extraídos (auto, ignorado por git)
│   └── _cache/     # imágenes normalizadas para la API (auto, ignorado por git)
└── exemplars/      # composiciones .tsx aprobadas en este estilo: sirven de ejemplo a Opus.
```

Cómo "aprende" Opus un estilo (no hay fine-tuning; es destilación + ejemplos + crítica):

1. `estilo aprender` manda las referencias a Opus 5.5 con visión y le pide
   `style.json` + `STYLE.md` estructurados.
2. `animar` le pasa ese estilo, las lecciones, los ejemplares aprobados y
   algunas referencias al generar la composición.
3. `revisar` renderiza, extrae frames y le pide a Opus que compare contra las
   referencias y puntúe. Al aprobar, la pieza pasa a `exemplars/` y las
   lecciones a `lessons.md`. La siguiente pieza sale mejor.
