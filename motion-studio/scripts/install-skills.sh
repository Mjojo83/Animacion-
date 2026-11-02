#!/usr/bin/env bash
# Instala los skills/plugins externos recomendados (todos opcionales).
# Corre esto en TU máquina, dentro de la carpeta del proyecto.
set -e
cd "$(dirname "$0")/.."

echo "▸ Skills oficiales de Remotion (API correcta, render, captions, studio...)"
echo "  Opción A (cualquier agente, instala en .claude/skills o ~/.claude/skills):"
echo "    npx skills add remotion-dev/skills"
echo "  Opción B (plugin de Claude Code, dentro de claude):"
echo "    /plugin marketplace add remotion-dev/claude-code-plugin"
echo "    /plugin install remotion"
echo ""
echo "▸ Motion graphics 'con gusto' encima del oficial (comunidad, MIT):"
echo "    npx skills add liamrjohnston/remotion-motion-graphics-skill"
echo "    npx skills add haidrrrry/claude-remotion-skill"
echo ""
echo "▸ Alternativa sin React (HTML → MP4, Apache-2.0), por si prefieres HyperFrames:"
echo "    /plugin marketplace add heygen-com/hyperframes && /plugin install hyperframes@hyperframes"
echo ""
read -r -p "¿Instalar ahora los skills oficiales de Remotion con npx skills add? [s/N] " yn
if [[ "$yn" =~ ^[sSyY]$ ]]; then
  npx skills add remotion-dev/skills
fi
