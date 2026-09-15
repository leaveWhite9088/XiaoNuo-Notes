// 首页列表上下文：跳详情前保存，返回首页时恢复（频道/关键词/页码/列表/滚动位置）
// 一次性消费语义：take 后即清空，避免陈旧状态影响后续进入
let saved = null;

export function saveHomeContext(ctx) {
  saved = ctx;
}

export function takeHomeContext() {
  const ctx = saved;
  saved = null;
  return ctx;
}
