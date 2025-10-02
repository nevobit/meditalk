import path from "node:path";
import fs from "fs-extra";
import { execa } from "execa";
import { repoRoot } from "./workspace.js";

function candidates(cmd: string): string[] {
  const root = repoRoot();
  return [
    path.join(root, "scripts", cmd, "index"),
    path.join(root, "packages", "cli", "scripts", cmd, "index"),
    path.join(root, "node_modules", "@clickster", "cli", "scripts", cmd, "index")
  ];
}

export async function hasLegacyCmd(cmd?: string) {
  if (!cmd) return false;
  for (const p of candidates(cmd)) if (await fs.pathExists(p)) return true;
  return false;
}

export async function runLegacyCmd(cmd: string, args: string[] = []) {
  for (const p of candidates(cmd)) {
    if (await fs.pathExists(p)) {
      await execa("bash", [p, ...args], { stdio: "inherit" });
      return;
    }
  }
  throw new Error(`Legacy command '${cmd}' not found in known locations`);
}
