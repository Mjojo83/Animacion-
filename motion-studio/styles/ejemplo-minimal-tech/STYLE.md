# Estilo: ejemplo-minimal-tech

> Este archivo es la guía en prosa del estilo. `style.json` tiene los tokens
> exactos; aquí va el *porqué* y los matices que un JSON no captura.
> Opus lo lee completo antes de animar. Edítalo con libertad.

## Esencia
Motion de producto de software: oscuro, preciso, sin adornos. La sensación es
de confianza técnica. Nada grita; la jerarquía la marca el tamaño tipográfico y
el silencio alrededor.

## Cómo se ve
- Fondo casi negro (#0B0C10) con una retícula de 64 px al 8 % de opacidad que
  deriva lentísimo. Sin viñetas, sin glow.
- Tipografía grotesca (Inter) muy grande y con tracking negativo. Una sola
  línea de titular cuando se puede; dos como máximo.
- Un color de acento (menta #36E2B4) para líneas, puntos y cursores. El azul
  primario (#5B8CFF) solo en rótulos, barras y cifras.

## Cómo se mueve
- Entradas por máscara: el texto sube desde detrás de una línea invisible en
  14 frames con `cubic-bezier(0.16, 1, 0.3, 1)`.
- Cascada de palabras con 3 frames de desfase.
- Salidas en 8-10 frames, más rápidas que las entradas, con easing "in".
- Cero rebote. Si se usa spring, damping alto (22+).
- Entre escenas: wipe horizontal de color primario (22 frames cubrir, 22
  descubrir) o corte seco.

## Estructura típica de una pieza de 10 s (300 frames @30)
1. 0-20: fondo + línea de acento que crece.
2. 20-110: titular en cascada + subtítulo en cuerpo.
3. 110-130: wipe.
4. 130-230: dato grande (contador) + etiqueta mono.
5. 230-250: wipe.
6. 250-300: cierre centrado: logo/nombre + línea.

## Lo que nunca hace
Ver `doNot` en style.json. En resumen: nada de neón, rebotes, sombras, serifas
ni más de tres cosas moviéndose a la vez.
