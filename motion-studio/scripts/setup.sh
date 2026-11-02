#!/usr/bin/env bash
# Instalación en tu máquina (macOS, Linux o Windows con Git Bash / WSL).
set -e
cd "$(dirname "$0")/.."

echo "▸ motion-studio · instalación"

need() { command -v "$1" >/dev/null 2>&1; }

# Node 22+
if ! need node; then
  echo "✗ Falta Node.js 22+. Instálalo desde https://nodejs.org (LTS) y vuelve a correr este script."; exit 1
fi
MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$MAJOR" -lt 22 ]; then
  echo "✗ Node $(node -v) es viejo: se necesita 22+. https://nodejs.org"; exit 1
fi
echo "✓ Node $(node -v)"

# ffmpeg
if ! need ffmpeg || ! need ffprobe; then
  echo "! Falta ffmpeg/ffprobe. Instálalo:"
  echo "    macOS:   brew install ffmpeg"
  echo "    Ubuntu:  sudo apt install ffmpeg"
  echo "    Windows: winget install Gyan.FFmpeg   (o choco install ffmpeg)"
  echo "  Sin ffmpeg no funcionan 'estilo aprender' (frames de video) ni 'revisar'."
else
  echo "✓ ffmpeg $(ffmpeg -version | head -1 | awk '{print $3}')"
fi

# Dependencias
echo "▸ npm install"
npm install --no-audit --no-fund
echo "✓ dependencias"

# .env
if [ ! -f .env ]; then
  cp .env.example .env
  echo "! Creado .env: pon tu ANTHROPIC_API_KEY (solo necesario para la CLI; en Claude Code no hace falta)."
fi

# Diagnóstico
npm run ms -- doctor || true

cat <<'MSG'

Listo. Prueba:
  npm run studio                      # abre Remotion Studio con la demo
  npm run estilo -- nuevo mi-estilo   # crea un estilo y sube referencias
  npm run estilo -- aprender mi-estilo
  npm run animar -- mi-estilo "intro de 10 segundos para mi canal"
  npm run revisar -- <Id> --fix

Con Claude Code (Opus 5.5): abre esta carpeta con `claude` y usa /animar, /estilo-aprender, /revisar.
Skills de Remotion (opcional pero recomendado): bash scripts/install-skills.sh
MSG
