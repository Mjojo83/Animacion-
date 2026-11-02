import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { asStyle, type StyleInput } from "./style";

const injected = new Set<string>();

/**
 * Carga una fuente de Google Fonts y retrasa el render hasta que esté lista.
 * Si la fuente no existe o no hay red, continúa igual tras 8 s con la fuente
 * de respaldo (así nunca se cuelga un render).
 */
export const useGoogleFont = (family: string, weights: number[] = [400, 700]): void => {
  const [handle] = useState(() => delayRender(`Cargando fuente ${family}`));
  useEffect(() => {
    const key = `${family}|${weights.join(",")}`;
    if (!injected.has(key)) {
      const fam = family.trim().replace(/\s+/g, "+");
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${fam}:wght@${[...weights].sort((a, b) => a - b).join(";")}&display=swap`;
      document.head.appendChild(link);
      injected.add(key);
    }
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    const timeout = setTimeout(finish, 8000);
    Promise.all(weights.map((w) => document.fonts.load(`${w} 16px "${family}"`)))
      .then(finish)
      .catch(finish);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

/** Carga todas las fuentes declaradas en un estilo (display, body, mono). */
export const useStyleFonts = (input: StyleInput): void => {
  const style = asStyle(input);
  const specs = [style.typography.display, style.typography.body, style.typography.mono].filter(
    (f): f is NonNullable<typeof f> => Boolean(f && f.googleFont),
  );
  // Los hooks deben llamarse en orden estable: cargamos siempre 3 slots.
  const slots = [specs[0], specs[1], specs[2]];
  for (const spec of slots) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useGoogleFont(spec?.family ?? "Inter", spec ? uniq([400, spec.weight]) : [400]);
  }
};

const uniq = (arr: number[]) => Array.from(new Set(arr));
