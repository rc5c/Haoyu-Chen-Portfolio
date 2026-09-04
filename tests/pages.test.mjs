import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { normalizeBase, withBase, withoutBase } from "../src/base-path.mjs";
const root = new URL("../", import.meta.url);
const read = (file) => readFile(new URL(file, root), "utf8");

test("base helpers support root, repository subpaths, direct entries and external links", () => {
  assert.equal(normalizeBase("/portfolio"), "/portfolio/");
  assert.equal(withBase("/media/photo.jpg", "/portfolio/"), "/portfolio/media/photo.jpg");
  assert.equal(withBase("/", "/portfolio/"), "/portfolio/");
  assert.equal(withBase("https://youtu.be/tgAvqiOQpwI", "/portfolio/"), "https://youtu.be/tgAvqiOQpwI");
  assert.equal(withBase("mailto:person@example.com", "/portfolio/"), "mailto:person@example.com");
  assert.equal(withBase("", "/portfolio/"), "");
  assert.equal(withoutBase("/portfolio/gallery/a/index.html", "/portfolio/"), "/gallery/a");
  assert.equal(withoutBase("/portfolio/gallery/", "/portfolio/"), "/gallery");
  assert.equal(withoutBase("/portfolio", "/portfolio/"), "/");
  assert.equal(withoutBase("/portfolio-other/gallery", "/portfolio/"), "/not-found");
  assert.equal(withoutBase("/gallery/", "/"), "/gallery");
  assert.throws(() => normalizeBase("https://example.com/"));
});

test("production routes and bundled assets use the configured deployment base", async () => {
  const base = normalizeBase(process.env.PAGES_BASE_PATH || "/");
  const files = [
    "dist/index.html",
    "dist/gallery/human-ai-love/index.html",
    "dist/gallery/my-way-poster/index.html",
    "dist/sound/backyard-bbq/index.html",
    "dist/sound/frozen-memory-fragments/index.html",
    "dist/404.html",
  ];
  for (const file of files) {
    const html = await read(file);
    for (const [, url] of html.matchAll(/(?:src|href)="(\/[^\"]+)"/g)) {
      assert.ok(url.startsWith(base), `${file}: ${url} missing base ${base}`);
      await access(new URL(`dist/${url.slice(base.length)}`, root));
    }
  }
  assert.match(await read("dist/gallery/human-ai-love/index.html"), /<title>AI Intimacy — Haoyu Chen’s Portfolio<\/title>/);
  assert.match(await read("dist/gallery/my-way-poster/index.html"), /<title>My Way Poster — Haoyu Chen’s Portfolio<\/title>/);
  assert.match(await read("dist/sound/frozen-memory-fragments/index.html"), /<title>Frozen Memory Fragments — Haoyu Chen’s Portfolio<\/title>/);
  assert.match(await read("dist/sound/backyard-bbq/index.html"), /property="og:image"/);
  const scripts = (await readdir(new URL("dist/assets/", root))).filter((file) => file.endsWith(".js"));
  const productionJs = (await Promise.all(scripts.map((file) => read(`dist/assets/${file}`)))).join("\n");
  assert.match(productionJs, /rcsz295@outlook\.com/);
  assert.match(productionJs, /mailto:/);
  await access(new URL("dist/.nojekyll", root));
  await assert.rejects(access(new URL("dist/server", root)));
  await assert.rejects(access(new URL("dist/.openai", root)));
});

test("standalone website folders keep every local reference together", async () => {
  for (const name of ["chicken-flavor", "rick-roll-prank"]) {
    const html = await read(`dist/projects/${name}/index.html`);
    const references = [...html.matchAll(/(?:src=|url\()["'](\.\/[^"']+)/g)].map((match) => match[1]);
    for (const reference of references) await access(new URL(reference, new URL(`dist/projects/${name}/index.html`, root)));
    assert.doesNotMatch(html, /(?:src|href)=["']\/(?!\/)/);
    assert.doesNotMatch(html, /file:\/\/|\/Users\//);
    if (name === "rick-roll-prank") assert.equal((await readdir(new URL(`dist/projects/${name}/video/`, root))).filter((f) => f.endsWith(".mp4")).length, 7);
  }
});
