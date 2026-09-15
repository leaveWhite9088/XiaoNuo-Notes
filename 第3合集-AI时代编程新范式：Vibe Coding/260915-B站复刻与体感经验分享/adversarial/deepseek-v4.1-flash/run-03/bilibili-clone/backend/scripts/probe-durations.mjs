/**
 * 探测演示播放源的真实时长，产出 data/clip-durations.json。
 *
 * 优先使用 ffprobe；没有 ffprobe 时回退到内置的 MP4 mvhd 解析器
 * （不需要任何第三方依赖，保证 seed 在纯净环境也能得到真实时长）。
 *
 *   node scripts/probe-durations.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VIDEO_DIR = path.join(ROOT, 'public', 'media', 'videos');
const OUT = path.join(ROOT, 'data', 'clip-durations.json');

/** 纯 JS 解析 MP4 moov/mvhd 得到时长（秒） */
function mp4DurationFromBuffer(buf) {
  const idx = buf.indexOf(Buffer.from('mvhd'));
  if (idx < 0) return null;
  const version = buf.readUInt8(idx + 4);
  if (version === 1) {
    const timescale = buf.readUInt32BE(idx + 24);
    const duration = Number(buf.readBigUInt64BE(idx + 28));
    return timescale ? duration / timescale : null;
  }
  const timescale = buf.readUInt32BE(idx + 16);
  const duration = buf.readUInt32BE(idx + 20);
  return timescale ? duration / timescale : null;
}

function hasFfprobe() {
  try {
    execFileSync('ffprobe', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function probe(file) {
  const full = path.join(VIDEO_DIR, file);
  if (hasFfprobe()) {
    try {
      const out = execFileSync(
        'ffprobe',
        ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', full],
        { encoding: 'utf8' },
      ).trim();
      const value = Number.parseFloat(out);
      if (Number.isFinite(value) && value > 0) return { duration: value, method: 'ffprobe' };
    } catch {
      /* 回退到内置解析 */
    }
  }
  const parsed = mp4DurationFromBuffer(fs.readFileSync(full));
  if (parsed) return { duration: parsed, method: 'mvhd' };
  throw new Error(`无法解析视频时长: ${file}`);
}

function main() {
  const files = fs.readdirSync(VIDEO_DIR).filter((f) => f.endsWith('.mp4')).sort();
  if (!files.length) {
    console.error('✖ public/media/videos 下没有 mp4，请先执行 npm run fetch-data');
    process.exit(1);
  }

  const durations = {};
  const methods = new Set();
  for (const file of files) {
    const { duration, method } = probe(file);
    // 保留 3 位小数（ffprobe 精度），弹幕时间轴以毫秒计算
    durations[file] = Math.round(duration * 1000) / 1000;
    methods.add(method);
    console.log(`✔ ${file} -> ${durations[file]}s (${method})`);
  }

  fs.writeFileSync(OUT, `${JSON.stringify(durations, null, 2)}\n`);
  console.log(`✔ 写入 data/clip-durations.json（${files.length} 个播放源，探测方式: ${[...methods].join('/')}）`);
}

main();
