import path from "node:path";
import fs from "fs-extra";

export function wsPath(name: string): string {
  const cwd = process.cwd();
  const direct = path.isAbsolute(name) ? name : path.join(cwd, name);
  if (fs.existsSync(direct)) return direct;

  const candidates = [
    path.join(cwd, "apps", name),
    path.join(cwd, "packages", name)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Workspace '${name}' not found. Tried: ${[direct, ...candidates].join(", ")}`);
}

export const pkgJsonPath = (name: string) => path.join(wsPath(name), "package.json");

/** Lee el package.json del workspace */
export async function readPkgJson(name: string): Promise<unknown> {
  const file = pkgJsonPath(name);
  if (!(await fs.pathExists(file))) throw new Error(`package.json not found for workspace '${name}'`);
  return fs.readJSON(file);
}

/** Escribe el package.json del workspace con identación 2 */
export async function writePkgJson(name: string, pkg: unknown) {
  const file = pkgJsonPath(name);
  await fs.writeJSON(file, pkg, { spaces: 2 });
}

/**
 * Devuelve la raíz del mdi (busca pnpm-workspace.yaml / turbo.json / package.json)
 * subiendo directorios hasta /
 */
export function repoRoot(start: string = process.cwd()): string {
  let dir = start;
  while (true) {
    const found = ["pnpm-workspace.yaml", "turbo.json", "package.json"]
      .some((f) => fs.existsSync(path.join(dir, f)));
    if (found) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}
