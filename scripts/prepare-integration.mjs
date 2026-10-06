import { mkdirSync, copyFileSync, writeFileSync, readFileSync } from "node:fs";
const folder = "tests/integration/backend/supabase";
mkdirSync(folder + "/migrations", { recursive: true });
mkdirSync(folder + "/functions/delete-account", { recursive: true });
for (const file of [
  "20261005154046_private_account_studies.sql",
  "20261006095921_atomic_account_batch.sql",
])
  copyFileSync("supabase/migrations/" + file, folder + "/migrations/" + file);
copyFileSync(
  "supabase/functions/delete-account/index.ts",
  folder + "/functions/delete-account/index.ts",
);
writeFileSync(
  folder + "/config.toml",
  readFileSync("tests/integration/backend-config.toml", "utf8"),
);
