import { useRef, useState, type ReactNode } from 'react';
import './HoverPanel.css';

interface HoverPanelProps {
  trigger: ReactNode;
  children: ReactNode;
  /** 面板相对触发点的水平对齐 */
  align?: 'left' | 'center' | 'right';
  className?: string;
  panelClassName?: string;
  /** 面板打开时触发（用于懒加载面板数据） */
  onOpen?: () => void;
  width?: number;
}

/** 顶栏各类悬浮菜单的通用容器：鼠标移入展开、移出延迟收起，支持键盘聚焦 */
export function HoverPanel({
  trigger,
  children,
  align = 'center',
  className = '',
  panelClassName = '',
  onOpen,
  width,
}: HoverPanelProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const show = () => {
    window.clearTimeout(timer.current);
    if (!open) onOpen?.();
    setOpen(true);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <div
      className={`hover-panel ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}
      {open && (
        <div
          className={`hover-panel__body hover-panel__body--${align} ${panelClassName}`}
          style={width ? { width } : undefined}
          role="menu"
        >
          <span className="hover-panel__arrow" />
          {children}
        </div>
      )}
    </div>
  );
}
