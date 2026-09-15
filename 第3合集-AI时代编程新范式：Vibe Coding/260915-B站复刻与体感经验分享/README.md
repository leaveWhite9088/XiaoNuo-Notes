# 260915-B站复刻与体感经验分享

让 10 个大模型分别用两种方式（一次性指令直出 / 对抗性审查多轮）复刻 B 站首页，再统一比较页面效果、关键操作、稳定性和代码质量。配套 B 站视频使用。

## 目录说明

- `one-shot/`：10 个模型“一次性指令直出”的冻结成品代码。
- `adversarial/`：10 个模型“对抗性审查多轮结果”的冻结成品代码。
- `evaluation/`：统一评分数据、静态榜单（`index.html`）和实机演示导演台（双击 `evaluation/启动实机演示.command`，Windows 见 `Windows使用说明.txt`）。
- `提示词与要求.md`：两种实验方式使用的完整提示词，可直接复制重跑。
- `启动要求.md`：实验的端口规划。

## 重要：大体积图片和视频没有上传

本项目原始体积约 660MB，其中约 440MB 是图片和视频素材，超出 GitHub 合理的推送体积，因此**以下媒体文件已在仓库中移除**（代码、评分数据、文档全部保留）。大多数人只看榜单即可——榜单文字数据完整，不恢复任何东西也能正常浏览评分、排名、差值对比和模型详情：

1. **参赛样本内的视频**（约 173MB）：`one-shot/`、`adversarial/` 各样本 `public/videos/`、`media/videos/` 等目录下的 `.mp4` / `.webm` 文件。
2. **评测截图**（约 194MB）：`evaluation/assets/`（榜单页面墙、双屏对比用图）和 `evaluation/blind/`（匿名评审截图）下的大图。
3. **样本自检截图**：各样本 `artifacts/`、`screenshots/`、`selfcheck/`、`tmp-verify/` 等目录中大于 300KB 的 `.png`。
4. **构建产物**：各样本的 `dist/` 目录。需要运行某个样本时，进入对应目录按该样本自带的 README 执行 `npm install` 和 `npm run build` 即可重新生成。

另外，样本中从 B 站抓取的真实封面和头像（`covers/`、`avatars/`、`faces/` 等目录的 `.jpg`，原约 185MB）**已统一压缩**：最长边缩到 640–800px、JPEG 质量 70–78，压缩后约 40MB。页面显示效果基本无差别；如需原图，按 `raw-seed.json` / 数据库中的 BV 号或 UID 从 B 站重新抓取即可。

### 移除后的影响

- 静态榜单 `evaluation/index.html` 的页面墙、双屏对比和图片放大会显示“暂未同步”或缺图；评分、排名、优缺点等文字数据不受影响。
- 参赛样本页面内的视频无法播放；封面和头像保留（已压缩），代码和数据库种子数据完整。`dist/` 已删除的样本需先 `npm install && npm run build` 再启动。

### 如何恢复这些资源

**方式一：完整重跑实验（恢复一切，含样本视频）**

1. 打开 `提示词与要求.md`，复制对应方式（one-shot / adversarial）的提示词，分别发给要测试的模型。
2. 每种方式总执行时间控制在约 30 分钟，端口分配参照 `启动要求.md` 与 `evaluation/data/live-manifest.json`。
3. 样本中的视频是模型自行下载的公开测试片（Big Buck Bunny / Sintel / Jellyfish 等），也可手动从 https://test-videos.co.uk 或 Blender 官方素材站重新下载后放回对应目录；封面和头像按样本数据中的 BV 号重新抓取即可。

**方式二：只恢复评测截图（不重跑实验）**

1. 按 `evaluation/README.md` 启动实机导演台，逐个启动 20 个样本。
2. 用 `evaluation/scripts/collect-sample.mjs`（需 Node.js 20+ 和 Playwright，先把脚本顶部的 `PROJECT_ROOT` 改成本机项目路径）自动采集截图；或手动按 1440×900 视口截图。
3. 截图放回 `evaluation/assets/<one-shot|adversarial>/<模型名>/`，文件名与 `evaluation/data/results.json` 中 `scenes[].image` 对应即可，榜单会自动恢复显示。

**方式三：只要榜单能看**

榜单文字数据完整，不恢复图片也能正常浏览评分、排名、差值对比和模型详情。

## 注意

- `one-shot/` 和 `adversarial/` 下的 20 个样本是冻结输入，除上述被移除的媒体文件外，代码保持原样，未做任何修改。
- 评分数据来源：`evaluation/data/results.json`（`results.js` 是其同步副本）。
- 更多规则和验证记录见 `AGENTS.md` 与 `evaluation/internal/`。
