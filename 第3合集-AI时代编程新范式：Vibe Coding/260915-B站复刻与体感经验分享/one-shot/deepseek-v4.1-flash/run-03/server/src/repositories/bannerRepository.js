import { all, get, run, transaction } from '../db/index.js';

/** Banner 仓储 */

export function findAll() {
  return all('SELECT * FROM banners ORDER BY sort_order ASC');
}

export function replaceAll(banners = []) {
  transaction(() => {
    run('DELETE FROM banners');
    banners.forEach((b, index) => {
      run(
        `INSERT INTO banners (title, subtitle, image, link, bvid, badge, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.title, b.subtitle ?? '', b.image, b.link ?? '', b.bvid ?? null, b.badge ?? '', index + 1],
      );
    });
  });
  return banners.length;
}

export default { findAll, replaceAll };
