import express from "express";
import {
  getHome,
  getVideo,
  getSuggestions,
  categories,
} from "./services/video-service.js";
export const app = express();
app.use(express.json({ limit: "20kb" }));
app.get("/api/health", (_, res) => res.json({ status: "ok", port: 5302 }));
app.get("/api/categories", (_, res) => res.json(categories));
app.get("/api/home", (req, res) => res.json(getHome(req.query)));
app.get("/api/search/suggestions", (req, res) =>
  res.json(getSuggestions(req.query.q)),
);
app.get("/api/videos/:id", (req, res) => {
  const video = getVideo(req.params.id);
  res.status(video ? 200 : 404).json(video || { error: "视频不存在" });
});
app.use("/api", (_, res) => res.status(404).json({ error: "接口不存在" }));
