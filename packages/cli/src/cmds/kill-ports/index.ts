import type { Command } from "commander";
import { runPnpm } from "../../lib/exec.js";

export function registerKillPorts(program: Command) {
  program
    .command("kill-ports")
    .argument("[ports...]", "ports to kill (default: 3000 4000)")
    .description("Free TCP ports across platforms.")
    .addHelpText("after", `
Examples:
  $ mdi kill-ports
  $ mdi kill-ports 5173 4001
`)
    .action(async (...args: string[]) => {
      const ports = (args as string[]).flat().filter(Boolean);
      await runPnpm(["kill-ports", ...ports]);
    });
}
