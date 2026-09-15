import { useEffect } from 'react';
import type { RefObject } from 'react';

/** 点击元素外部时触发回调（搜索下拉、菜单收起用）。 */
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  active = true,
): void {
  useEffect(() => {
    if (!active) return;
    const onDown = (event: MouseEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) handler();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, handler, active]);
}
