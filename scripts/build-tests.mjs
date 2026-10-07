import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync(".test-build", { recursive: true });
const entry = `export * from '../src/app/platform/study-clock-service';export * from '../src/app/models';export * from '../src/app/data/persistence';export * from '../src/app/data/validation';export * from '../src/app/data/relations';export * from '../src/app/backup';export * from '../src/app/flashcard';export * from '../src/app/study-plan';export * from '../src/app/review-schedule';export * from '../src/app/study-history';export * from '../src/app/progress';export * from '../src/app/study-clock';export * from '../src/app/reminders';export * from '../src/app/reminder-policy';export * from '../src/app/onboarding';export * from '../src/app/subject-selectors';export * from '../src/app/sync';export * from '../src/app/account';export * from '../src/app/i18n.service';export * from '../src/app/data/study-store';export * from '../src/app/data/study-repository';export * from '../src/app/data/review-store';export * from '../src/app/data/calendar-store';export * from '../src/app/data/subject-navigation';export * from '../src/app/data/account-service';`;
writeFileSync(".test-build/entry.ts", entry);
await build({
  entryPoints: [".test-build/entry.ts"],
  outfile: ".test-build/index.mjs",
  bundle: true,
  format: "esm",
  platform: "node",
  packages: "external",
  sourcemap: true,
  tsconfigRaw: { compilerOptions: { experimentalDecorators: true } },
});
