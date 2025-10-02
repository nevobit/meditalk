import type { Command } from "commander";
import { wsPath } from "../../lib/workspace.js";

export function registerPath(program: Command) {
  program
    .command("path")
    .argument("<workspace>", "workspace name (web, admin, rest, graphql, etc.)")
    .description("Print absolute path for a workspace.")
    .addHelpText("after", `
Examples:
  $ mdi path web
  $ mdi path packages/contracts
`)
    .action(async (ws: string) => {
      console.log(wsPath(ws));
    });
}
