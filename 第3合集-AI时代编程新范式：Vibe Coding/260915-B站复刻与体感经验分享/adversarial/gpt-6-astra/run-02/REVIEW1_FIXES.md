# Review 1 修复与 Dev 自检

2026-09-12，原 Dev 独立完成。以下是开发自检结果，不替代外部唯一 Reviewer 的重审结论。

本轮属于前端模块内修复，涉及首页状态、详情交互、响应式样式及测试文档；后端接口、端口与数据协议不变。没有调用子代理、Reviewer、设计/架构/worker 或其他模型。浏览器任务空间只是当前 Dev 的 Chromium 操作会话。

## 问题对应

| Review 项 | 修复位置 | 处理与验收证据 |
| --- | --- | --- |
| 1 旧分页污染 | `src/App.jsx:657`、`src/App.jsx:694` | 请求带 AbortSignal，并同时核对请求代次；切换历史条目卸载旧首页，换一换立即使旧请求失效。真实响应故意延迟且忽略取消后，分类仍为 2 条、搜索仍为 1 条、换一换仍为 20 条，分页状态不变。 |
| 2 建议索引越界 | `src/App.jsx:169`、`src/App.jsx:292` | 输入、建议更新、关闭和清空时重置索引；忽略已取消的建议响应；提交时检查面板状态和候选值，回退到当前输入。浏览器六项旧建议缩至一项后 Escape/Enter、清空再 Enter 均无异常。 |
| 3 草稿串视频 | `src/App.jsx:128`、`src/App.jsx:868` | 详情按视频路径重建，同时明确清空评论、弹幕草稿。浏览器填入两份草稿后切换关联视频，两者均为空，无误发布。 |
| 4 后退丢列表 | `src/App.jsx:90`、`src/App.jsx:613`、`src/App.jsx:634` | App 实例内按浏览历史 entry key 保存数据、刷新顺序和滚动位置；在布局阶段恢复，禁止浏览器原生恢复与应用恢复相互竞争。24 条顺序完全一致，滚动 650 → 650.5 CSS px；分类与搜索条目也恢复原结果。 |
| 5 焦点逃出弹窗 | `src/App.jsx:1137`、`src/App.jsx:1148` | 每次 Tab 从当前可见、启用、可聚焦控件重新计算循环目标；统一处理正反向，稳定关闭回调并保留原入口。昵称提交禁用/启用、空反馈表单及 Escape 恢复均通过真实键盘验证。 |
| 6 窄屏入口丢失 | `src/App.jsx:387`、`src/App.jsx:462`、`src/App.jsx:1247`、`src/style.css:1576` | 新增功能菜单，包含收藏、历史及其他已有入口；更多分区包含完整 23 项。375px 页面无横向溢出，收藏与历史可打开，隐藏的动物圈可筛选。 |
| 7 相同弹幕不重播 | `src/App.jsx:852`、`src/App.jsx:957`、`src/App.jsx:993` | 每次发送使用独立递增标识作为 React key，文本不再承担展示身份。两次相同文本分别产生 id 1、2，均实际进入播放器可视区域。 |
| 8 浏览器验收不足 | `scripts/browser-review1.mjs`、`tests/review1.test.jsx` | 增加可重放 Chromium 浏览器测试和 jsdom 回归；移除原测试中无意义的 loadedMetadata 模拟。13 组浏览器检查、14 项组件测试、API 检查和生产构建全部通过。 |
| 9 图片与媒体失败说明不符 | `src/App.jsx:74`、`README.md:77` | 卡片封面/头像失败替换占位图，不承诺图片重试；媒体失败单独显示重新加载。实际制造图片 404 不出现媒体错误，制造视频 404 出现错误层，恢复有效媒体并重试可恢复就绪。 |

## 实际运行结果

- `npm test`：2 个文件，14 项通过，3.48 秒。
- `npm run check:api`：首页、分页、分类、搜索建议、详情、关联、404、SPA 路径和 3302 → 5302 代理通过；6 张图片响应通过；两段媒体的 206 / 1024 字节分段通过。
- `npm run build`：Vite 7.3.6，1589 个模块，构建成功；JS 212.70 kB / gzip 71.12 kB，CSS 26.29 kB / gzip 6.48 kB。
- 真实 Chromium：13 组检查全部通过，原始断言保存在 [browser-results.json](artifacts/review1/browser-results.json)。测试分段恢复在同一个浏览器任务空间执行。
- Sintel：点击原生播放键后时间增长至 1.029 秒、解码 29 帧；暂停并用鼠标拖动原生进度条至 31.568908 秒，保持暂停且时间稳定，无媒体错误。
- Flower：点击原生播放键后时间增长至 1.076 秒、解码 37 帧；暂停并拖动至 3.056616 秒，保持暂停且时间稳定，无媒体错误。

## 截图

- [桌面首页与 hover](artifacts/review1/desktop.png)
- [后退恢复列表](artifacts/review1/restored-feed.png)
- [第二次同文弹幕](artifacts/review1/repeat-danmaku.png)
- [Sintel 原生拖动结果](artifacts/review1/player-sintel.png)
- [Flower 原生拖动结果](artifacts/review1/player-flower.png)
- [媒体失败提示](artifacts/review1/media-error.png)
- [375px 功能菜单](artifacts/review1/mobile-menu.png)
- [完整分区入口](artifacts/review1/mobile-categories.png)
- [375px 筛选结果](artifacts/review1/mobile.png)

Dev 已逐张查看桌面、窄屏功能菜单、完整分类、筛选结果和两段视频拖动后的截图。

## 启动与复验

当前前端 http://localhost:3302，后端 http://localhost:5302。常规启动方式仍为 `npm run dev`，脚本、代理与 README 端口一致。

```bash
npm test
npm run check:api
npm run build
npm run check:browser
```

浏览器复验需要已安装 ego-browser。原生控件鼠标拖动坐标按本次 Chromium 布局计算；尚未验证其他浏览器或真实移动设备，没有人工听辨音轨内容。恢复首页状态限当前 App 会话；硬刷新仍会重新查询数据。演示账号、上传和支付简化项保持 README 中的明确说明。

本轮耗时约 16 分钟，主要用于竞态回归和真实浏览器操作；子代理与其他模型调用均为 0。修复和自检完成后停止，等待同一 Reviewer 重审。
