import Link from 'next/link';

interface ButtonProps {
  href: string;
  variant?: 'primary' | 'ghost';
  children: React.ReactNode;
  className?: string;
}

/** Link-styled button. Labels are verb-first and never carry a trailing arrow (Design System v2 §10.1). */
export function Button({ href, variant = 'primary', children, className }: ButtonProps) {
  return (
    <Link href={href} className={`btn btn-${variant}${className ? ` ${className}` : ''}`}>
      {children}
    </Link>
  );
}
