import type { Command } from "commander";
import { runPnpm } from "../../lib/exec.js";
import { addCatalogSpec } from "../../lib/catalogs.js";

export function registerInstall(program: Command) {
  program
    .command("install")
    .alias("i")
    .argument("[pkg]", "dependency name (optional)")
    .argument("[workspace]", "workspace name (optional, e.g. web, rest)")
    .option("-D, --dev", "save as devDependency")
    .option("-n, --name <catalog>", "named catalog (pnpm catalog key)")
    .description("Install dependencies in workspace(s). Supports pnpm catalogs.")
    .addHelpText("after", `
Examples:
  # Install all deps in the mdi
  $ mdi install

  # Add react to apps/web using default catalog
  $ mdi install react web

  # Add vitest as devDependency in apps/admin
  $ mdi install vitest admin -D

  # Add react using a named catalog "testing"
  $ mdi install react web -n testing
`)
    .action(async (pkg?: string, ws?: string, opts?: { dev: boolean, name: string }) => {
      if (!pkg && !ws) return runPnpm(["install", "-w"]);
      const workspace = ws ?? "root";
      if (!pkg) return runPnpm(["install", "-w"]);
      await addCatalogSpec(workspace, pkg, { dev: !!opts?.dev, name: opts?.name ?? "" });
      await runPnpm(["install", "-w"]);
      console.log(`✅ ${pkg} added to ${workspace}${opts?.name ? ` (catalog:${opts.name})` : " (catalog:)"}`);
    });
}
