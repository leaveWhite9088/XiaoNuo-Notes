import { reactive } from 'vue';

let seq = 0;

// 轻量全局 toast
export const toastState = reactive({ list: [] });

export function toast(text) {
  const id = ++seq;
  toastState.list.push({ id, text });
  setTimeout(() => {
    const i = toastState.list.findIndex((t) => t.id === id);
    if (i >= 0) toastState.list.splice(i, 1);
  }, 2400);
}
