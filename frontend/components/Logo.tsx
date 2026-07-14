import React from 'react';

/** Marca vectorial de "perform": flecha ascendente (↗). Usa currentColor. */
export function ArrowMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label={title ?? 'perform'} fill="none">
      <g stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 34 L31 17" />
        <path d="M19 15 H33 V29" />
      </g>
    </svg>
  );
}

/**
 * Logo "perform": flecha naranja + wordmark en Poppins + punto naranja.
 * `size` controla el tamaño del wordmark; la flecha y el punto escalan con él.
 */
export default function Logo({
  className = '',
  wordmark = true,
  arrowClassName = 'text-brand-600',
}: {
  className?: string;
  wordmark?: boolean;
  arrowClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[0.15em] ${className}`}>
      <ArrowMark className={`w-[0.9em] h-[0.9em] -translate-y-[0.18em] ${arrowClassName}`} />
      {wordmark && (
        <span className="font-display font-extrabold lowercase tracking-tight text-ink leading-none">
          perform<span className="text-brand-600">.</span>
        </span>
      )}
    </span>
  );
}
