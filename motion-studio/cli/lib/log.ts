const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code: number) => (s: string) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
export const bold = c(1);
export const dim = c(2);
export const green = c(32);
export const yellow = c(33);
export const blue = c(34);
export const magenta = c(35);
export const cyan = c(36);
export const red = c(31);

export const step = (msg: string) => console.log(`${cyan("▸")} ${msg}`);
export const ok = (msg: string) => console.log(`${green("✓")} ${msg}`);
export const warn = (msg: string) => console.log(`${yellow("!")} ${msg}`);
export const fail = (msg: string) => console.error(`${red("✗")} ${msg}`);
export const info = (msg: string) => console.log(dim(`  ${msg}`));
