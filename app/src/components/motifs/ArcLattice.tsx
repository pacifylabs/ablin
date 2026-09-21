/**
 * Arch lattice: concentric arcs echoing the arch in the Ablin mark, with a governance path of nodes across them.
 * Navy, hairline, theme-aware. Decorative, so it is hidden from assistive technology.
 * The lattice itself is static; the hero animates the whole SVG (a single compositor-friendly sweep), because
 * animating dozens of individual strokes forces main-thread repaints while the hero photograph is trying to paint.
 */
const CX = 520;
const CY = 560;
const RADII = [80, 150, 220, 290, 360, 430, 500];

/** Point at radius r and angle deg, measured up from the horizontal axis and out to the left. */
function pt(r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [Math.round(CX - r * Math.cos(rad)), Math.round(CY - r * Math.sin(rad))];
}

const PATH_NODES: Array<[number, number]> = [
  pt(80, 30),
  pt(150, 55),
  pt(220, 40),
  pt(290, 68),
  pt(360, 50),
  pt(430, 72),
];
const FOCUS = 3;
const TICKS = [10, 25, 40, 55, 70, 85];

interface ArcLatticeProps {
  className?: string;
  /** Show the highlighted path and nodes (omit for a quieter background use). */
  withPath?: boolean;
}

export function ArcLattice({ className, withPath = true }: ArcLatticeProps) {
  const route = PATH_NODES.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');

  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="var(--motif-stroke)"
      strokeLinecap="round"
    >
      {/* Radial guide ticks: the blueprint hairlines. */}
      <g stroke="var(--motif-soft)" strokeWidth="1" opacity="0.7">
        {TICKS.map((deg) => {
          const [x1, y1] = pt(80, deg);
          const [x2, y2] = pt(500, deg);
          return <path key={deg} d={`M${x1} ${y1} L${x2} ${y2}`} strokeDasharray="2 7" />;
        })}
      </g>
      {RADII.map((r, i) => (
        <path
          key={r}
          d={`M${CX - r} ${CY} A${r} ${r} 0 0 1 ${CX} ${CY - r}`}
          strokeWidth={i % 2 === 0 ? 1.4 : 1}
          opacity={1 - i * 0.1}
        />
      ))}
      {withPath ? (
        <>
          <path d={route} strokeWidth="1.6" />
          {PATH_NODES.map(([x, y], i) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={i === FOCUS ? 8 : 4.5}
              fill={i === FOCUS ? 'var(--motif-stroke)' : 'var(--bg)'}
              strokeWidth="1.5"
            />
          ))}
          <circle
            cx={PATH_NODES[FOCUS]?.[0]}
            cy={PATH_NODES[FOCUS]?.[1]}
            r="16"
            strokeWidth="1.2"
            strokeDasharray="3 5"
          />
        </>
      ) : null}
    </svg>
  );
}
