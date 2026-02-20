import { execSync } from "node:child_process";
import { ROOT } from "./secret-scan-utils.mjs";

execSync("git config core.hooksPath .githooks", { cwd: ROOT, stdio: "inherit" });
console.log("Git hooks installed: core.hooksPath -> .githooks");
