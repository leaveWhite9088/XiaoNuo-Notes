// 后端入口：固定端口 5132（可用 PORT 环境变量覆盖）
import { createApp } from './app.js';

const PORT = Number(process.env.PORT || 5132);

createApp().listen(PORT, () => {
  console.log(`[bilibili-clone server] http://localhost:${PORT}`);
});
