import type { Command } from "commander";
import { runPnpm } from "../../lib/exec.js";

export function registerSyncEnv(program: Command) {
  program
    .command("sync-env")
    .description("Validate and copy .env.example → .env.local where missing.")
    .addHelpText("after", `
Examples:
  $ mdi sync-env
`)
    .action(async () => {
      await runPnpm(["sync-env"]);
    });
}
