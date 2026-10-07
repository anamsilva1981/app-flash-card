import { build } from "esbuild";
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

mkdirSync(".test-build", { recursive: true });

const entry = `export * from '../src/app/core/models';export * from '../src/app/core/data/persistence';export * from '../src/app/core/data/validation';export * from '../src/app/core/domain/subjects/relations';export * from '../src/app/core/backup';export * from '../src/app/core/domain/cards/flashcard';export * from '../src/app/core/domain/study-plan/study-plan';export * from '../src/app/core/domain/review/review-schedule';export * from '../src/app/core/domain/history/study-history';export * from '../src/app/core/domain/progress/progress';export * from '../src/app/core/domain/time/study-clock';export * from '../src/app/core/reminders';export * from '../src/app/core/reminder-policy';export * from '../src/app/core/domain/onboarding/onboarding';export * from '../src/app/core/domain/subjects/subject-selectors';export * from '../src/app/core/sync';export * from '../src/app/core/account';export * from '../src/app/core/i18n.service';export * from '../src/app/core/data/study-store';export * from '../src/app/core/data/study-repository';export * from '../src/app/core/data/review-store';export * from '../src/app/core/data/calendar-store';export * from '../src/app/core/data/subject-navigation';export * from '../src/app/core/data/account-service';`;
writeFileSync(".test-build/entry.ts", entry);

await build({
  entryPoints: [".test-build/entry.ts"],
  outfile: ".test-build/index.mjs",
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
  sourcemap: true,
  tsconfig: "tsconfig.json",
});

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const full = join(dir, item.name);
    return item.isDirectory() ? walk(full) : [full];
  });

const componentSpecs = walk("src/app")
  .filter((file) => file.endsWith(".component.spec.ts"))
  .sort();
const componentEntry = componentSpecs
  .map((file) => `import '../${relative(".", file).replaceAll("\\\\", "/")}';`)
  .join("\n");
writeFileSync(".test-build/component-specs-entry.ts", componentEntry);

await build({
  entryPoints: [".test-build/component-specs-entry.ts"],
  outfile: ".test-build/component-specs.mjs",
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
  sourcemap: true,
  tsconfig: "tsconfig.json",
});
