import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join } from "node:path";

const root = "src/app";
const legacyRoots = ["src/app/core/data/"];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function isLegacy(file) {
  return legacyRoots.some((legacyRoot) => file.startsWith(legacyRoot));
}

function isDomainRule(file) {
  if (!file.includes("/domain/") || extname(file) !== ".ts") return false;
  if (
    file.endsWith(".spec.ts") ||
    file.endsWith("index.ts") ||
    file.endsWith("public-api.ts")
  )
    return false;
  const source = readFileSync(file, "utf8").trim();
  const lines = source.split(/\r?\n/).filter(Boolean);
  const onlyReexport =
    lines.length <= 2 && lines.every((line) => line.startsWith("export "));
  return !onlyReexport;
}

function requiresColocatedSpec(file) {
  if (isLegacy(file)) return false;
  if (!file.endsWith(".ts") || file.endsWith(".spec.ts")) return false;
  const name = file.split("/").at(-1);
  return (
    name.endsWith(".component.ts") ||
    name.endsWith(".facade.ts") ||
    name.endsWith("-store.ts") ||
    name.endsWith(".store.ts") ||
    name.endsWith("-service.ts") ||
    name.endsWith(".service.ts") ||
    name.endsWith("-repository.ts") ||
    name.endsWith(".repository.ts") ||
    name.endsWith("-navigation.ts") ||
    name.endsWith(".navigation.ts") ||
    isDomainRule(file)
  );
}

const candidates = walk(root).filter(requiresColocatedSpec);
const missing = candidates.filter(
  (file) => !existsSync(file.replace(/\.ts$/, ".spec.ts")),
);

if (missing.length) {
  console.error("Cobertura estrutural de testes incompleta:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log(
  `Cobertura estrutural OK: ${candidates.length} unidades possuem spec colocalizado.`,
);
