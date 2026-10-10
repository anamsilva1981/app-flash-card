import {
  mkdirSync,
  copyFileSync,
  writeFileSync,
  readFileSync,
  readdirSync,
} from "node:fs";
const folder = "tests/integration/backend/supabase";
mkdirSync(folder + "/migrations", { recursive: true });
mkdirSync(folder + "/functions/delete-account", { recursive: true });
copyFileSync(
  "tests/integration/legacy-schema.sql",
  folder + "/migrations/20261004000000_legacy_schema.sql",
);
for (const file of readdirSync("supabase/migrations")
  .filter((name) => name.endsWith(".sql"))
  .sort())
  copyFileSync("supabase/migrations/" + file, folder + "/migrations/" + file);
copyFileSync(
  "supabase/functions/delete-account/index.ts",
  folder + "/functions/delete-account/index.ts",
);
writeFileSync(
  folder + "/config.toml",
  readFileSync("tests/integration/backend-config.toml", "utf8"),
);
