// Logo mark: an open "C" with a coral record dot sitting in its gap.
export function CwayaMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="7" fill="var(--editorial-blue)" />
      <path
        d="M21.5 11.2a7 7 0 1 0 0 9.6"
        fill="none"
        stroke="var(--ivory)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="23.4" cy="16" r="2.3" fill="var(--coral)" />
    </svg>
  );
}
