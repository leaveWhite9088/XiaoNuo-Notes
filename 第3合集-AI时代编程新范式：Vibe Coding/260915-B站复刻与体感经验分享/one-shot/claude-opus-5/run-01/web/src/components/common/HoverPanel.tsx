/**
 * 通用 hover 展开面板：鼠标移入延时展开、移出延时收起，点击也可切换。
 * 顶栏的头像卡片、动态/收藏/历史、投稿、频道"更多"都复用它。
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './hover-panel.css';

interface Props {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  openDelay?: number;
  closeDelay?: number;
  className?: string;
  panelClassName?: string;
  onOpenChange?: (open: boolean) => void;
}

export function HoverPanel({
  trigger,
  children,
  align = 'center',
  openDelay = 100,
  closeDelay = 160,
  className = '',
  panelClassName = '',
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const schedule = (next: boolean, delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setOpen(next);
      onOpenChange?.(next);
    }, delay);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div
      className={`hover-panel ${open ? 'is-open' : ''} ${className}`}
      onMouseEnter={() => schedule(true, openDelay)}
      onMouseLeave={() => schedule(false, closeDelay)}
    >
      <div
        className="hover-panel__trigger"
        onClick={() => {
          window.clearTimeout(timer.current);
          setOpen((v) => {
            onOpenChange?.(!v);
            return !v;
          });
        }}
      >
        {trigger}
      </div>
      <div className={`hover-panel__body hover-panel__body--${align} ${panelClassName}`}>
        {children}
      </div>
    </div>
  );
}
