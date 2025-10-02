import type { Command } from "commander";
import path from "node:path";
import { promises as fs } from "node:fs";

const toPascal = (s: string) =>
    s
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w[0]?.toUpperCase() + w.slice(1))
        .join("");

const toKebab = (s: string) =>
    s
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/[\s_]+/g, "-")
        .toLowerCase()
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

async function ensureDir(p: string) {
    await fs.mkdir(p, { recursive: true });
}
async function fileExists(p: string) {
    try { await fs.access(p); return true; } catch { return false; }
}
async function writeFileSmart(filePath: string, content: string, force = false) {
    if (!force && await fileExists(filePath)) {
        console.log(`↷ Skipped (exists): ${filePath}`);
        return;
    }
    await fs.writeFile(filePath, content, "utf8");
    console.log(`✔ Wrote: ${filePath}`);
}

async function upsertModelsBarrel(modelsDir: string, resourceName: string) {
    const indexPath = path.join(modelsDir, "index.ts");
    const exportLine = `export * from './${resourceName}';`;
    const lineRegex = new RegExp(`^\\s*export \\* from ['"]\\./${resourceName}['"];?\\s*$`, "m");

    if (await fileExists(indexPath)) {
        let content = await fs.readFile(indexPath, "utf8");
        if (!lineRegex.test(content)) {
            if (!content.endsWith("\n")) content += "\n";
            content += `${exportLine}\n`;
            await fs.writeFile(indexPath, content, "utf8");
            console.log(`✔ Updated models barrel: ${indexPath}`);
        } else {
            console.log(`↷ Barrel already has export for "./${resourceName}"`);
        }
    } else {
        await fs.writeFile(indexPath, `${exportLine}\n`, "utf8");
        console.log(`✔ Created models barrel: ${indexPath}`);
    }
}

const schemaInterface = (model: string) => `import { Base } from '../../../common';

export interface ${model} extends Base {

}
`;

const schemaMongo = (model: string, file: string) => `import { Schema } from "mongoose";
import type { ${model} } from "./${file}";

export const ${model}SchemaMongo = new Schema<${model}>({}, {
  versionKey: false,
  timestamps: true,
});
`;

const dtos = (model: string) => `import type { ${model} } from './schemas';

export type Create${model}Dto = Omit<${model}, 'id' | 'createdAt' | 'updatedAt'>;
export interface Update${model}Dto extends Partial<Create${model}Dto> {}
`;

const schemasIndex = (file: string, mongo: boolean) =>
    `export * from "./${file}";\n${mongo ? `export * from "./${file}-mongo";\n` : ""}`;

const resourceIndex = (lower: string) =>
    `export * from "./schemas";\nexport * from "./${lower}.dtos";\n`;

async function runGenContract(name: string, opts: { mongo?: boolean; force?: boolean }) {
    const resourceName = toKebab(name);

    const modelName = toPascal(resourceName.endsWith("s")
        ? resourceName.slice(0, -1)
        : resourceName
    );

    const entityFileName = toKebab(modelName);

    const modelsDir = "packages/contracts/src/models";
    const resourceDir = path.join(modelsDir, resourceName); // 👈 usa resourceName (kebab, plural)
    const schemasDir = path.join(resourceDir, "schemas");

    await ensureDir(schemasDir);

    await writeFileSmart(
        path.join(schemasDir, `${entityFileName}.ts`),
        schemaInterface(modelName),
        opts.force
    );

    if (opts.mongo) {
        await writeFileSmart(
            path.join(schemasDir, `${entityFileName}-mongo.ts`),
            schemaMongo(modelName, entityFileName),
            opts.force
        );
    }

    await writeFileSmart(
        path.join(resourceDir, `${entityFileName}.dtos.ts`),
        dtos(modelName),
        opts.force
    );

    await writeFileSmart(
        path.join(schemasDir, "index.ts"),
        schemasIndex(entityFileName, Boolean(opts.mongo)),
        true
    );

    await writeFileSmart(
        path.join(resourceDir, "index.ts"),
        resourceIndex(entityFileName),
        true
    );

    await upsertModelsBarrel(modelsDir, resourceName);

    console.log(`\n✔ Contracts generated for "${resourceName}" (model: ${modelName})`);
}

export function registerGenContract(program: Command) {
    program
        .command("gen-contract")
        .requiredOption("-n, --name <name>", "resource name (e.g. users)")
        .option("--mongo", "generate mongoose schema file")
        .option("--force", "overwrite existing files")
        .description("Generate contract files (schemas + dtos) and update models barrel")
        .addHelpText("after", `
Examples:
  $ mdi gen-contract -n users
  $ mdi gen-contract -n blogPosts --mongo
  $ mdi gen-contract -n users --mongo --force
`)
        .action(async (opts) => {
            await runGenContract(opts.name, opts);
        });
}
