import { defineStore } from 'pinia';

let seq = 0;
export const useToastStore = defineStore('toast', {
  state: () => ({ toasts: [] }),
  actions: {
    show(text, type = 'info') {
      const id = ++seq;
      this.toasts.push({ id, text, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 2400);
    },
  },
});
