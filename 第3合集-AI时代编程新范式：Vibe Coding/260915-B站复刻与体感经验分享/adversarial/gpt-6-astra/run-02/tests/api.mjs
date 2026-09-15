import assert from "node:assert/strict";
const root = "http://127.0.0.1:3302";
const get = async (path) => {
  const r = await fetch(root + path);
  assert.equal(r.status, 200, path);
  return r.json();
};
const health = await get("/api/health");
assert.equal(health.port, 5302);
const home = await get("/api/home");
assert.equal(home.total, 24);
assert.equal(home.videos.length, 20);
assert.equal(home.hasMore, true);
const second = await get("/api/home?page=2");
assert.equal(second.videos.length, 4);
assert.equal(second.hasMore, false);
assert.ok(second.videos.every((v) => !home.videos.some((h) => h.id === v.id)));
const filtered = await get("/api/home?category=" + encodeURIComponent("美食"));
assert.equal(filtered.total, 2);
assert.ok(filtered.videos.every((v) => v.category === "美食"));
const suggestions = await get(
  "/api/search/suggestions?q=" + encodeURIComponent("猫咪"),
);
assert.equal(suggestions.length, 1);
const searched = await get("/api/home?q=" + encodeURIComponent("猫咪"));
assert.equal(searched.total, 1);
const detail = await get("/api/videos/" + searched.videos[0].id);
assert.equal(detail.related.length, 8);
assert.ok(!detail.related.some((v) => v.id === detail.id));
assert.match(detail.media, /\.mp4$/);
assert.equal((await fetch(root + "/api/videos/missing")).status, 404);
assert.equal((await get("/api/home?q=none-xyz")).total, 0);
assert.equal((await fetch(root + "/video/" + detail.id)).status, 200);
console.log(
  "PASS: API health, proxy 3302 → 5302, 24 videos, pagination, category, suggestions, search, detail, related, 404, SPA deep link.",
);
const checks = await Promise.all(
  home.videos.slice(0, 6).map(async (v) => {
    const r = await fetch(root + v.cover, {
      method: "HEAD",
      signal: AbortSignal.timeout(20000),
    });
    assert.equal(r.status, 200, v.cover);
    assert.match(r.headers.get("content-type"), /image\//);
    return v.id;
  }),
);
console.log(
  "PASS: " +
    checks.length +
    " first-screen local photographs respond with image content.",
);
for (const media of [...new Set(home.videos.map((v) => v.media))]) {
  const r = await fetch(root + media, {
    headers: { Range: "bytes=0-1023" },
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(r.status, 206);
  assert.match(r.headers.get("content-type"), /video\/mp4/);
  const bytes = await r.arrayBuffer();
  assert.equal(bytes.byteLength, 1024);
  console.log(
    "PASS: MP4 range request 206, 1024 bytes: " + media.split("/").pop(),
  );
}
