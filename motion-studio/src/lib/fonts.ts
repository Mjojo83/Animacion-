import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { asStyle, type StyleInput } from "./style";

/** Promesa por hoja de estilos ya inyectada: varias composiciones comparten la misma carga. */
const stylesheets = new Map<string, Promise<void>>();

const loadStylesheet = (href: string): Promise<void> => {
  const hit = stylesheets.get(href);
  if (hit) return hit;
  const p = new Promise<void>((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    // Si el CSS no llega (sin red), seguimos: el texto saldrá con la fuente de respaldo.
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
  stylesheets.set(href, p);
  return p;
};

/**
 * Carga una fuente de Google Fonts y retrasa el render hasta que esté lista.
 *
 * Importante: hay que esperar a que el CSS cargue ANTES de llamar a
 * document.fonts.load(); si no, no existe todavía ninguna FontFace de esa
 * familia y la promesa resuelve al instante con la fuente sin descargar
 * (lo detectó `npm run probar -- PruebaFuentes`: Playfair salía en sans).
 */
export const useGoogleFont = (family: string, weights: number[] = [400, 700]): void => {
  const [handle] = useState(() => delayRender(`Cargando fuente ${family}`));
  useEffect(() => {
    const fam = family.trim().replace(/\s+/g, "+");
    const sorted = [...new Set(weights)].sort((a, b) => a - b);
    const href = `https://fonts.googleapis.com/css2?family=${fam}:ital,wght@${sorted.map((w) => `0,${w}`).join(";")};${sorted.map((w) => `1,${w}`).join(";")}&display=swap`;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    const timeout = setTimeout(finish, 12000);
    loadStylesheet(href)
      .then(() => Promise.all(sorted.flatMap((w) => [document.fonts.load(`${w} 16px "${family}"`), document.fonts.load(`italic ${w} 16px "${family}"`)])))
      .then(finish)
      .catch(finish);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/** Carga todas las fuentes declaradas en un estilo (display, body, mono), con normal e itálica. */
export const useStyleFonts = (input: StyleInput): void => {
  const style = asStyle(input);
  const specs = [style.typography.display, style.typography.body, style.typography.mono].filter(
    (f): f is NonNullable<typeof f> => Boolean(f && f.googleFont),
  );
  // Los hooks deben llamarse en orden estable: cargamos siempre 3 slots.
  const slots = [specs[0], specs[1], specs[2]];
  for (const spec of slots) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGoogleFont(spec?.family ?? "Inter", spec ? [400, spec.weight] : [400]);
  }
};
