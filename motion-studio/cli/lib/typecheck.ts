import { spawnSync } from "node:child_process";
import path from "node:path";
import { ROOT } from "./paths";

const bin = (name: string) => path.join(ROOT, "node_modules", ".bin", process.platform === "win32" ? `${name}.cmd` : name);

/** Corre `tsc --noEmit` sobre todo el proyecto. */
export const typecheck = (): { ok: boolean; output: string } => {
  const r = spawnSync(bin("tsc"), ["--noEmit", "-p", "tsconfig.json"], { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
  const output = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  return { ok: r.status === 0, output };
};

/** Ejecuta la CLI de Remotion mostrando su salida en vivo. */
export const remotion = (args: string[]): boolean => {
  const r = spawnSync(bin("remotion"), args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" });
  return r.status === 0;
};
