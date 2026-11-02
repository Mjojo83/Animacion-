# Recomendaciones: qué sirve de verdad para motion graphics con Claude (noviembre 2026)

Resumen de lo que revisé (plugins de tu catálogo de claude.ai, repos de GitHub, blogs) y mi criterio sobre qué instalar, qué ignorar y qué podría funcionar más adelante. Marco con ✅ lo que probé en este proyecto, con 📚 lo que viene de fuentes que leí y con 💡 ideas razonables que no he visto validadas.

## 1. La conclusión corta

Para animaciones de video con **texto, formas, gráficos y marca** (motion graphics de verdad), lo que funciona hoy es **código que un agente escribe y renderiza**, no modelos de video generativo. Dos motores dominan:

| Motor | Qué es | Licencia | Cuándo |
|---|---|---|---|
| **Remotion** | Video como componentes React; render con Chrome + ffmpeg; Studio con preview en vivo | Gratis para personas y empresas ≤3 personas; empresa mayor paga | Elegido para este proyecto. El ecosistema de skills para Claude es el más maduro. |
| **HyperFrames** (HeyGen) | Video como HTML/CSS sin build; render con Chrome + ffmpeg; pensado para agentes | Apache-2.0 | Si no quieres React, si tu empresa es grande y no quiere pagar licencia, o si partes de un sitio web (tiene `frame.md` para convertir un design system web en uno de video). |

Los "generadores de motion graphics con IA" que salen en rankings (Runway, Pika, Sora, Firefly…) generan **metraje**, no gráficos editables: la tipografía sale mal, el estilo no se mantiene entre piezas y no puedes corregir un frame. Sirven para B-roll, no para esto. 📚

## 2. Qué instalar (en orden)

### 2.1 Plugin oficial de Remotion ✅ imprescindible
Está en tu catálogo de claude.ai como **"Remotion"** (autor Remotion, 12 skills: best-practices, create, markup, render, studio, captions, multimedia, maps, interactivity, saas, upgrade, docs). Actívalo ahí, o en Claude Code:
```
/plugin marketplace add remotion-dev/claude-code-plugin
/plugin install remotion
```
o para cualquier agente: `npx skills add remotion-dev/skills`. Es lo que garantiza que el código Remotion sea correcto (API, timing, fuentes, render). 📚 ~6.1k estrellas, se actualiza con cada versión.

### 2.2 Este proyecto (motion-studio) ✅
Lo que el plugin oficial **no** trae: estilos con nombre aprendidos de referencias, componentes que leen tokens, crítica por frames contra las referencias, ejemplares y lecciones acumuladas. Se apoya en el plugin oficial para la API y pone el "gusto" encima.

### 2.3 Skills comunitarios de motion graphics (opcionales) 📚
- **haidrrrry/claude-remotion-skill** (MIT, ~770 estrellas): 17 patrones reutilizables (reveals, grain, Ken Burns, contadores, captions), 10 reglas de motion, y el mismo loop render → frames con ffmpeg → inspección → fix. Buen catálogo de ideas de movimiento. `npx skills add haidrrrry/claude-remotion-skill` o copiar la carpeta a `.claude/skills/`.
- **Liamrjohnston/remotion-motion-graphics-skill** (MIT, ~150 estrellas): enfoque "broadcast": intake de formato, crítico independiente que rechaza por debajo de 8/10, formatos de terminal demo y tarjetas editoriales. Su propio autor recomienda usarlo junto con el oficial. `npx skills add liamrjohnston/remotion-motion-graphics-skill`.
- En tu catálogo de claude.ai: **video-shotcraft** (recetas de planos cinematográficos para videos de producto con Remotion) y **animation-studio** (cortos "dibujados en código" con audio sintetizado). Útiles si haces videos de producto o piezas más narrativas; no son necesarios para empezar.

### 2.4 Herramientas de apoyo
- **ffmpeg** ✅: extracción de frames, hojas de contacto, conversión. Sin esto no hay revisión visual.
- **Playwright MCP con `--save-video`** 📚: para grabar pantallas/demos de software y meterlas en una composición (lo lista el Claude-Code-Video-Toolkit).
- **Manim** (Yusuke710/manim-skill) 📚: solo si haces explicativos matemáticos/científicos estilo 3Blue1Brown. Es otro mundo (Python); no mezclar con Remotion en la misma pieza.
- **Figma MCP** (viene con el plugin "Design" de Anthropic en tu catálogo) 💡: si diseñas en Figma, Claude puede leer los tokens exactos (colores, tipografías, espaciados) y volcarlos a `style.json`. Más fiel que inferirlos de capturas.

### 2.5 Lo que NO recomiendo (por ahora)
- Generadores de video por prompt para motion graphics con texto (ver arriba).
- Plugins de "diseño UI" (design-skills, Superdesign, Website Design): orientados a interfaces y landing pages, no a video.
- Codesign (IMG.LY): motor de diseño editable con exportación a video; interesante para plantillas de redes, pero es un ecosistema aparte con servidor MCP remoto. Pruébalo solo si necesitas InDesign/Photoshop/PDF además de video.

## 3. Por qué el "aprendizaje de estilos" está hecho así

No existe fine-tuning de Claude para esto, y aunque existiera, no es lo que quieres: quieres poder cambiar el estilo mañana. Lo que sí está demostrado en la práctica de la comunidad 📚 y en este proyecto ✅:

1. **Reglas escritas** (SKILL.md / STYLE.md): un write-up comunitario lo resume como "pon tus reglas de estilo en un SKILL.md y Claude carga el mismo look cada vez; la calidad depende de qué tan completas sean". Aquí las escribe Opus a partir de tus referencias, con salida estructurada validada (`style.json`) para que el código las consuma sin interpretación.
2. **Few-shot con código aprobado** (`exemplars/`): el modelo imita estructura y cadencia de piezas que ya te gustaron.
3. **Crítica visual con frames** (hoja de contacto + frames sueltos + referencias): es el patrón que usan los skills que mejor resultado muestran (render → ffmpeg → inspección → fix). Aquí además devuelve notas y fixes estructurados y acumula lecciones.
4. **Referencias en cada generación**: el modelo ve 4-6 imágenes del estilo junto al brief, no solo texto.

## 4. Ideas que podrían funcionar (siguientes pasos razonables) 💡

- **Sincronía con música**: detectar beats con ffmpeg (`ebur128`/`silencedetect`) o con `@remotion/media-utils` y pasarle al modelo una lista de tiempos; que las entradas caigan en los beats. Remotion ya tiene `useAudioData`/`visualizeAudio` para ondas.
- **Estilo desde un sitio web**: HyperFrames trae `frame.md` para convertir un `DESIGN.md` web en uno de video; lo mismo se puede hacer aquí pidiéndole a Opus que lea el CSS de tu web y rellene `style.json`.
- **Ilustraciones generadas**: generar assets (iconos, fondos, personajes) con un modelo de imagen con el mismo prompt de estilo y guardarlos en `public/`; Remotion los anima. Para B-roll fotográfico, un skill de Replicate con Seedance acepta referencias de estilo.
- **Lotes**: para 20 variantes (idiomas, formatos, datos), la API de Message Batches cuesta la mitad y Remotion renderiza con `--props` por variante.
- **Render en la nube**: Remotion Lambda cuando tengas decenas de videos por día; mientras tanto, tu máquina sobra.
- **Captions automáticos**: el skill oficial `remotion-captions` + Whisper para subtítulos con estilo del proyecto.
- **Un estilo por cliente/canal**: la estructura ya lo permite; lo que falta es disciplina de aprobar solo lo bueno.

## 5. Lo que verifiqué aquí y lo que no
- ✅ Instalación con npm, typecheck completo, render real de la composición demo con Chromium, extracción de 12 frames con etiquetas y hoja de contacto con ffmpeg.
- ⚠️ Las llamadas a Opus 5.5 (`estilo aprender`, `animar`, `revisar`) no las pude ejecutar en este entorno porque no hay clave de API. El código compila contra el SDK oficial `@anthropic-ai/sdk` 1.3 con la API actual (thinking adaptativo, `effort`, salida estructurada con zod, fallback de modelo, caché de prompt). La primera vez que lo corras en tu máquina, si algo falla, el mensaje de error dirá en qué llamada; mándamelo y lo ajusto.

## Fuentes
- [remotion-dev/skills (GitHub)](https://github.com/remotion-dev/skills)
- [Remotion: Claude Code plugin (docs)](https://www.remotion.dev/docs/ai/claude-code-plugin)
- [haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill)
- [Liamrjohnston/remotion-motion-graphics-skill](https://github.com/Liamrjohnston/remotion-motion-graphics-skill)
- [wilwaldon/Claude-Code-Video-Toolkit](https://github.com/wilwaldon/Claude-Code-Video-Toolkit)
- [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)
- [HeyGen open-sources HyperFrames (análisis)](https://themenonlab.blog/blog/heygen-hyperframes-video-as-code)
- [HyperFrames guide: how AI agents build videos in HTML](https://vidmuse.ai/blog/hyperframes-guide)
- [Yusuke710/manim-skill](https://github.com/Yusuke710/manim-skill)
- [Changroro/code-video (contact sheets, reference sheets)](https://github.com/Changroro/code-video/wiki)
- [Remotion Agent Skills Guide 2026](https://aividpipeline.com/blog/remotion-agent-skills-guide-2026)
- [Remotion + Claude Code: logo reveals y motion graphics](https://www.mindstudio.ai/blog/remotion-claude-code-animated-logo-reveals-motion-graphics)
- [Claude Code Video with Remotion: guía 2026](https://www.dplooy.com/blog/claude-code-video-with-remotion-best-motion-guide-2026)
- [Remotion: AI video generation with Claude Code 2026](https://o-mega.ai/articles/remotion-video-generation-with-ai-agents-claude-code-2026)
- [What is the Remotion skill? Install guide](https://www.ngram.com/blog/remotion-skills-sh-ai-video-creation)
- [Best AI motion graphics generators (HeyGen)](https://www.heygen.com/blog/best-ai-motion-graphics-generators)
- [Best AI motion graphics generators compared (Demotion)](https://trydemotion.com/blog/best-ai-motion-graphics-generators)
- [Best AI tools for motion designers 2026 (NopeCodes)](https://nopecodes.com/blog/best-ai-tools-for-motion-designers-2026)
- [AI animation generators 2026 (Exode)](https://www.exodeui.com/ai-animation-generator/)
- [Top 5 AI motion graphics tools 2026 (nagent)](https://nagent.ai/resources/blog/top-5-ai-motion-graphics-tools-in-2026)
- [Replicate video skill (Seedance, referencias de estilo)](https://github.com/Bomx/replicate-video-skill)
- [Claude video: JavaScript free (chaseai)](https://chaseai.io/blog/claude-video-javascript-free)
- [Generate AI videos with Claude Code, HyperFrames y ElevenLabs](https://www.mindstudio.ai/blog/generate-ai-videos-claude-code-hyperframes-elevenlabs/)
- [Licencia de Remotion](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
