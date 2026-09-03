import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const content = async (category) => JSON.parse(await read(`src/content/${category}.json`));

test("only the supplied projects remain, with real descriptions and no design samples", async () => {
  for (const [category, count] of [["gallery", 5], ["sound", 5], ["video", 3], ["website", 2]]) {
    const entries = await content(category);
    assert.equal(entries.length, count);
    assert.doesNotMatch(JSON.stringify(entries), /paperbound|between.stations|punctual.studies/i);
    assert.equal(new Set(entries.map((p) => p.slug)).size, count);
    assert.ok(entries.every((p) => p.year === "" && p.role === ""));
    if (category !== "website") assert.ok(entries.every((p) => p.description.length > 0));
    for (const entry of entries) {
      if (category === "sound") {
        assert.match(entry.audioUrl, /^\/media\/sound\/.*\.(?:mp3|wav)$/);
        assert.equal(entry.thumbnail, "");
        assert.equal(entry.mediaUrl, "");
        await access(new URL(`public${entry.audioUrl}`, root));
      }
      if (category === "website") await access(new URL(`public${entry.localProjectPath}index.html`, root));
    }
  }
});

test("gallery uses creative titles, merged MENU artwork, and the supplied poster", async () => {
  const gallery = await content("gallery");
  assert.deepEqual(gallery.map((p) => p.title), [
    "AI Intimacy",
    "Red Pill Blue Pill",
    "Fragmented Balance",
    "MENU",
    "My Way Poster",
  ]);
  assert.equal(gallery.find((p) => p.slug === "part-2").images.length, 2);
  assert.ok(gallery.every((p) => !/400428379|^3BB3 Assignment 1A$|^Assignment 2$|^Part 2/i.test(p.title)));
  await access(new URL("public/media/gallery/my-way-poster/artwork.jpg", root));
});

test("new sound source is real, local, and uses the supplied two-minute WAV", async () => {
  const sounds = await content("sound");
  const project = sounds.find((p) => p.slug === "frozen-memory-fragments");
  assert.equal(project.title, "Frozen Memory Fragments");
  assert.equal(project.duration, "02:03");
  assert.equal(project.audioUrl, "/media/sound/frozen-memory-fragments/source.wav");
  await access(new URL(`public${project.audioUrl}`, root));
});

test("videos retain the three supplied YouTube IDs and omit unsupported metadata", async () => {
  const videos = await content("video");
  assert.deepEqual(videos.map((p) => new URL(p.videoUrl).searchParams.get("v")), ["tgAvqiOQpwI", "1U5_0xIa5lE", "aMmWzwL30Ic"]);
  assert.ok(videos.every((p) => p.course === "" && p.duration === ""));
});

test("unverified personal/contact information is empty instead of fabricated", async () => {
  const communication = await content("communication");
  assert.ok(Object.entries(communication).every(([key, value]) => key === "status" || value === ""));
});

test("production contains neither samples nor simulated sound/video playback", async () => {
  const app = await read("src/App.jsx");
  assert.doesNotMatch(app, /createOscillator|AudioContext|setInterval/);
  assert.match(app, /allowFullScreen/);
  for (const route of ["sound/paperbound-sound", "sound/between-stations", "video/paperbound-journey", "website/paperbound-web", "website/punctual-studies"]) {
    await assert.rejects(access(new URL(`dist/${route}/index.html`, root)), { code: "ENOENT" });
  }
});
