import { readdirSync, mkdirSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";

const sourceRoot = "src/app";
const outRoot = ".test-build/colocated";
rmSync(outRoot, { recursive: true, force: true });
mkdirSync(outRoot, { recursive: true });

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const specs = walk(sourceRoot).filter((file) => file.endsWith(".component.spec.ts"));
if (!specs.length) throw new Error("Nenhum spec colocalizado encontrado.");
const outputs = [];
for (const spec of specs) {
  const output = join(outRoot, relative(sourceRoot, spec)).replace(/\.ts$/, ".mjs");
  mkdirSync(output.slice(0, output.lastIndexOf("/")), { recursive: true });
  await build({
    entryPoints: [spec],
    outfile: output,
    bundle: true,
    format: "esm",
    platform: "node",
    packages: "external",
    sourcemap: true,
    tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
  });
  outputs.push(output);
}
const result = spawnSync(process.execPath, ["--test", ...outputs], { stdio: "inherit" });
if (result.status !== 0) process.exit(result.status ?? 1);
