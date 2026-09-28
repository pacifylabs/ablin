import styles from './LatticeArt.module.css';

// A fixed node set (0–100 viewBox) so the art is identical on every render and needs no script.
const NODES: readonly [number, number][] = [
  [8, 22],
  [22, 8],
  [30, 30],
  [44, 14],
  [52, 40],
  [66, 22],
  [78, 8],
  [90, 30],
  [16, 52],
  [36, 58],
  [58, 64],
  [74, 48],
  [92, 62],
  [26, 80],
  [46, 88],
  [68, 84],
  [86, 90],
  [6, 76],
];
const LINK = 26;

const EDGES = NODES.flatMap(([x1, y1], i) =>
  NODES.slice(i + 1).flatMap(([x2, y2]) => {
    const d = Math.hypot(x2 - x1, y2 - y1);
    return d < LINK ? [{ x1, y1, x2, y2, o: 1 - d / LINK }] : [];
  }),
);

/**
 * A still version of the hero's node lattice (DS v3 §7.3), used to fill the empty side of plain page headers. Brand
 * navy tints only, decorative, and static, so there is nothing to animate or pause.
 */
export function LatticeArt({ className }: { className?: string }) {
  return (
    <svg
      className={`${styles.art}${className ? ` ${className}` : ''}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="58" cy="50" r="40" className={styles.ring} />
      <circle cx="58" cy="50" r="28" className={styles.ring} />
      {EDGES.map((e, i) => (
        <line
          key={i}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          className={styles.edge}
          strokeOpacity={0.25 + e.o * 0.6}
        />
      ))}
      {NODES.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 4 === 0 ? 1.6 : 1}
          className={i % 4 === 0 ? styles.hot : styles.node}
        />
      ))}
    </svg>
  );
}
