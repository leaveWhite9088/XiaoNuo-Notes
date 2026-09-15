import { defineStore } from 'pinia';

export interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
}

/**
 * 全局轻提示：用于明确告知「该入口在 Demo 中未接入」，
 * 避免出现点了没反应的死按钮。
 */
export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [] as Toast[],
    seq: 0,
  }),

  actions: {
    notify(message: string, type: Toast['type'] = 'info', duration = 2600) {
      const id = ++this.seq;
      this.toasts = [...this.toasts, { id, message, type }];
      setTimeout(() => this.dismiss(id), duration);
      return id;
    },

    success(message: string) {
      return this.notify(message, 'success');
    },

    error(message: string) {
      return this.notify(message, 'error', 3600);
    },

    /** Demo 未实现的入口统一走这里，交互上「有反馈」而不是静默 */
    notImplemented(feature: string) {
      return this.notify(`${feature}：Demo 未接入该能力`, 'info');
    },

    dismiss(id: number) {
      this.toasts = this.toasts.filter((t) => t.id !== id);
    },
  },
});
