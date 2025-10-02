import type { Command } from "commander";
import { runTurbo } from "../../lib/exec.js";

export function registerDev(program: Command) {
  program
    .command("dev")
    .option("-f, --filter <workspace>", "filter workspace (e.g. apps/rest)")
    .description("Start dev mode (turbo dev). Disables cache for live reload.")
    .addHelpText("after", `
Examples:
  $ mdi dev
  $ mdi dev -f apps/rest
`)
    .action(async (opts: { filter?: string }) => {
      const args = ["run", "dev", "--no-cache"];
      if (opts.filter) args.push("--filter", opts.filter);
      await runTurbo(args);
    });
}
