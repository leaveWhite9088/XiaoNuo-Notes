# 通用样本采集脚本

`collect-sample.mjs` 在已有的 ego-browser TaskSpace 中复用 `p1`，为一个成品采集统一的八张截图和一份 evidence JSON。脚本不会启动参评项目，也不会写入参评项目目录。

把 `frontUrl`、`mode`、`model` 和 `taskSpaceId` 换成当前样本的值。ego-browser 的 Node 进程工作目录不固定，因此使用项目绝对路径导入脚本：

```bash
ego-browser nodejs -e '
const { run } = await import("file:///Users/mumuxsy/Desktop/临时工作目录/video-260909-B站首页制作/evaluation/scripts/collect-sample.mjs");
await run({
  frontUrl: "http://localhost:3301",
  mode: "one-shot",
  model: "gpt-6-astra",
  taskSpaceId: 7
});
'
```

也可以把这段 `run({...})` 调用粘贴到已在 TaskSpace 7 中运行的 `ego-browser nodejs` 会话里。脚本固定使用 `p1`、1440×900 和 100% 设备像素比；每个步骤失败都会写入 `checks.<step>.pass=false` 并继续采集后续步骤。

输出位置：

- `evaluation/assets/<mode>/<model>/home.png`
- `evaluation/assets/<mode>/<model>/feed.png`
- `evaluation/assets/<mode>/<model>/hover.png`
- `evaluation/assets/<mode>/<model>/menu.png`
- `evaluation/assets/<mode>/<model>/search-suggest.png`
- `evaluation/assets/<mode>/<model>/search-results.png`
- `evaluation/assets/<mode>/<model>/category.png`
- `evaluation/assets/<mode>/<model>/video.png`
- `evaluation/evidence/<mode>/<model>.json`

脚本只清除目标 localhost origin 的 `local_storage`、`session_storage`、`indexeddb`、`cache_storage` 和 `service_workers`，不清除 cookie，也不清理全局浏览器缓存。
