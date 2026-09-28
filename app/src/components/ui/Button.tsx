import Link from 'next/link';

export type ButtonVariant = 'primary' | 'white' | 'ghost-white' | 'line';

interface ButtonProps {
  href: string;
  variant?: ButtonVariant;
  /** Trailing arrow: DS v3 §7.2 allows it on the primary hero CTA only. */
  arrow?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Link-styled button (DS v3 §7.2). Colour and glow on hover only; buttons never move. */
export function Button({
  href,
  variant = 'primary',
  arrow = false,
  children,
  className,
}: ButtonProps) {
  return (
    <Link href={href} className={`btn btn-${variant}${className ? ` ${className}` : ''}`}>
      {children}
      {arrow ? (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      ) : null}
    </Link>
  );
}
