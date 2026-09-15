/** 小电视 logo（手绘还原，非站方素材） */
export function Logo({ size = 34, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={(size * 44) / 34} height={size} viewBox="0 0 44 34" fill="none" aria-label="bilibili">
      <path
        d="M12.2 1.2a2 2 0 0 1 2.8 0l4.6 4.4h4.8l4.6-4.4a2 2 0 1 1 2.8 2.9l-1.6 1.5h3.3A8.5 8.5 0 0 1 42 14.1v10.4a8.5 8.5 0 0 1-8.5 8.5h-23A8.5 8.5 0 0 1 2 24.5V14.1a8.5 8.5 0 0 1 8.5-8.5h3.3l-1.6-1.5a2 2 0 0 1 0-2.9Z"
        fill={color}
      />
      <path
        d="M12.4 12.6a2 2 0 0 1 2 2v3.7a2 2 0 1 1-4 0v-3.7a2 2 0 0 1 2-2Zm19.2 0a2 2 0 0 1 2 2v3.7a2 2 0 1 1-4 0v-3.7a2 2 0 0 1 2-2Z"
        fill="#fff"
      />
    </svg>
  );
}
