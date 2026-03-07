import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const distDir = path.join(root, "dist");

const copyTarget = (relativePath) => {
  const src = path.join(publicDir, relativePath);
  const dest = path.join(distDir, relativePath);
  if (!fs.existsSync(src)) return;

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(src, dest, { recursive: true, force: true });
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
};

copyTarget(".nojekyll");
copyTarget(".well-known");
