# Estilo: ejemplo-editorial-calido

## Esencia
Una revista impresa que cobra vida. Papel crema, tinta, una serifa de alto
contraste y un solo color cálido. Se mueve despacio y con intención; cada
elemento llega, se queda y se va como si alguien pasara la página.

## Cómo se ve
- Fondo #F6F1E7 con grano de papel al 6-8 %. Sin viñeta oscura; como mucho un
  leve oscurecido en los bordes al 8 %.
- Titulares en Playfair Display 600 (o itálica), 7-9 % del alto, interlineado
  1.05. Una palabra en terracota #B5532F o en itálica para dar énfasis.
- Cuerpo en DM Sans 400, 2.6-3 % del alto, color tinta #1F1E1B; secundarios en
  #6E6659. Etiquetas en versalitas con tracking 0.18em.
- Fotos en tarjeta con esquinas de 2-4 px, sin sombra, con Ken Burns lento.

## Cómo se mueve
- Entradas: fundido + subida de 20-30 px en 22 frames con `cubic-bezier(0.22, 1, 0.36, 1)`.
- Cascadas de 5 frames entre palabras o líneas.
- Filetes y subrayados se dibujan de izquierda a derecha en 34 frames.
- Salidas: fundido en 14-16 frames. Nunca cortes de elementos sueltos.
- Transiciones entre escenas: fundido a papel o cortinilla vertical lenta.

## Estructura típica de una pieza (10 s, 300 frames)
1. 0-30: papel + filete que se dibuja + etiqueta en versalitas letra a letra.
2. 30-140: titular en cascada de palabras (una en terracota) + cuerpo de dos líneas.
3. 140-170: fundido a papel.
4. 170-250: foto en tarjeta con Ken Burns a la izquierda, cita con comillas grandes a la derecha.
5. 250-300: cierre centrado: nombre de la publicación + filete.

## Lo que nunca hace
Negros o blancos puros, neón, glow, rebotes, sans gruesas en titulares, más de
dos elementos moviéndose a la vez, monoespaciadas.

## Qué aportó cada referencia
(Estilo escrito a mano como ejemplo; al correr `estilo aprender` con tus
referencias esta sección se rellena sola.)
