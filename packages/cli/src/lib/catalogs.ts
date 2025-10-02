import { readPkgJson, writePkgJson } from "./workspace.js";

export async function addCatalogSpec(
  workspace: string,
  dep: string,
  opts: { dev?: boolean; name?: string } = {}
) {
  const pkg = await readPkgJson(workspace);
  const key = opts.dev ? "devDependencies" : "dependencies";
  pkg[key] ||= {};

  const spec = opts.name ? `catalog:${opts.name}` : "catalog:";
  pkg[key][dep] = spec;

  await writePkgJson(workspace, pkg);
  return { workspace, dep, spec, section: key as "dependencies" | "devDependencies" };
}

export async function removeDepSpec(
  workspace: string,
  dep: string,
  opts: { dev?: boolean } = {}
) {
  const pkg = await readPkgJson(workspace);
  const sections = opts.dev ? ["devDependencies"] : ["dependencies", "devDependencies"];
  let removed = false;

  for (const section of sections) {
    if (pkg[section]?.[dep]) {
      delete pkg[section][dep];
      removed = true;
    }
  }
  if (removed) await writePkgJson(workspace, pkg);
  return removed;
}

export async function getDepSpec(
  workspace: string,
  dep: string
): Promise<string | undefined> {
  const pkg = await readPkgJson(workspace);
  return pkg.dependencies?.[dep] ?? pkg.devDependencies?.[dep];
}
