/**
 * B站弹幕解码工具
 *
 * 支持两种上游格式：
 *  1. 新版 seg.so → protobuf（DmSegMobileReply）
 *  2. 旧版 list.so → deflate 压缩 XML
 *
 * 这里手写一个最小 protobuf 读取器，避免为了一个字段引入 protobufjs 依赖。
 */
import zlib from 'node:zlib';
import { promisify } from 'node:util';

export const inflateRaw = promisify(zlib.inflateRaw);
export const inflate = promisify(zlib.inflate);
export const gunzip = promisify(zlib.gunzip);

/* ------------------------- 最小 protobuf 读取器 ------------------------- */

class Reader {
  constructor(buffer) {
    this.buf = buffer;
    this.pos = 0;
  }

  get done() {
    return this.pos >= this.buf.length;
  }

  varint() {
    let result = 0;
    let shift = 0;
    while (this.pos < this.buf.length) {
      const byte = this.buf[this.pos++];
      result += (byte & 0x7f) * 2 ** shift;
      if ((byte & 0x80) === 0) break;
      shift += 7;
    }
    return result;
  }

  bytes() {
    const len = this.varint();
    const slice = this.buf.subarray(this.pos, this.pos + len);
    this.pos += len;
    return slice;
  }

  skip(wireType) {
    if (wireType === 0) this.varint();
    else if (wireType === 1) this.pos += 8;
    else if (wireType === 2) this.bytes();
    else if (wireType === 5) this.pos += 4;
  }
}

/**
 * 解析 DmSegMobileReply protobuf。
 * 字段：1=elems(repeated) ；elem: 2=progress(ms) 3=mode 5=color 7=content
 */
export function parseDanmakuProtobuf(buffer) {
  if (!buffer?.length) return [];
  const reader = new Reader(buffer);
  const list = [];

  while (!reader.done) {
    let tag;
    try {
      tag = reader.varint();
    } catch {
      break;
    }
    const field = tag >> 3;
    const wire = tag & 0x07;

    if (field !== 1 || wire !== 2) {
      reader.skip(wire);
      continue;
    }

    const sub = new Reader(reader.bytes());
    const elem = { timeMs: 0, mode: 1, color: 16777215, content: '' };
    while (!sub.done) {
      let t;
      try {
        t = sub.varint();
      } catch {
        break;
      }
      const f = t >> 3;
      const w = t & 0x07;
      if (f === 2 && w === 0) elem.timeMs = sub.varint();
      else if (f === 3 && w === 0) elem.mode = sub.varint();
      else if (f === 5 && w === 0) elem.color = sub.varint();
      else if (f === 7 && w === 2) elem.content = sub.bytes().toString('utf8').trim();
      else sub.skip(w);
    }
    if (elem.content) {
      list.push({
        timeMs: elem.timeMs,
        content: elem.content,
        color: `#${(elem.color >>> 0).toString(16).padStart(6, '0')}`,
        mode: elem.mode,
      });
    }
  }
  return list;
}

/* ------------------------- 旧版 XML 解析 ------------------------- */

export async function parseDanmakuXML(buffer) {
  let xml = '';
  for (const fn of [inflateRaw, inflate, gunzip]) {
    try {
      const text = (await fn(buffer)).toString('utf8');
      if (text.includes('<d ')) {
        xml = text;
        break;
      }
    } catch {
      /* 尝试下一种压缩方式 */
    }
  }
  if (!xml) xml = buffer.toString('utf8');
  if (!xml.includes('<d ')) return [];

  const list = [];
  const re = /<d p="([^"]+)"[^>]*>([\s\S]*?)<\/d>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const [time, mode, , color] = m[1].split(',');
    const content = m[2].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
    if (!content) continue;
    const colorInt = Number(color) || 16777215;
    list.push({
      timeMs: Math.round(Number(time) * 1000) || 0,
      content,
      color: `#${colorInt.toString(16).padStart(6, '0')}`,
      mode: Number(mode) || 1,
    });
  }
  return list;
}

export default { parseDanmakuProtobuf, parseDanmakuXML, inflateRaw, inflate, gunzip };
