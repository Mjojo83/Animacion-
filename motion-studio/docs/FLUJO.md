# Flujo de trabajo

## Mapa

```
┌──────────────────────┐    estilo aprender     ┌──────────────────────────┐
│ styles/x/references/ │ ─────────────────────► │ style.json + STYLE.md    │
│ (imágenes, videos)   │   Opus 5.5 + visión    │ (tokens + guía en prosa) │
└──────────────────────┘                        └────────────┬─────────────┘
          ▲                                                  │
          │ se envían 4-6 refs                               │ se envía completo
          │ en cada generación                               ▼
┌─────────┴────────────┐       animar           ┌──────────────────────────┐
│ brief del usuario    │ ─────────────────────► │ src/compositions/Id.tsx  │
│ + formato + duración │   Opus 5.5 escribe     │ (Remotion, React)        │
└──────────────────────┘   + tsc corrige        └────────────┬─────────────┘
                                                             │ remotion render
                                                             ▼
┌──────────────────────┐       revisar          ┌──────────────────────────┐
│ critique.json / .md  │ ◄───────────────────── │ out/Id/Id.mp4 + 12 frames│
│ notas, issues, fixes │   Opus 5.5 compara     │ + hoja de contacto       │
└─────────┬────────────┘   frames vs refs       └──────────────────────────┘
          │ --fix: reescribe y re-renderiza (hasta N rondas)
          │ --aprobar: copia a exemplars/ y lecciones a lessons.md
          ▼
┌──────────────────────┐
│ styles/x/exemplars/  │  ← la siguiente pieza se genera con estos ejemplos
│ styles/x/lessons.md  │
└──────────────────────┘
```

## Qué recibe Opus en cada paso

**Aprender** (`client.messages.parse`, salida estructurada validada con zod):
- hasta 20 imágenes normalizadas (≤1568 px): tus imágenes + 6 frames por video
- `notes.md` (prioridad sobre la interpretación)
- el `style.json` anterior si existe (para mejorar, no partir de cero)

**Animar** (streaming, `effort: high`, fallback de modelo activo):
- sistema: rol de director de motion + reglas de Remotion + **código fuente real de `src/lib`** (en caché de prompt)
- `STYLE.md`, `style.json`, `notes.md`, `lessons.md`, hasta 2 ejemplares
- 6 referencias visuales
- brief + Id + formato + fps + duración
- si `tsc` falla: los errores, hasta 2 rondas

**Revisar** (`messages.parse`, salida estructurada):
- guía del estilo + lecciones
- 4 referencias
- hoja de contacto (12 frames etiquetados) + 6 frames sueltos grandes
- el código de la pieza
→ notas 0-10, veredicto, issues con fix accionable, lecciones generalizables

## Cuándo usar la CLI y cuándo Claude Code

| | CLI (`npm run …`) | Claude Code (`/animar` …) |
|---|---|---|
| Autenticación | clave de API | tu suscripción |
| Salida estructurada (zod) | sí | no (texto) |
| Iteración conversacional | no | sí: "hazlo más lento", "cambia el titular" |
| Automatizable (scripts, lotes) | sí | menos |
| Skills de Remotion oficiales | no aplican | sí, si los instalas |
| Recomendación | aprender estilos, lotes, revisión reproducible | crear y pulir piezas una a una |

Los dos usan los mismos archivos de `styles/`, así que puedes mezclar: aprender con la CLI, animar en Claude Code, revisar con la CLI.

## Consejos que marcan la diferencia

1. **Referencias**: mejor 8 muy claras que 30 mezcladas. Si tienes videos, mejor que imágenes: de ellos salen frames con movimiento a medio hacer.
2. **notes.md**: dos líneas tuyas valen más que diez referencias ambiguas. Di qué NO quieres.
3. **Edita STYLE.md** después de aprender. Es texto; corregir una frase ahí mejora todas las piezas siguientes.
4. **Aprueba solo lo que de verdad te gusta**: los ejemplares son el few-shot más potente del sistema. Tres buenos > diez regulares.
5. **Mira los frames**. Siempre. El modelo no ve el video; ve frames. Tú también deberías revisar la hoja de contacto en `out/<Id>/review-1/`.
6. **Audio**: pon la música en `public/` y pide en el brief "con `<Audio src={staticFile('tema.mp3')} />` y acentos en los beats a 0.5 s, 1.2 s…". El tempo del estilo debería salir de la música.
