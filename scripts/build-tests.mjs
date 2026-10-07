import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync(".test-build", { recursive: true });
const entry = [
  "export * from '../src/app/shared/models';",
  "export * from '../src/app/core/persistence/persistence';",
  "export * from '../src/app/core/persistence/validation';",
  "export * from '../src/app/shared/domain/relations';",
  "export * from '../src/app/core/backup/backup';",
  "export * from '../src/app/shared/domain/flashcard';",
  "export * from '../src/app/shared/domain/study-plan';",
  "export * from '../src/app/features/review/domain/review-schedule';",
  "export * from '../src/app/shared/domain/study-history';",
  "export * from '../src/app/shared/domain/progress';",
  "export * from '../src/app/shared/utils/study-clock';",
  "export * from '../src/app/core/notifications/reminders';",
  "export * from '../src/app/core/notifications/reminder-policy';",
  "export * from '../src/app/features/home/domain/onboarding';",
  "export * from '../src/app/shared/domain/subject-selectors';",
  "export * from '../src/app/core/persistence/sync';",
  "export * from '../src/app/core/auth/account';",
  "export * from '../src/app/core/i18n/i18n.service';",
  "export * from '../src/app/core/state/study-store';",
  "export * from '../src/app/core/application/study-repository';",
  "export * from '../src/app/features/review/application/review-store';",
  "export * from '../src/app/features/history/application/calendar-store';",
  "export * from '../src/app/features/subjects/application/subject-navigation';",
  "export * from '../src/app/core/auth/account-service';",
].join("");
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
