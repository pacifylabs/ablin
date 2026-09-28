import type { IconName } from '@/cms/collections/icons';

/** Drawings for the fixed icon set (cms/collections/icons.ts). 24px grid, 1.5 stroke, currentColor. */
const PATHS: Record<IconName, React.ReactNode> = {
  'square-check': (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 12.5l2.6 2.6L16 9.6" />
    </>
  ),
  'shield-check': (
    <>
      <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  shield: <path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6l7-3z" />,
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.8" />
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.2v5.6M12 15.2v5.6M3.2 12h5.6M15.2 12h5.6" />
    </>
  ),
  document: (
    <>
      <rect x="4" y="3.2" width="16" height="17.6" rx="2.4" />
      <path d="M8 8.8h8M8 12h8M8 15.2h4.8" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.2l8.8 4.4L12 12 3.2 7.6 12 3.2z" />
      <path d="M3.2 12l8.8 4.4 8.8-4.4M3.2 16.4l8.8 4.4 8.8-4.4" />
    </>
  ),
  trend: (
    <>
      <path d="M4 17l5-5 4 4 7-8" />
      <path d="M15 8h5v5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  monitor: (
    <>
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  bars: <path d="M4 20V10M10 20V6M16 20v-8M22 20H2" />,
  building: (
    <>
      <path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h7A1.5 1.5 0 0 1 15 4.5V21M15 9h3.5A1.5 1.5 0 0 1 20 10.5V21M3 21h18" />
      <path d="M8.5 7h3M8.5 11h3M8.5 15h3" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
    </>
  ),
  cycle: (
    <>
      <path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9" />
      <path d="M18.5 3.5v4h-4M5.5 20.5v-4h4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14.8c1.6.8 2.6 2.5 3 5.2" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M7 21h10M5 7h14" />
      <path d="M5 7l-2.5 6a2.5 2.5 0 0 0 5 0L5 7zM19 7l-2.5 6a2.5 2.5 0 0 0 5 0L19 7z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  cloud: <path d="M7 18.5h10a4 4 0 0 0 .6-8 5.5 5.5 0 0 0-10.6 1.4A3.3 3.3 0 0 0 7 18.5z" />,
};

interface LineIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/** Always decorative: the adjacent heading or label names the thing. */
export function LineIcon({ name, size = 28, className }: LineIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
