import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const root = "src/app";
const allowedRootFiles = new Set([
  "app.facade.ts",
  "app.facade.spec.ts",
  "app.component.ts",
  "app.component.html",
  "app.component.css",
  "app.component.spec.ts",
]);
const errors = [];

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

const existsFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};

const importTarget = (file, specifier) => {
  if (!specifier.startsWith(".")) return null;
  return relative(root, resolve(dirname(file), specifier)).replaceAll(
    "\\",
    "/",
  );
};

for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && !allowedRootFiles.has(entry.name)) {
    errors.push(`Arquivo de implementação solto na raiz: ${entry.name}`);
  }
  if (
    entry.isDirectory() &&
    !["core", "features", "shared"].includes(entry.name)
  ) {
    errors.push(`Diretório inesperado na raiz de src/app: ${entry.name}`);
  }
}

for (const entry of readdirSync(join(root, "features"), {
  withFileTypes: true,
})) {
  if (!entry.isDirectory()) {
    errors.push(`features deve conter somente domínios/pastas: ${entry.name}`);
  }
}

for (const file of walk(root).filter((item) => item.endsWith(".ts"))) {
  const rel = relative(root, file).replaceAll("\\", "/");
  const content = readFileSync(file, "utf8");
  const imports = [...content.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );

  for (const specifier of imports) {
    const target = importTarget(file, specifier);
    if (!target) continue;

    if (
      rel.startsWith("shared/") &&
      (target.startsWith("core/") || target.startsWith("features/"))
    ) {
      errors.push(
        `shared não pode depender de core/features: ${rel} -> ${specifier}`,
      );
    }

    if (rel.startsWith("core/") && target.startsWith("features/")) {
      errors.push(
        `core não pode depender da UI de features: ${rel} -> ${specifier}`,
      );
    }

    const sourceFeature = rel.match(/^features\/([^/]+)\//)?.[1];
    const targetFeature = target.match(/^features\/([^/]+)\//)?.[1];
    if (
      sourceFeature &&
      targetFeature &&
      sourceFeature !== targetFeature &&
      !target.endsWith("public-api")
    ) {
      errors.push(
        `Feature deve consumir somente a API pública de outra feature: ${rel} -> ${specifier}`,
      );
    }
  }

  if (file.endsWith(".component.ts")) {
    const spec = join(dirname(file), `${basename(file, ".ts")}.spec.ts`);
    if (!existsFile(spec)) {
      errors.push(`Componente sem spec colocalizado: ${rel}`);
    }
  }
}

if (errors.length) {
  console.error("Arquitetura inválida:\n- " + errors.join("\n- "));
  process.exit(1);
}

console.log("Architecture check: OK");
