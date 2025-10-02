import type { Command } from "commander";
import { runPnpm } from "../../lib/exec.js";

export function registerGen(program: Command) {
  program
    .command("gen")
    .description("Orchestrate code generation (GraphQL/OpenAPI) across workspaces.")
    .addHelpText("after", `
Examples:
  $ mdi gen
`)
    .action(async () => {
      await runPnpm(["gen"]);
    });
}
