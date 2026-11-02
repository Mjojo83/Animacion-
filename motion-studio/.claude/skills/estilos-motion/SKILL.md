---
name: estilos-motion
description: Cómo funciona el sistema de estilos con nombre de motion-studio (styles/<nombre>): qué archivos tiene, cómo cargarlos en una composición Remotion, cómo "aprende" Opus un estilo de referencias y cómo mantenerlo. Úsalo siempre que se cree, aprenda, consulte o aplique un estilo, o cuando una pieza deba "parecerse a" unas referencias.
---

# Sistema de estilos

Un estilo es una carpeta `styles/<nombre>/` y es la unidad de memoria visual del proyecto. No hay fine-tuning: Opus "aprende" un estilo por **destilación + ejemplares + crítica**.

## Archivos
| Archivo | Quién lo escribe | Para qué |
|---|---|---|
| `style.json` | Opus (`estilo aprender`) o a mano | Tokens exactos. Esquema en `src/lib/style-schema.ts`. **Fuente de verdad.** |
| `STYLE.md` | Opus o a mano | Esencia, cómo se ve, cómo se mueve, estructura típica, lo que nunca hace, qué aportó cada referencia. |
| `notes.md` | El usuario | Intención en sus palabras. Tiene prioridad sobre la interpretación de las referencias. |
| `lessons.md` | Revisión aprobada o el usuario | Reglas reutilizables descubiertas pieza a pieza. Se leen SIEMPRE antes de animar. |
| `references/` | El usuario | Imágenes y videos. `_frames/` y `_cache/` son automáticos. |
| `exemplars/` | `/aprobar` o `revisar --aprobar` | Composiciones aprobadas. Son few-shot: 2 bastan; más de 4 diluyen. |

## Cómo se usa en una composición
```tsx
import style from "../../styles/<nombre>/style.json";
import { useStyle } from "../lib/style";
import { useStyleFonts } from "../lib/fonts";

const st = useStyle(style);   // { s, eases, d, margin, scale, fonts }
useStyleFonts(style);         // carga Google Fonts y espera
// st.s.palette.primary · st.d.short (frames ya ajustados al fps) · st.eases.out · st.margin
```
Todos los componentes de `src/lib/components` reciben `style={st}` y sacan de ahí colores, easings, duraciones y márgenes. No hay que pasar valores sueltos.

## Reglas de fidelidad
1. `doNot` manda sobre el brief.
2. Los movimientos firma (`motion.signatureMoves`) deben aparecer al menos una vez en cada pieza si la duración lo permite.
3. Paleta: no introducir colores que no estén en `palette`. Si hace falta un matiz, derivarlo con opacidad.
4. Tipografía: solo las familias de `typography`. Tamaños según `scaleHint`.
5. Tempo: `durations` y `staggerFrames` son la cadencia; cambiarlos solo si `lessons.md` lo pide.

## Mantener un estilo
- Para re-aprender con más referencias: añade archivos a `references/` y corre `estilo aprender` de nuevo (guarda `style.prev.json` y `STYLE.prev.md`).
- Para corregir algo puntual: edita `style.json`/`STYLE.md` a mano y anota el porqué en `lessons.md`.
- Un estilo por carpeta: no mezcles dos looks en el mismo estilo; crea otro (`estilo nuevo`).
