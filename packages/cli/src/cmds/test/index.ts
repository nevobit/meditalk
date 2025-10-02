import type { Command } from "commander";
import { runTurbo } from "../../lib/exec.js";

export function registerTest(program: Command) {
  program
    .command("test")
    .option("-f, --filter <workspace>", "filter workspace (e.g. packages/ui)")
    .description("Run tests via turbo (Vitest/Jest per workspace).")
    .addHelpText("after", `
Examples:
  $ mdi test
  $ mdi test -f packages/ui
`)
    .action(async (opts: { filter?: string }) => {
      const args = ["run", "test"];
      if (opts.filter) args.push("--filter", opts.filter);
      await runTurbo(args);
    });
}
