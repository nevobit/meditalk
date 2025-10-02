import { execa } from "execa";

export async function run(
  bin: string,
  args: string[] = [],
  opts: { cwd?: string } = {}
) {
  await execa(bin, args, {
    stdio: "inherit",
    ...(opts.cwd ? { cwd: opts.cwd } : {}),
  });
}

export const runPnpm = (args: string[], opts: { cwd?: string } = {}) =>
  run("pnpm", args, opts);

export const runTurbo = (args: string[], opts: { cwd?: string } = {}) =>
  run("turbo", args, opts);

export const runNode = (script: string, args: string[] = [], opts: { cwd?: string } = {}) =>
  run("node", [script, ...args], opts);
