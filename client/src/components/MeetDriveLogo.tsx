import { useId } from 'react';

/**
 * MeetDrive logo — the brand mark (gradient "lightning M") + the
 * "meetdrive.io" wordmark, matching the marketing landing page. Styles are
 * inline + em-based so it renders identically in the app shell and on the
 * auth pages, and scales with the surrounding font-size.
 */
export function MeetDriveLogo({ className = '', inverted = false }: { className?: string; inverted?: boolean }) {
  const gid = useId();
  const base = inverted ? '#fff' : 'var(--text-primary)';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5em',
        lineHeight: 1,
        fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif",
        fontWeight: 700,
        letterSpacing: '-0.03em',
        fontSize: 'inherit',
      }}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          filter: 'drop-shadow(0 3px 10px rgba(108,92,250,0.35))',
        }}
      >
        <svg style={{ height: '1.55em', width: '1.55em' }} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={gid} x1="4" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8A4DFC" />
              <stop offset="1" stopColor="#2A71FC" />
            </linearGradient>
          </defs>
          <path d="M7 31 16 9 24 27 33 11" stroke={`url(#${gid})`} strokeWidth="6.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="30.6" cy="29.4" r="3.6" fill="#3B7BFC" />
        </svg>
      </span>
      <span style={{ color: base }}>
        meet
        <span style={{ background: 'linear-gradient(120deg,#8A4DFC,#2A71FC)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>drive</span>
        <span style={{ color: '#4F8BFC', fontWeight: 600 }}>.io</span>
      </span>
    </span>
  );
}

/**
 * Compact mark — just the gradient "lightning M", for favicon / collapsed
 * contexts. Sized by `className` (defaults to h-7 w-7).
 */
export function MeetDriveLogoMark({ className = 'h-7 w-7' }: { className?: string; inverted?: boolean }) {
  const gid = useId();
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={gid} x1="4" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8A4DFC" />
          <stop offset="1" stopColor="#2A71FC" />
        </linearGradient>
      </defs>
      <path d="M7 31 16 9 24 27 33 11" stroke={`url(#${gid})`} strokeWidth="6.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="30.6" cy="29.4" r="3.6" fill="#3B7BFC" />
    </svg>
  );
}
