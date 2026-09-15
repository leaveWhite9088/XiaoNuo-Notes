/** 站点 Logo：小电视图标 + bilibili 字标。 */

interface Props {
  size?: number;
  withWordmark?: boolean;
  color?: string;
}

export function BiliLogo({ size = 30, withWordmark = true, color = 'currentColor' }: Props) {
  return (
    <span className="bili-logo" style={{ color }}>
      <svg width={size * 1.2} height={size} viewBox="0 0 40 32" aria-label="bilibili">
        <path
          d="M12.2 2.3 16.6 6h6.8l4.4-3.7a1.7 1.7 0 0 1 2.3 2.5L28.4 6h2.4A6.2 6.2 0 0 1 37 12.2v11.5A6.2 6.2 0 0 1 30.8 30H9.2A6.2 6.2 0 0 1 3 23.7V12.2A6.2 6.2 0 0 1 9.2 6h2.4L9.9 4.8a1.7 1.7 0 0 1 2.3-2.5Z"
          fill="currentColor"
        />
        <rect x="6.6" y="9.6" width="26.8" height="16.8" rx="3.4" fill="#fff" />
        <circle cx="15" cy="17.4" r="2.1" fill="currentColor" />
        <circle cx="25" cy="17.4" r="2.1" fill="currentColor" />
      </svg>
      {withWordmark && <span className="bili-logo__text">bilibili</span>}
    </span>
  );
}
