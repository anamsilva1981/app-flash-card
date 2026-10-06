// Compatibility entry point; the suite is organized by domain under tests/unit.
import { spawnSync } from "node:child_process";
const result = spawnSync("npm", ["test"], { stdio: "inherit" });
process.exitCode = result.status ?? 1;
