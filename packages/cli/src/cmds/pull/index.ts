import { execSync } from "node:child_process";
import type { Command } from "commander";

export function registerPull(program: Command) {
  program
    .command("pull")
    .description("Pull latest changes for the current git branch")
    .addHelpText("after", `
Examples:
  $ mdi pull
  $ mdi pull
`)
    .action(() => {
      try {
        const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
        if (!branch) {
          console.error("❌ No branch detected.");
          process.exit(1);
        }

        console.log(`➡️  git pull origin ${branch}`);
        execSync(`git pull origin ${branch}`, { stdio: "inherit" });
        console.log(`✅ Pulled latest changes for ${branch}`);
      } catch (e) {
        console.error("❌ Failed to pull branch:", e);
        process.exit(1);
      }
    });
}
