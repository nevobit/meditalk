import type { Command } from "commander";
import { runPnpm } from "../../lib/exec.js";

export function registerPreflight(program: Command) {
  program
    .command("preflight")
    .description("Check Node, pnpm, Vercel CLI, AWS CLI versions before running.")
    .addHelpText("after", `
Examples:
  $ mdi preflight
`)
    .action(async () => {
      await runPnpm(["preflight"]);
    });
}
