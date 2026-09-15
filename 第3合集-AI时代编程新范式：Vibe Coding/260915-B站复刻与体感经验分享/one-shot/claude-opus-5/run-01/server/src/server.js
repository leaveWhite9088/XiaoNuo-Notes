import { createApp } from './app.js';
import { config } from './config.js';
import { datasetMeta } from './data/dataset.js';

const app = createApp();

app.listen(config.port, config.host, () => {
  console.log('─────────────────────────────────────────────');
  console.log(` bilibili clone API  →  http://${config.host}:${config.port}`);
  console.log(` 数据集: ${datasetMeta.videoCount} 个稿件 / ${datasetMeta.channelCount} 个分区`);
  console.log(` 健康检查: http://${config.host}:${config.port}/api/health`);
  console.log('─────────────────────────────────────────────');
});
