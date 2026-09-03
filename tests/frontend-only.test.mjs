import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("frontend has no editor component, entry, preview override, or save middleware", async () => {
  await assert.rejects(access(new URL("src/Editor.jsx", root)), { code: "ENOENT" });
  const app = await read("src/App.jsx");
  const css = await read("src/styles.css");
  const config = await read("vite.config.mjs");
  assert.doesNotMatch(app, /EditorMode|local-editor-entry|#preview|includeDrafts/);
  assert.doesNotMatch(css, /\.editor-|\.local-editor-entry/);
  assert.doesNotMatch(config, /configureServer|writeFile|api\/editor|localContentEditor/);
});

test("all existing local project media and static category routes resolve", async () => {
  for (const category of ["gallery", "sound", "video", "website"]) {
    const projects = JSON.parse(await read(`src/content/${category}.json`));
    await access(new URL(`dist/${category}/index.html`, root));
    for (const project of projects) {
      await access(new URL(`dist/${category}/${project.slug}/index.html`, root));
      for (const url of [project.thumbnail, project.mediaUrl, project.audioUrl, project.localProjectPath, ...(project.images || [])]) {
        if (url?.startsWith("/")) await access(new URL(`public${url}`, root));
      }
    }
    if (category === "gallery") {
      assert.equal(projects.length, 5);
      assert.equal(projects.reduce((count, project) => count + project.images.length, 0), 8);
    }
    if (category === "sound") {
      assert.equal(projects.length, 5);
      assert.ok(projects.every((project) => /\.(?:mp3|wav)$/.test(project.audioUrl)));
    }
  }
  await access(new URL("dist/communication/index.html", root));
});

test("production assets contain no editing interface or save endpoint", async () => {
  const assets = await readdir(new URL("dist/assets/", root));
  for (const file of assets.filter((name) => /\.(js|css)$/.test(name))) {
    assert.doesNotMatch(await read(`dist/assets/${file}`), /Portfolio Editor|SAVE CHANGES|api\/editor|local-editor-entry|editor-live-preview/);
  }
  await assert.rejects(access(new URL("dist/editor/index.html", root)), { code: "ENOENT" });
});
