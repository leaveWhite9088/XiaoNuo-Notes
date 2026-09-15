import { writeFile, mkdir } from "node:fs/promises";
import { videos, banners } from "../server/data/videos.js";
await mkdir("public/images", { recursive: true });
const paths = [
  ...new Set([...videos, ...banners].map((v) => v.cover || v.image)),
];
let cursor = 0;
async function download(path, url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`${res.status}: ${url}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await writeFile("public" + path, bytes);
  console.log("Saved " + path + " (" + bytes.length + " bytes)");
}
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (cursor < paths.length) {
      const path = paths[cursor++];
      const id = path.split("/").pop().replace(".jpg", "");
      await download(
        path,
        `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=85`,
      );
    }
  }),
);
await download(
  "/images/hero.jpg",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=90",
);
