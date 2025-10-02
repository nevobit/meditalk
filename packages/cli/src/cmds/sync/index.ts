import type { Command } from "commander";
import { execSync } from "node:child_process";
import { runPnpm } from "../../lib/exec.js";

function sh(cmd: string) {
  execSync(cmd, { stdio: "inherit" });
}

function getCurrentBranch(): string {
  try {
    const out = execSync("git branch --show-current", { encoding: "utf8" }).trim();
    if (out) return out;
  } catch {
    return "";
  }
  const out = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  return out;
}

export function registerSync(program: Command) {
  program
    .command("sync")
    .description("Fetch + Pull current git branch and (optionally) install dependencies")
    .option("--no-install", "Skip pnpm install -w")
    .option("--clean", "Run mdi clean --force before installing")
    .option("--submodules", "Sync and update git submodules (recursive)")
    .option("--fast", "Shallow fetch (depth=1) and faster install (no frozen lock)")
    .addHelpText("after", `
Examples:
  # Sync current branch and run pnpm install -w
  $ mdi sync

  # Pull changes without installing dependencies
  $ mdi sync --no-install

  # Clean caches/node_modules before installing
  $ mdi sync --clean

  # Sync with submodules
  $ mdi sync --submodules

  # Fast mode: shallow fetch + faster install
  $ mdi sync --fast
`)
    .action(async (opts: {
      install?: boolean;   // default true
      clean?: boolean;
      submodules?: boolean;
      fast?: boolean;
    }) => {
      try {
        const branch = getCurrentBranch();
        if (!branch) {
          console.error("❌ Could not detect current branch.");
          process.exit(1);
        }

        // 1) Fetch (fast or full)
        if (opts.fast) {
          console.log("➡️  git fetch --all --prune --depth=1");
          sh("git fetch --all --prune --depth=1");
        } else {
          console.log("➡️  git fetch --all --prune");
          sh("git fetch --all --prune");
        }

        // 2) Submodules (optional)
        if (opts.submodules) {
          console.log("➡️  git submodule sync --recursive && git submodule update --init --recursive");
          sh("git submodule sync --recursive");
          sh("git submodule update --init --recursive");
        }

        // 3) Pull
        console.log(`➡️  git pull origin ${branch}`);
        sh(`git pull origin ${branch}`);

        // 4) Clean (optional)
        if (opts.clean) {
          console.log("➡️  mdi clean --force");
          try {
            sh("mdi clean --force");
          } catch {
            // fallback: manual clean
            sh("rm -rf common/deploy || true");
            sh("rm -rf common/temp || true");
            sh("rm -rf .*.log || true");
            sh("rm -rf *.log || true");
            sh("rm -rf *.tgz || true");
            sh(`find . -name ".rush" -type d -prune -exec rm -rf '{}' + || true`);
            sh(`find . -name "node_modules" -type d -prune -exec rm -rf '{}' + || true`);
          }
        }

        // 5) Install (default yes)
        if (opts.install !== false) {
          if (opts.fast) {
            console.log("➡️  pnpm install -w");
            await runPnpm(["install", "-w"]);
          } else {
            console.log("➡️  pnpm install -w");
            await runPnpm(["install", "-w"]);
          }
        } else {
          console.log("⏭️  Skipping pnpm install (via --no-install)");
        }

        console.log("✅ repo synchronized.");
      } catch (e) {
        console.error("❌ mdi sync failed:", e instanceof Error ? e.message : e);
        process.exit(1);
      }
    });
}
