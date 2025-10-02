import { execSync } from "node:child_process";
import type { Command } from "commander";

function getCurrentBranch(): string {
  try {
    const out = execSync("git branch --show-current", { encoding: "utf8" }).trim();
    if (out) return out;
  } catch {
    return "";
  }
  return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
}

export function registerPush(program: Command) {
  program
    .command("push")
    .description("Push the current git branch to origin with upstream tracking")
    .option("-f, --force", "Force push (--force-with-lease)")
    .addHelpText("after", `
Examples:
  $ mdi push
  $ mdi push --force
`)
    .action((opts: { force?: boolean }) => {
      try {
        const branch = getCurrentBranch();
        if (!branch) {
          console.error("❌ Could not detect current branch.");
          process.exit(1);
        }

        const cmd = opts.force
          ? `git push --force-with-lease origin ${branch}`
          : `git push -u origin ${branch}`;

        console.log(`➡️  ${cmd}`);
        execSync(cmd, { stdio: "inherit" });
        console.log(`✅ Pushed branch ${branch} to origin`);
      } catch (e) {
        console.error("❌ mdi push failed:", e instanceof Error ? e.message : e);
        process.exit(1);
      }
    });
}
