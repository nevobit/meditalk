import type { Command } from "commander";
import { runTurbo } from "../../lib/exec.js";

export function registerDeploy(program: Command) {
  program
    .command("deploy")
    .option("-f, --filter <workspace>", "filter workspace (e.g. apps/site)")
    .description("Run 'deploy' script via turbo for one or many workspaces.")
    .addHelpText("after", `
Examples:
  $ mdi deploy
  $ mdi deploy -f apps/site
`)
    .action(async (opts: { filter?: string }) => {
      const args = ["run", "deploy"];
      if (opts.filter) args.push("--filter", opts.filter);
      await runTurbo(args);
    });
}
