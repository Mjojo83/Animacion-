---
name: formato-vertical
description: Reglas para piezas verticales 9:16 (Reels, TikTok, Shorts) y cuadradas 1:1 / 4:5: zonas que tapa la interfaz, tamaños de texto, ritmo del gancho, densidad y cómo adaptar una pieza 16:9. Úsala siempre que el formato sea distinto de 16:9 o el destino sea redes sociales.
---

# Formato vertical (9:16) y cuadrado

Verificado con `DemoVertical` (1080×1920) y `DemoCaptions`: `npm run probar -- --guias` dibuja las zonas.

## Zonas de interfaz (9:16)
- **Arriba 12 %**: barra de estado, nombre de cuenta. Nada importante.
- **Abajo 18 %**: pie, botones, descripción. Nada de texto.
- **Derecha 12 %**: iconos de like/comentar/compartir en TikTok/Reels. Evita texto pegado a la derecha.
- Lo crítico vive en el **64 % central vertical** y dentro del margen seguro del estilo.
En código: `paddingTop: height * 0.12`, `paddingBottom: height * 0.18` en una `AbsoluteFill` que envuelve a las `SafeArea`.

## Tipografía
- Titulares **5-7 % del alto** (el ancho manda: 1080 px); en 16:9 serían 8-11 %.
- Cuerpo **2.4-2.8 % del alto** mínimo (se ve en un móvil a un brazo de distancia).
- Máximo **2 líneas** de titular y 2 de cuerpo. `maxWidth: width * 0.86`.
- Subtítulos: 3-4 palabras por línea, en el 62-70 % del alto (`Captions y={0.66}`).

## Ritmo
- Movimiento en los **primeros 15 frames**. El gancho (titular) legible antes del segundo 1.
- Nueva información cada **≤ 3 s**; piezas de 6-15 s.
- Cambios de escena con wipe vertical (`direction="up|down"`): acompañan el scroll.
- Termina con una CTA quieta ≥ 1 s.

## Densidad
Un elemento grande por escena. Listas de 3 ítems máximo. Fondos con textura sutil; sin fotos a sangre con texto encima salvo con oscurecido (`opacity 0.5-0.6` de la foto).

## Adaptar una pieza 16:9 a 9:16
1. Cambia `meta.width/height` y `formato`.
2. Reduce `size` de titulares un 35 % y aumenta `gap` vertical.
3. Convierte filas (`direction="row"`) en columnas.
4. Mueve rótulos (`LowerThird`) por encima del 18 % inferior o quítalos.
5. Renderiza con `--guias` y mira la hoja de contacto.

## 1:1 y 4:5
Centrado, todo un 10 % más pequeño que en 16:9, márgenes del 8 %. 4:5 es el formato de feed de Instagram con más área: úsalo en vez de 1:1 cuando puedas.
