import React from "react";
import { Composition } from "remotion";
import { compositions } from "./compositions/manifest";

/**
 * Registra automáticamente todas las composiciones listadas en
 * src/compositions/manifest.ts (lo regenera la CLI con `npm run manifest`).
 */
export const Root: React.FC = () => (
  <>
    {compositions.map((m) => (
      <Composition
        key={m.meta.id}
        id={m.meta.id}
        component={m.Component}
        width={m.meta.width}
        height={m.meta.height}
        fps={m.meta.fps}
        durationInFrames={m.meta.durationInFrames}
      />
    ))}
  </>
);
