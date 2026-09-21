import { useId } from 'react';
import type { IllustrationScene } from '@/content/schema';
import styles from './Illustration.module.css';

/**
 * Fine-line, single-colour, diagrammatic illustrations (Design System v2 §9). They depict structures,
 * controls and flows, never people, and are drawn with theme tokens so they follow light and dark.
 * They are decorative, so they are hidden from assistive technology.
 */
const scenes: Record<IllustrationScene, React.ReactNode> = {
  structure: (
    <>
      <path className={styles.soft} d="M80 120V260M400 120V260M240 180V320" strokeDasharray="4 5" />
      <path className={`${styles.line} ${styles.panel}`} d="M240 200L400 260L240 320L80 260Z" />
      <path className={`${styles.line} ${styles.panel}`} d="M240 130L400 190L240 250L80 190Z" />
      <path className={`${styles.line} ${styles.panel}`} d="M240 60L400 120L240 180L80 120Z" />
      <path className={styles.soft} d="M190 120L240 95L290 120L240 145Z" />
      <circle className={styles.dot} cx="240" cy="95" r="5" />
      <circle className={styles.dot} cx="290" cy="120" r="5" />
      <circle className={styles.dot} cx="190" cy="120" r="5" />
      <circle className={styles.ring} cx="240" cy="145" r="5" />
      <path className={styles.soft} d="M170 190L240 215L310 190M170 260L240 285L310 260" />
    </>
  ),
  governance: (
    <>
      <path
        className={styles.soft}
        d="M240 90V125M110 125H370M110 125V160M240 125V160M370 125V160"
      />
      <path
        className={styles.soft}
        d="M110 200V230M80 230H150M80 230V260M150 230V260M240 200V260M370 200V230M330 230H400M330 230V260M400 230V260"
      />
      <rect
        className={`${styles.line} ${styles.panel}`}
        x="190"
        y="50"
        width="100"
        height="40"
        rx="6"
      />
      <path className={styles.accentStroke} d="M214 70l6 6 12-13" />
      <rect className={styles.bar} x="244" y="66" width="34" height="8" rx="4" />
      {[60, 190, 320].map((x) => (
        <g key={x}>
          <rect
            className={`${styles.line} ${styles.panel}`}
            x={x}
            y="160"
            width="100"
            height="40"
            rx="6"
          />
          <rect className={styles.bar} x={x + 14} y="176" width="72" height="8" rx="4" />
        </g>
      ))}
      {[52, 122, 212, 302, 372].map((x) => (
        <g key={x}>
          <rect
            className={`${styles.softBox} ${styles.panel}`}
            x={x}
            y="260"
            width="56"
            height="30"
            rx="5"
          />
          <rect className={styles.bar} x={x + 12} y="272" width="32" height="6" rx="3" />
        </g>
      ))}
      <circle className={styles.dot} cx="110" cy="230" r="3.5" />
      <circle className={styles.dot} cx="370" cy="230" r="3.5" />
    </>
  ),
  controls: (
    <>
      <rect
        className={`${styles.line} ${styles.panel}`}
        x="60"
        y="50"
        width="360"
        height="260"
        rx="10"
      />
      <rect className={styles.accentFill} x="90" y="72" width="70" height="8" rx="4" />
      <path className={styles.soft} d="M60 100H420" />
      {[
        [135, 260],
        [185, 330],
        [235, 220],
        [285, 300],
      ].map(([y, x]) => (
        <g key={y}>
          <rect className={styles.bar} x="90" y={(y ?? 0) - 4} width="64" height="8" rx="4" />
          <path className={styles.trackSoft} d={`M180 ${y}H390`} />
          <path className={styles.trackAccent} d={`M180 ${y}H${x}`} />
          <circle className={`${styles.line} ${styles.panel}`} cx={x} cy={y} r="10" />
        </g>
      ))}
    </>
  ),
  data: (
    <>
      <circle className={styles.softDash} cx="240" cy="190" r="110" />
      {[
        [240, 80],
        [335, 135],
        [335, 245],
        [240, 300],
        [145, 245],
        [145, 135],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path className={styles.soft} d={`M240 190L${x} ${y}`} />
          <rect
            className={`${styles.line} ${styles.panel}`}
            x={(x ?? 0) - 15}
            y={(y ?? 0) - 15}
            width="30"
            height="30"
            rx="6"
          />
          <circle className={styles.dot} cx={x} cy={y} r="4" />
        </g>
      ))}
      <path className={`${styles.line} ${styles.panel}`} d="M204 172V208A36 13 0 0 0 276 208V172" />
      <ellipse className={`${styles.line} ${styles.panel}`} cx="240" cy="172" rx="36" ry="13" />
      <path className={styles.accentStroke} d="M204 190A36 13 0 0 0 276 190" />
    </>
  ),
  iso: (
    <>
      <rect
        className={`${styles.softBox} ${styles.panel}`}
        x="130"
        y="70"
        width="190"
        height="240"
        rx="8"
      />
      <rect
        className={`${styles.softBox} ${styles.panel}`}
        x="150"
        y="55"
        width="190"
        height="240"
        rx="8"
      />
      <rect
        className={`${styles.line} ${styles.panel}`}
        x="170"
        y="40"
        width="190"
        height="240"
        rx="8"
      />
      <rect className={styles.accentFill} x="192" y="62" width="84" height="10" rx="5" />
      {[100, 140, 180, 220].map((y) => (
        <g key={y}>
          <path className={styles.accentStroke} d={`M194 ${y + 6}l6 6 11-12`} />
          <rect className={styles.bar} x="226" y={y + 4} width="106" height="8" rx="4" />
        </g>
      ))}
      <path className={styles.soft} d="M192 250H338" />
    </>
  ),
  ai: (
    <>
      <rect className={styles.accentDash} x="70" y="50" width="340" height="260" rx="14" />
      <path
        className={styles.accentStroke}
        d="M70 82V64a14 14 0 0 1 14-14h18M408 82V64a14 14 0 0 0-14-14h-18M70 278v18a14 14 0 0 0 14 14h18M408 278v18a14 14 0 0 1-14 14h-18"
      />
      {[110, 180, 250].flatMap((a) =>
        [90, 150, 210, 270].map((b) => (
          <path key={`l1-${a}-${b}`} className={styles.soft} d={`M120 ${a}L240 ${b}`} />
        )),
      )}
      {[90, 150, 210, 270].flatMap((a) =>
        [110, 180, 250].map((b) => (
          <path key={`l2-${a}-${b}`} className={styles.soft} d={`M240 ${a}L360 ${b}`} />
        )),
      )}
      {[110, 180, 250].map((y) => (
        <circle key={`a${y}`} className={`${styles.line} ${styles.panel}`} cx="120" cy={y} r="11" />
      ))}
      {[90, 150, 210, 270].map((y, i) => (
        <circle
          key={`b${y}`}
          className={i === 1 ? styles.dot : `${styles.line} ${styles.panel}`}
          cx="240"
          cy={y}
          r="11"
        />
      ))}
      {[110, 180, 250].map((y) => (
        <circle key={`c${y}`} className={`${styles.line} ${styles.panel}`} cx="360" cy={y} r="11" />
      ))}
    </>
  ),
  cyber: (
    <>
      <path
        className={styles.accentStroke}
        d="M60 92V62h30M420 92V62h-30M60 268v30h30M420 268v30h-30"
      />
      <path className={styles.softDash} d="M60 180H420" />
      {[
        [240, 80],
        [327, 130],
        [327, 230],
        [240, 280],
        [153, 230],
        [153, 130],
      ].map(([x, y], i, all) => {
        const next = all[(i + 1) % all.length] ?? [0, 0];
        return (
          <g key={`${x}-${y}`}>
            <path className={styles.soft} d={`M240 180L${x} ${y}`} />
            <path className={styles.soft} d={`M${x} ${y}L${next[0]} ${next[1]}`} />
          </g>
        );
      })}
      {[
        [240, 80],
        [327, 130],
        [240, 280],
        [153, 230],
        [153, 130],
      ].map(([x, y]) => (
        <circle
          key={`n${x}-${y}`}
          className={`${styles.line} ${styles.panel}`}
          cx={x}
          cy={y}
          r="10"
        />
      ))}
      <circle className={styles.accentDash} cx="327" cy="230" r="19" />
      <circle className={styles.dot} cx="327" cy="230" r="8" />
      <circle className={`${styles.line} ${styles.panel}`} cx="240" cy="180" r="18" />
      <circle className={styles.dot} cx="240" cy="180" r="6" />
    </>
  ),
  audit: (
    <>
      <rect
        className={`${styles.line} ${styles.panel}`}
        x="60"
        y="50"
        width="250"
        height="260"
        rx="8"
      />
      <rect className={styles.accentFill} x="82" y="70" width="80" height="9" rx="4.5" />
      {[105, 140, 175, 210, 245, 280].map((y) => (
        <g key={y}>
          <path className={styles.soft} d={`M60 ${y - 12}H310`} />
          <rect className={styles.bar} x="82" y={y - 3} width="96" height="8" rx="4" />
          <rect className={styles.bar} x="200" y={y - 3} width="70" height="8" rx="4" />
        </g>
      ))}
      <path className={styles.accentStroke} strokeWidth={9} d="M394 254L432 292" />
      <circle className={`${styles.lineHeavy} ${styles.panel}`} cx="350" cy="210" r="62" />
      <path className={styles.accentStroke} d="M322 208l14 14 30-32" />
      <rect className={styles.bar} x="318" y="238" width="64" height="7" rx="3.5" />
    </>
  ),
  soc2: (
    <>
      <rect
        className={`${styles.line} ${styles.panel}`}
        x="60"
        y="50"
        width="360"
        height="260"
        rx="10"
      />
      <rect className={styles.accentFill} x="90" y="72" width="70" height="8" rx="4" />
      <path className={styles.soft} d="M60 100H420" />
      {[
        [132, 170],
        [176, 150],
        [220, 120],
        [264, 88],
      ].map(([y, w]) => (
        <g key={y}>
          <circle className={`${styles.line} ${styles.panel}`} cx="96" cy={y} r="11" />
          <path className={styles.accentStroke} d={`M90 ${y}l4 4 8-9`} />
          <rect className={styles.bar} x="122" y={(y ?? 0) - 4} width="72" height="8" rx="4" />
          <rect className={styles.track} x="214" y={(y ?? 0) - 4} width="170" height="8" rx="4" />
          <rect
            className={styles.accentFill}
            x="214"
            y={(y ?? 0) - 4}
            width={w}
            height="8"
            rx="4"
          />
        </g>
      ))}
    </>
  ),
};

interface IllustrationProps {
  scene: IllustrationScene;
  className?: string;
}

export function Illustration({ scene, className }: IllustrationProps) {
  const id = useId();
  return (
    <div className={`${styles.frame}${className ? ` ${className}` : ''}`} aria-hidden="true">
      <svg viewBox="0 0 480 360" className={styles.svg} focusable="false">
        <defs>
          <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle className={styles.gridDot} cx="1" cy="1" r="1" />
          </pattern>
        </defs>
        <rect width="480" height="360" fill={`url(#${id})`} />
        {scenes[scene]}
      </svg>
    </div>
  );
}
