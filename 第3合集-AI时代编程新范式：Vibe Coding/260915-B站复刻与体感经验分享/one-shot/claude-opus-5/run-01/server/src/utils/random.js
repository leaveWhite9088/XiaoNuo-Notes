/** 可复现的伪随机工具：同一个 seed 每次启动都会产出完全相同的数据集。 */

/** mulberry32 PRNG */
export function createRandom(seed) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    /** [0,1) */
    next,
    /** [min,max] 的整数 */
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    /** 从数组中取一个元素 */
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    /** 取 n 个不重复元素 */
    sample: (arr, n) => {
      const copy = [...arr];
      const out = [];
      while (out.length < Math.min(n, copy.length)) {
        out.push(copy.splice(Math.floor(next() * copy.length), 1)[0]);
      }
      return out;
    },
    /** 以 p 的概率返回 true */
    chance: (p) => next() < p,
  };
}

const BV_CHARS = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';

/** 生成一个形如 BV1xx4y1z7Ab 的稿件号 */
export function makeBvid(rng) {
  let out = 'BV1';
  for (let i = 0; i < 9; i += 1) out += rng.pick(BV_CHARS.split(''));
  return out;
}
