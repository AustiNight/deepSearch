import fs from "node:fs";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;

const readText = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), "utf8");

const errors = [];

const viteConfig = readText("vite.config.ts");
if (!/base:\s*['"]\/['"]/.test(viteConfig)) {
  errors.push("vite.config.ts must set base to '/'.");
}

const indexHtml = readText("index.html");
if (!/src="\/index\.tsx"/.test(indexHtml)) {
  errors.push("index.html must reference /index.tsx for GitHub Pages base.");
}
if (!/href="\/favicon\.svg"/.test(indexHtml)) {
  errors.push("index.html must reference /favicon.svg for GitHub Pages base.");
}

const notFoundPath = path.join(ROOT, "public", "404.html");
if (!fs.existsSync(notFoundPath)) {
  errors.push("public/404.html missing (required for GitHub Pages SPA routing).");
} else {
  const notFoundHtml = readText("public/404.html");
  if (!/window\.location/.test(notFoundHtml) && !/http-equiv="refresh"/i.test(notFoundHtml)) {
    errors.push("public/404.html must redirect to the SPA entry point.");
  }
}

if (errors.length > 0) {
  console.error("pages-sanity.test.mjs failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("pages-sanity.test.mjs: ok");
