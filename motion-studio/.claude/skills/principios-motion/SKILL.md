---
name: principios-motion
description: Principios de motion design aplicados a animación en código (Remotion): jerarquía, timing, easing, cascadas, legibilidad de texto, formatos verticales, transiciones y errores típicos de animación generada. Úsalo al escribir o criticar cualquier composición.
---

# Principios de motion para animación en código

## 1. Una idea por escena
Cada `Sequence` responde a una pregunta. Si en una escena hay dos protagonistas, son dos escenas. Entre escenas, una respiración (6-12 frames sin nada nuevo entrando).

## 2. Timing que se siente natural (a 30 fps)
| Movimiento | Frames | Notas |
|---|---|---|
| Micro (parpadeo, cursor, hover) | 4-8 | Sin easing elaborado |
| Entrada de texto | 10-20 | `eases.out` (arranca rápido, frena suave) |
| Salida de texto | 6-12 | `eases.in`, siempre más corta que la entrada |
| Transición de escena | 18-36 | `eases.inOut` |
| Movimiento de cámara / lento | 40-120 | Lineal o `inOut` muy suave |
Usa los valores del estilo (`st.d.*`); la tabla es el rango sano.

## 3. Easing
- Entradas: curva "out" (p. ej. `cubic-bezier(0.16, 1, 0.3, 1)`). Salidas: curva "in". Movimientos continuos: "inOut".
- Lineal solo para cosas mecánicas (contadores, barras de progreso, scroll de retícula).
- Spring: `damping` alto (20+) = sin rebote; 10-14 = rebote visible. El estilo decide.

## 4. Cascadas (stagger)
Desfase de 2-4 frames entre palabras, 1-2 entre letras, 4-8 entre bloques. Si la cascada supera 1 s en total, el texto ya se lee entero antes de terminar de entrar: acórtala.

## 5. Texto en pantalla
- Tiempo en pantalla mínimo: 0.6 s por cada 3 palabras + 0.5 s. Un titular de 6 palabras necesita ≥ 1.7 s quieto.
- Tamaño mínimo legible: 2.2 % del alto para cuerpo en 16:9; 2.8 % en 9:16 (se ve en móvil).
- Máximo dos líneas de titular; cuerpo máximo tres.
- Todo dentro del `SafeArea`. En 9:16 además deja libre el 12 % superior y el 18 % inferior (interfaz de Reels/TikTok).

## 6. Jerarquía visual
En cada frame debe quedar claro qué mirar primero. Herramientas en orden: tamaño > contraste > movimiento > color. Si usas movimiento para llamar la atención, el resto se queda quieto.

## 7. Transiciones
Corte seco es la transición por defecto y la más elegante. Wipe/slide cuando cambia el tema. Fundido cuando cambia el tiempo o el tono. Nunca dos tipos de transición en la misma pieza de < 20 s.

## 8. Formatos
- 16:9: alineación a retícula izquierda o centrado; titulares 7-11 % del alto.
- 9:16: centrado o apilado; titulares 5-7 % del alto (el ancho manda); más aire vertical.
- 1:1 / 4:5: centrado; todo un 10 % más pequeño que en 16:9.

## 9. Errores típicos de la animación generada (evítalos)
- Todo entra desde abajo con el mismo fade-up: variar según el papel del elemento.
- Elementos que entran y nunca salen (se apilan).
- Rebotes en todo. Overshoot solo si el estilo lo tiene.
- Textos que cambian antes de poder leerse.
- Valores "mágicos" distintos en cada elemento: usar `st.d.*` y `st.eases.*`.
- Fuentes que no cargaron (render con fuente de sistema): llama `useStyleFonts(style)`.
- Glow, sombras y degradados que el estilo no tiene.

## 10. Verificación
No des una pieza por buena sin mirar frames renderizados: al menos 8 repartidos por la duración. Comprueba: legibilidad, elementos cortados por el borde, superposiciones, fuente correcta, nada estático demasiado tiempo (> 3 s sin cambio en una pieza corta).
