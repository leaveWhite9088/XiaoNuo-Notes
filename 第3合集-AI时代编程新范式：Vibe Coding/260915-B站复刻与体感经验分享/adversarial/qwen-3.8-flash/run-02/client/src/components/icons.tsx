import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;

function stroke(props: P): P {
  return {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props,
  } as P;
}

export function IconLogo(props: P) {
  return (
    <svg width="34" height="28" viewBox="0 0 36 30" {...props}>
      <path
        d="M12.7 1.3a1.8 1.8 0 0 1 2.5-.3l3.3 2.7a1.8 1.8 0 0 1 2.7 0l3.3-2.7a1.8 1.8 0 1 1 2.2 2.8l-1.6 1.4h1.4c3 0 5.5 2.4 5.5 5.4v12.2c0 3-2.4 5.5-5.4 5.5H6.8c-3 0-5.4-2.5-5.4-5.5V10.6C1.4 7.6 3.8 5.2 6.8 5.2h1.6L6.9 3.8a1.8 1.8 0 0 1-.2-2.5zM11 13.6a1.8 1.8 0 0 0-1.8 1.8v1.7a1.8 1.8 0 1 0 3.6 0v-1.7a1.8 1.8 0 0 0-1.8-1.8zm13.8 0a1.8 1.8 0 0 0-1.8 1.8v1.7a1.8 1.8 0 1 0 3.6 0v-1.7a1.8 1.8 0 0 0-1.8-1.8z"
        fill="#fb7299"
      />
    </svg>
  );
}

export function IconSearch(props: P) {
  return (
    <svg {...stroke(props)}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
    </svg>
  );
}

export function IconEye(props: P) {
  return (
    <svg {...stroke(props)}>
      <path d="M2 12s3.6-6.8 10-6.8S22 12 22 12s-3.6 6.8-10 6.8S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function IconDanmaku(props: P) {
  return (
    <svg {...stroke(props)}>
      <rect x="2.5" y="4.5" width="19" height="12" rx="3" />
      <path d="M7 16.5v4l3.6-4" />
      <path d="M7.5 10.5h9M7.5 13h5.5" />
    </svg>
  );
}

export function IconClock(props: P) {
  return (
    <svg {...stroke(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconLike(props: P) {
  return (
    <svg {...stroke(props)}>
      <path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0 4.2-7.1a2.3 2.3 0 0 1 2.3 2.3V9h5.4a2 2 0 0 1 2 2.4l-1.3 6.6a2.4 2.4 0 0 1-2.3 2H7" />
    </svg>
  );
}

export function IconCoin(props: P) {
  return (
    <svg {...stroke(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 8.5 12 11l2.5-2.5M12 11v5M9 12.5h6" />
    </svg>
  );
}

export function IconStar(props: P) {
  return (
    <svg {...stroke(props)}>
      <path d="m12 2.9 2.8 5.7 6.3.9-4.5 4.4 1 6.2-5.6-2.9-5.6 2.9 1-6.2-4.5-4.4 6.3-.9z" />
    </svg>
  );
}

export function IconShare(props: P) {
  return (
    <svg {...stroke(props)}>
      <circle cx="18" cy="5.5" r="2.6" />
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="18.5" r="2.6" />
      <path d="m8.4 10.7 7.2-4M8.4 13.3l7.2 4" />
    </svg>
  );
}

export function IconChevronDown(props: P) {
  return (
    <svg {...stroke(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconUser(props: P) {
  return (
    <svg {...stroke(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-5.5 8-5.5s6.5 1.5 8 5.5" />
    </svg>
  );
}

export function IconMsg(props: P) {
  return (
    <svg {...stroke(props)}>
      <rect x="3" y="4" width="18" height="13" rx="3" />
      <path d="M8 17v4l4-4" />
    </svg>
  );
}

export function IconDynamic(props: P) {
  return (
    <svg {...stroke(props)}>
      <path d="M4 13a8 8 0 0 1 13.6-5.7" />
      <path d="M20 11a8 8 0 0 1-13.6 5.7" />
      <path d="M17.5 2.5v5h-5M6.5 21.5v-5h5" />
    </svg>
  );
}

export function IconHistory(props: P) {
  return (
    <svg {...stroke(props)}>
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 8v4l3 2M21 3l-3 3" />
    </svg>
  );
}

export function IconClose(props: P) {
  return (
    <svg {...stroke(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconPlay(props: P) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.9l11-6.5a1 1 0 0 0 0-1.7l-11-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}
