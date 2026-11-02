---
name: captions
description: Subtítulos y captions sincronizados por palabra en Remotion: formato de entrada (Whisper/JSON/SRT), el componente Captions de este proyecto (modo karaoke o pop, líneas de 3-4 palabras, zona segura), cómo transcribir audio y cómo validar la sincronía. Úsala cuando el brief incluya subtítulos, captions, "palabra por palabra" o video hablado.
---

# Captions por palabra

Verificado con `DemoCaptions` (9:16): 22 palabras sintéticas en modo karaoke, 4 por línea, en el 66 % del alto.

## Formato de entrada
```ts
type CaptionWord = { text: string; start: number; end: number }; // segundos
```
- **Whisper** (`whisper.cpp`, `@remotion/install-whisper-cpp`, OpenAI API con `timestamp_granularities=["word"]`) devuelve palabras con `start/end`: mapea directo.
- **SRT**: parsea con `@remotion/captions` (`parseSrt`) → `Caption[]` con `startMs/endMs` → divide en ms/1000. Para karaoke real hace falta nivel palabra; un SRT por frase se muestra como "pop" de la línea.
- Sintéticas para maquetar: `text.split(" ").map((w,i)=>({text:w,start:0.6+i*0.36,end:0.6+i*0.36+0.34}))`.

## El componente
```tsx
import { Captions } from "../lib/components";
<Captions style={st} words={words} maxWords={4} mode="karaoke" size={0.042} y={0.66} />
```
- `mode="karaoke"`: la línea entera visible, la palabra activa en color de acento con un pequeño pop. Mejor para voz continua.
- `mode="pop"`: cada palabra aparece al hablarse. Mejor para frases cortas y ritmo marcado.
- Las líneas se cortan por `maxWords` o por silencios > 0.7 s.
- `y` es la posición vertical (fracción del alto). En 9:16 usa 0.62-0.70 (fuera del 18 % inferior); en 16:9, 0.78-0.82.
- `box` pinta un fondo del color de fondo del estilo al 80 %: déjalo si hay imagen debajo.

## Reglas de legibilidad
- 3-4 palabras por línea en vertical, 5-6 en horizontal.
- Tamaño 4-4.5 % del alto en 9:16; 3-3.5 % en 16:9.
- Fuente display del estilo en peso ≥ 600; nunca itálicas para captions.
- Una palabra activa a la vez; evita animar la línea entera.

## Alternativa oficial
El skill de Remotion recomienda el elemento **Basic Captions** (`@remotion/captions`, copiar `basic-captions.tsx` del sitio de Remotion) con el array inline en `captions={[...]}` para que el editor de captions del Studio pueda escribir en él. Úsalo si editarás los textos en Studio; usa `Captions` de aquí si quieres que sigan el estilo automáticamente.

## Validar
`npm run probar -- DemoCaptions` y mira la hoja de contacto: la palabra resaltada debe cambiar entre frames consecutivos y nunca haber dos resaltadas. Para una pieza real: `npx remotion still … --frame=<round(start*fps)+1>` en 3 palabras distintas.
