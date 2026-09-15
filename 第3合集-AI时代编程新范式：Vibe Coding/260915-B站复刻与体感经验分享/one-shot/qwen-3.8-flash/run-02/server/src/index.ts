/**
 * 后端入口：固定端口 5141。
 * 职责：/api JSON 接口 + /media 真实图片/视频静态资源。
 */
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { api } from "./routes/api.js";

const PORT = Number(process.env.PORT ?? 5141);
const PUB = path.resolve(fileURLToPath(import.meta.url), "..", "..", "public");

const app = express();
app.use(cors());
app.use((req, _res, next) => { console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${req.originalUrl}`); next(); });

app.use("/api", api);
app.use(
  "/media",
  express.static(PUB, { maxAge: "1d" }),
);
// 视频 Range 请求由 express.static 内置支持

app.use((_req, res) => res.status(404).json({ code: -404, message: "not found" }));

app.listen(PORT, () => console.log(`[bili-server] 后端已启动: http://localhost:${PORT} (前端代理目标)`));
