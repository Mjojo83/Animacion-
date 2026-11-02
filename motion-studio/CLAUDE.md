# motion-studio

Motion graphics en código (Remotion) con **estilos con nombre** que se aprenden de referencias. Modelo de trabajo: **Claude Opus 5.5** (fijado en `.claude/settings.json`; cámbialo con `/model` si quieres).

## Qué hay aquí
- `styles/<nombre>/` → un estilo: `style.json` (tokens, fuente de verdad), `STYLE.md` (guía en prosa), `notes.md` (notas del usuario), `lessons.md` (lo aprendido), `references/` (imágenes y videos), `exemplars/` (piezas aprobadas).
- `src/lib/` → helpers y componentes que leen los tokens del estilo: `useStyle`, `useStyleFonts`, `TextReveal`, `Background`, `SafeArea`, `Accent`, `LowerThird`, `Counter`, `SceneTransition`, y utilidades `progress`, `springIn`, `staggerStart`, `sec`.
- `src/compositions/<Id>.tsx` → cada video. Exporta `meta` y `Component`. `manifest.ts` se regenera con `npm run manifest`.
- `cli/` → la misma lógica como CLI con la API (`npm run estilo`, `npm run animar`, `npm run revisar`, `npm run ms -- render`). Úsala cuando el usuario quiera automatizar fuera de Claude Code.
- `.claude/commands/` → `/estilo-nuevo`, `/estilo-aprender`, `/animar`, `/revisar`, `/aprobar`.

## Reglas al animar (siempre)
1. Lee **completo** `styles/<nombre>/STYLE.md`, `style.json`, `lessons.md` y, si existen, 1-2 archivos de `exemplars/` antes de escribir una sola línea.
2. Mira las referencias con la herramienta Read (son imágenes; de los videos, los frames en `references/_frames/` o extráelos con ffmpeg).
3. Respeta la lista `doNot` del estilo por encima del brief. Si chocan, resuelve a favor del estilo y dilo.
4. Escribe primero el guion por frames en un comentario; después el código.
5. Usa los helpers de `src/lib` y los tokens (`st.d.short`, `st.eases.out`, `st.s.palette.*`): nada de valores mágicos que no vengan del estilo.
6. Todo movimiento es función del frame (`useCurrentFrame`). Prohibido: CSS transitions/animations, timers, `Math.random`.
7. Texto siempre dentro del `SafeArea`; tamaños relativos a `height`/`width`.
8. Tras escribir: `npm run manifest && npm run typecheck`. Luego renderiza y **mira los frames** antes de dar por terminado (ver `/revisar`).

## Comandos útiles
- `npm run studio` → Remotion Studio (preview en vivo en el navegador).
- `npx remotion render src/index.ts <Id> out/<Id>.mp4` → render.
- `ffmpeg -ss 2.5 -i out/<Id>.mp4 -frames:v 1 out/f.jpg` → un frame para mirarlo con Read.
- `npm run revisar -- <Id> --fix` → loop completo render → frames → crítica → corrección con la API.

## Skills del proyecto
- `estilos-motion`: cómo funciona el sistema de estilos y cómo cargarlo.
- `principios-motion`: principios de motion design para animación en código.
- `revision-frames`: cómo revisar una pieza mirando frames y qué puntuar.

Si el plugin oficial de Remotion está instalado (`/remotion-best-practices`, `/remotion-markup`…), úsalo para dudas de API. Las reglas de arriba mandan sobre el estilo visual.
