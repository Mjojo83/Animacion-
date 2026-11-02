import { Config } from "@remotion/cli/config";

// Calidad de salida por defecto. Ajusta según tu destino (YouTube, Reels, etc.).
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setOverwriteOutput(true);
Config.setConcurrency(null); // null = automático según CPU

// Si tienes un Chrome/Chromium propio, Remotion lo usará en vez de descargar uno.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
