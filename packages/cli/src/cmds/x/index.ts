import type { Command } from "commander";
import { execa } from "execa";
import { wsPath } from "../../lib/workspace.js";

export function registerX(program: Command) {
  program
    .command("x")
    .argument("<workspace>", "workspace (e.g. web, rest, packages/ui)")
    .argument("<bin>", "binary to execute (e.g. vite, prisma)")
    .argument("[args...]", "arguments passed to binary")
    .description("Execute a binary inside a workspace directory.")
    .addHelpText("after", `
Examples:
  # Run vite inside apps/web
  $ mdi x web vite

  # Prisma generate in apps/rest
  $ mdi x rest prisma generate
`)
    .action(async (ws: string, bin: string, args: string[] = []) => {
      await execa(bin, args, { cwd: wsPath(ws), stdio: "inherit" });
    });
}
