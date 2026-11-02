# motion-studio

Motion graphics para video **escritos en código** (Remotion) por **Claude Opus 5.5**, con un sistema de **estilos con nombre**: le subes referencias (imágenes y videos), Opus las destila en un estilo, y a partir de ahí anima con ese estilo, se autocritica mirando los frames renderizados y mejora pieza a pieza.

Todo corre **en tu computadora**: Node 22, ffmpeg y tu clave de Anthropic (o Claude Code). Nada en la nube salvo las llamadas al modelo.

```
brief + estilo ──► Opus 5.5 escribe la composición Remotion ──► render ──► frames
                        ▲                                                   │
                        └────── crítica de Opus (notas, issues, fixes) ◄────┘
```

## Qué puedes hacer

| Quiero… | Comando |
|---|---|
| Crear un estilo nuevo | `npm run estilo -- nuevo mi-estilo` |
| Que Opus aprenda el estilo de mis referencias | `npm run estilo -- aprender mi-estilo` |
| Generar un video en ese estilo | `npm run animar -- mi-estilo "intro de 10 s para mi podcast" --formato 9:16` |
| Verlo en vivo y retocarlo | `npm run studio` |
| Que Opus lo critique mirando los frames y lo corrija | `npm run revisar -- <Id> --fix` |
| Guardarlo como ejemplo del estilo (para que la siguiente pieza salga mejor) | `npm run revisar -- <Id> --no-render --aprobar` |
| Renderizar en calidad final | `npm run ms -- render <Id>` |

Lo mismo desde **Claude Code** (sin clave de API, con tu suscripción): `/estilo-nuevo`, `/estilo-aprender`, `/animar`, `/revisar`, `/aprobar`.

## Instalación (10 minutos)

### 1. Requisitos
- **Node.js 22 o superior**: https://nodejs.org (LTS).
- **ffmpeg** (para extraer frames de videos y armar hojas de contacto):
  - macOS: `brew install ffmpeg`
  - Windows: `winget install Gyan.FFmpeg` (o `choco install ffmpeg`)
  - Ubuntu/Debian: `sudo apt install ffmpeg`
- Una de estas dos cosas:
  - **Claude Code** instalado (`npm install -g @anthropic-ai/claude-code`) para usar los comandos `/animar` etc. con tu suscripción, o
  - una **clave de API de Anthropic** (https://console.anthropic.com) para usar la CLI `npm run …`.

### 2. Instalar
```bash
cd motion-studio
bash scripts/setup.sh        # verifica Node y ffmpeg, instala dependencias, crea .env
# En Windows sin Git Bash: npm install && copy .env.example .env
```
Edita `.env` y pon tu `ANTHROPIC_API_KEY` (solo hace falta para la CLI).

### 3. Probar que todo funciona
```bash
npm run ms -- doctor         # diagnóstico
npm run studio               # abre Remotion Studio con la composición DemoMinimalTech
```
La primera vez que renderices, Remotion descarga un Chrome Headless Shell (~150 MB). Si ya tienes Chrome y prefieres usarlo, pon `REMOTION_BROWSER_EXECUTABLE=/ruta/a/chrome` en `.env`.

### 4. (Recomendado) Skills de Remotion para Claude Code
```bash
bash scripts/install-skills.sh
```
o dentro de Claude Code: `/plugin marketplace add remotion-dev/claude-code-plugin` y `/plugin install remotion`. En claude.ai también aparece en el directorio de plugins como **Remotion** (12 skills). Ver `RECOMENDACIONES.md` para el resto.

## Flujo completo con un estilo tuyo

```bash
# 1. Crear el estilo
npm run estilo -- nuevo editorial-calido

# 2. Copiar referencias (4-20 archivos: png, jpg, webp, gif, mp4, mov, webm)
cp ~/Descargas/refs/* styles/editorial-calido/references/

# 3. (Opcional) Escribir tus notas: para qué es, qué te gusta, qué no
nano styles/editorial-calido/notes.md

# 4. Aprender: Opus 5.5 mira todo y escribe style.json + STYLE.md
npm run estilo -- aprender editorial-calido
#    → revisa styles/editorial-calido/STYLE.md; edita lo que quieras a mano

# 5. Animar
npm run animar -- editorial-calido "apertura de 12 s para un documental sobre café, con título y tres datos" --duracion 12

# 6. Ver en vivo
npm run studio

# 7. Revisar y corregir automáticamente (render → frames → crítica → fix → re-render)
npm run revisar -- AperturaDocumentalCafe --fix

# 8. Si la crítica aprueba, guardarla como ejemplar y sus lecciones
npm run revisar -- AperturaDocumentalCafe --no-render --aprobar

# 9. Render final
npm run ms -- render AperturaDocumentalCafe
```

Con Claude Code es lo mismo en conversación: abre la carpeta con `claude` y escribe `/animar editorial-calido "apertura de 12 s para…"`. El modelo está fijado en Opus 5.5 en `.claude/settings.json`.

## Cómo "aprende" Opus un estilo

No hay fine-tuning de Claude. El aprendizaje es de tres capas, y las tres están en `styles/<nombre>/`:

1. **Destilación** (`estilo aprender`): Opus 5.5 ve tus referencias con visión y escribe `style.json` (paleta hex, fuentes de Google Fonts, easings cubic-bezier, duraciones en frames, reglas de composición, lista de lo que *nunca* hace) y `STYLE.md` (la guía en prosa, con la estructura típica de una pieza). Tú puedes editar ambos.
2. **Ejemplares** (`exemplars/`): cada composición aprobada se guarda y se le enseña a Opus como ejemplo al generar la siguiente. Con 2-3 buenos ejemplares, la consistencia sube mucho.
3. **Lecciones** (`lessons.md`): la crítica extrae reglas generalizables ("en 9:16 los titulares de este estilo van a 0.06 del alto") y se leen siempre antes de animar.

Además, en cada generación se envían algunas referencias visuales junto con el brief, y en cada revisión se comparan los frames renderizados contra esas referencias.

## Estructura del proyecto

```
motion-studio/
├── README.md, RECOMENDACIONES.md, docs/FLUJO.md
├── CLAUDE.md                 # instrucciones para Claude Code (Opus 5.5)
├── .claude/
│   ├── settings.json         # modelo claude-opus-5-5 + permisos
│   ├── commands/             # /estilo-nuevo /estilo-aprender /animar /revisar /aprobar
│   ├── skills/               # estilos-motion · principios-motion · revision-frames
│   └── agents/critico-motion.md
├── styles/                   # tus estilos (ver styles/README.md)
│   ├── _template/
│   └── ejemplo-minimal-tech/ # estilo de ejemplo escrito a mano
├── src/
│   ├── lib/                  # tokens, easings, fuentes, componentes (TextReveal, LowerThird…)
│   └── compositions/         # tus videos; DemoMinimalTech.tsx es la plantilla
├── cli/                      # la CLI (Anthropic SDK + Opus 5.5)
├── scripts/setup.sh, install-skills.sh
└── public/                   # logos, audio, imágenes que uses en las piezas (staticFile)
```

## Opciones de la CLI

```
npm run estilo -- aprender <nombre> [--max-imagenes 20] [--frames-por-video 6]
npm run animar -- <estilo> "<brief>" [-n Id] [-d segundos] [-f 16:9|9:16|1:1|4:5|21:9] [--fps 30] [--refs 6] [--iteraciones 2]
npm run revisar -- <Id> [--estilo x] [--frames 12] [--refs 4] [--fix] [--iteraciones 2] [--aprobar] [--no-render]
npm run ms -- render <Id> [-o salida] [--codec h264|h265|vp9|prores|gif] [--escala 1]
```
Variables en `.env`: `MOTION_MODEL` (por defecto `claude-opus-5-5`), `MOTION_EFFORT` (`low`…`max`, por defecto `high`), `MOTION_NO_FALLBACK=1` para desactivar el fallback automático de modelo ante rechazos de seguridad.

## Costo aproximado
Opus 5.5 cuesta $4 por millón de tokens de entrada y $20 por millón de salida. En la práctica:
- aprender un estilo con 15 referencias: ~$0.15-0.40
- generar una pieza de 10 s: ~$0.20-0.60 (el código de `src/lib` va en caché)
- una revisión con 12 frames + corrección: ~$0.30-0.80
La CLI imprime el uso y un estimado tras cada llamada.

## Licencia de Remotion
Remotion es gratis para personas físicas, empresas de hasta 3 personas y organizaciones sin fines de lucro. Si tu empresa es más grande, necesita licencia de empresa (remotion.pro). HyperFrames (ver RECOMENDACIONES.md) es la alternativa Apache-2.0.
