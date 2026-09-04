import { readdirSync, readFileSync } from "node:fs";

const input = process.argv[2] || process.env.PAGES_URL;
if (!input) throw new Error("Usage: node scripts/verify-deployment.mjs <GitHub Pages URL>");

const base = new URL(input.endsWith("/") ? input : `${input}/`);
const documentChecks = [
  ["", "text/html", "Haoyu Chen’s Portfolio"],
  ["gallery/", "text/html", "GALLERY"],
  ["sound/", "text/html", "SOUND"],
  ["video/", "text/html", "VIDEO"],
  ["website/", "text/html", "WEBSITE"],
  ["communication/", "text/html", "Communication"],
  ["projects/chicken-flavor/", "text/html", "Chicken Flavor"],
  ["projects/rick-roll-prank/", "text/html", "Rick Roll Prank"],
];
const localAssetPaths = new Set(["assets/book-closed.png", "assets/book-hub.png", "og.png"]);

for (const category of ["gallery", "sound", "video", "website"]) {
  const projects = JSON.parse(readFileSync(new URL(`../src/content/${category}.json`, import.meta.url), "utf8"));
  for (const project of projects.filter((entry) => entry.status === "published")) {
    documentChecks.push([`${category}/${project.slug}/`, "text/html", project.title]);
    for (const value of [project.thumbnail, project.mediaUrl, project.audioUrl, ...(project.images || [])]) {
      if (value?.startsWith("/")) localAssetPaths.add(value.slice(1));
    }
  }
}

function collectFiles(relativeDirectory) {
  const results = [];
  const visit = (directory, prefix) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relative = `${prefix}${entry.name}`;
      const child = new URL(encodeURIComponent(entry.name) + (entry.isDirectory() ? "/" : ""), directory);
      if (entry.isDirectory()) visit(child, `${relative}/`);
      else results.push(relative);
    }
  };
  visit(new URL(`../public/${relativeDirectory}/`, import.meta.url), `${relativeDirectory}/`);
  return results;
}

for (const file of [...collectFiles("media"), ...collectFiles("projects")]) localAssetPaths.add(file);

const contentTypes = new Map([
  [".html", "text/html"], [".css", "text/css"], [".js", "text/javascript"],
  [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".png", "image/png"], [".webp", "image/webp"],
  [".mp3", "audio/"], [".wav", "audio/"], [".mp4", "video/"], [".woff2", "font/"],
]);

const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function runChecks() {
  const failures = [];
  for (const [path, expectedType, expectedText] of documentChecks) {
    const url = new URL(path, base);
    url.searchParams.set("deployment-check", Date.now());
    try {
      const response = await fetch(url, { redirect: "follow", headers: { "Cache-Control": "no-cache" } });
      const type = response.headers.get("content-type") || "";
      const text = expectedText ? await response.text() : "";
      const encodedExpected = expectedText?.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      if (!response.ok || !type.startsWith(expectedType) || (expectedText && !text.includes(expectedText) && !text.includes(encodedExpected))) {
        failures.push(`${path || "/"}: HTTP ${response.status}, ${type || "no content type"}`);
      }
    } catch (error) {
      failures.push(`${path || "/"}: ${error.message}`);
    }
  }

  for (const path of localAssetPaths) {
    const extension = path.slice(path.lastIndexOf(".")).toLowerCase();
    const expectedType = contentTypes.get(extension) || "application/";
    const isMedia = [".mp3", ".wav", ".mp4"].includes(extension);
    const assetUrl = new URL(path.split("/").map(encodeURIComponent).join("/"), base);
    assetUrl.searchParams.set("deployment-check", Date.now());
    try {
      const response = await fetch(assetUrl, {
        method: isMedia ? "GET" : "HEAD",
        headers: isMedia ? { Range: "bytes=0-1023", "Cache-Control": "no-cache" } : { "Cache-Control": "no-cache" },
      });
      const type = response.headers.get("content-type") || "";
      const bytes = isMedia ? (await response.arrayBuffer()).byteLength : 0;
      if (!response.ok || !type.startsWith(expectedType) || (isMedia && (response.status !== 206 || bytes !== 1024))) {
        failures.push(`${path}: HTTP ${response.status}, ${type || "no content type"}${isMedia ? `, ${bytes} bytes` : ""}`);
      }
    } catch (error) {
      failures.push(`${path}: ${error.message}`);
    }
  }
  return failures;
}

let lastFailures = [];
for (let attempt = 1; attempt <= 12; attempt += 1) {
  lastFailures = await runChecks();
  if (!lastFailures.length) {
    console.log(`Live deployment verified: ${base.href} (${documentChecks.length} routes, ${localAssetPaths.size} local files)`);
    process.exit(0);
  }
  console.warn(`Deployment check ${attempt}/12 failed:\n- ${lastFailures.join("\n- ")}`);
  if (attempt < 12) await pause(5000);
}
throw new Error(`GitHub Pages did not become healthy:\n- ${lastFailures.join("\n- ")}`);
