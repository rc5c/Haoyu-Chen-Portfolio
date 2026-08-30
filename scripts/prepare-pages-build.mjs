import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { normalizeBase, withBase } from "../src/base-path.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const base = normalizeBase(process.env.PAGES_BASE_PATH || "/");
const origin = process.env.PAGES_ORIGIN || "";
if (origin && new URL(origin).origin !== origin) throw new Error("PAGES_ORIGIN must be an origin without a path.");
const shell = readFileSync(path.join(dist, "index.html"), "utf8");
const escape = (text) => String(text).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const absolute = (value) => /^(https?:)?\/\//.test(value) ? value : origin + withBase(value, base);

function documentFor(title, description, image) {
  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);
  for (const [key, value] of [["og:title", title], ["twitter:title", title], ["description", description], ["og:description", description], ["twitter:description", description]]) {
    html = html.replace(new RegExp(`(<meta\\s+(?:name|property)="${key}"\\s+content=")[^"]*("\\s*\\/?>)`), `$1${escape(value)}$2`);
  }
  for (const key of ["og:image", "twitter:image"]) {
    html = html.replace(new RegExp(`<meta (?:name|property)="${key}" content="[^"]*"\\s*\\/?>`), image ? `<meta property="${key}" content="${escape(absolute(image))}" />` : "");
  }
  return html;
}

const routes = [{ route: "", title: "Haoyu Chen’s Portfolio", description: "Media arts, sound, moving image, photography, and creative code.", image: "/og.png" }, { route: "communication", title: "Communication — Haoyu Chen’s Portfolio", description: "About and contact.", image: "/og.png" }];
for (const category of ["gallery", "sound", "video", "website"]) {
  routes.push({ route: category, title: `${category.toUpperCase()} — Haoyu Chen’s Portfolio`, description: `${category.toUpperCase()} projects by Haoyu Chen.`, image: "/og.png" });
  const entries = JSON.parse(readFileSync(path.join(root, "src/content", `${category}.json`), "utf8"));
  for (const project of entries.filter((entry) => entry.status === "published")) {
    if (!/^[a-z0-9-]+$/.test(project.slug)) throw new Error(`Unsafe project slug: ${project.slug}`);
    routes.push({ route: `${category}/${project.slug}`, title: `${project.title} — Haoyu Chen’s Portfolio`, description: project.description || project.title, image: project.thumbnail || "" });
  }
}
for (const entry of routes) {
  const directory = path.join(dist, entry.route);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "index.html"), documentFor(entry.title, entry.description, entry.image));
}
writeFileSync(path.join(dist, "404.html"), documentFor("Page not found — Haoyu Chen’s Portfolio", "", ""));
writeFileSync(path.join(dist, ".nojekyll"), "");
console.log(`Prepared ${routes.length} static routes for base ${base}; no backend required.`);
