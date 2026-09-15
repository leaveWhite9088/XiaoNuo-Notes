// 极简全局 Toast：用于对"V0 未开放"的控件给出明确、不误导的反馈
import { reactive } from 'vue';

export const toasts = reactive([]);
let seed = 0;

export function toast(msg, ms = 2200) {
  const id = ++seed;
  toasts.push({ id, msg });
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id);
    if (i > -1) toasts.splice(i, 1);
  }, ms);
}
