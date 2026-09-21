/**
 * Contour lines: a topographic field, read as a risk landscape. Used as a very quiet section backdrop
 * (see .motif-bg). Stroke-only and low opacity, so it works in both themes and never competes with text.
 */
const LINES = Array.from({ length: 9 }, (_, i) => i);

export function Contours({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      {LINES.map((i) => {
        const y = 40 + i * 38;
        const a = 26 + (i % 3) * 8;
        return (
          <path
            key={i}
            opacity={0.16 + (i % 4) * 0.05}
            d={`M0 ${y} C 140 ${y - a}, 260 ${y + a}, 400 ${y - 4} S 660 ${y - a}, 800 ${y + 10}`}
          />
        );
      })}
    </svg>
  );
}
