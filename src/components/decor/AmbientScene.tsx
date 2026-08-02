interface AmbientSceneProps {
  /** 'page' = full hero treatment (sun + clouds + twinkles + glows). 'card' = a lighter version (glows + dots only), meant to sit inside a card so it "reads through". */
  variant?: 'page' | 'card';
}

// Purely decorative, sits behind real content — pointer-events:none, absolutely
// positioned by the caller's `position: relative` container. Tints itself via
// the ambient --node-ring/--node-deep custom properties already set by the
// budget-status hue-flood, so it re-colors automatically with teal/coral.
export default function AmbientScene({ variant = 'page' }: AmbientSceneProps) {
  const isPage = variant === 'page';
  const dotSize = isPage ? 26 : 22;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Soft pulsing glow blobs, tinted by the current hue */}
      <div className="ambient-glow" style={{ position: 'absolute', top: isPage ? -80 : -60, left: isPage ? -60 : -50, width: isPage ? 320 : 260, height: isPage ? 320 : 260, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--node-ring) 22%, transparent), transparent 68%)' }} />
      <div className="ambient-glow" style={{ position: 'absolute', bottom: isPage ? 40 : -40, right: isPage ? -70 : -60, width: isPage ? 340 : 280, height: isPage ? 340 : 280, borderRadius: '50%', background: 'radial-gradient(circle, color-mix(in srgb, var(--node-ring) 22%, transparent), transparent 68%)', animationDelay: '-3s' }} />

      {/* Drifting dot-grid */}
      <svg style={{ position: 'absolute', inset: -22, width: 'calc(100% + 22px)', height: 'calc(100% + 22px)', opacity: 0.7 }} className="ambient-dot-drift">
        <defs>
          <pattern id={`ambient-dots-${variant}`} width={dotSize} height={dotSize} patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r={isPage ? 1.8 : 1.5} fill="color-mix(in srgb, var(--node-ring) 40%, transparent)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#ambient-dots-${variant})`} />
      </svg>

      {isPage && (
        <>
          <div className="ambient-sun-bob" style={{ position: 'absolute', top: 96, right: 34, width: 52, height: 52, borderRadius: '50%', background: 'color-mix(in srgb, var(--node-ring) 55%, #ffe9a8)', filter: 'blur(1px)', opacity: 0.9 }} />
          <svg width="120" height="40" viewBox="0 0 120 40" className="ambient-cloud-drift" style={{ position: 'absolute', top: 150, left: 0, opacity: 0.85, animationDelay: '-12s' }}>
            <g fill="#ffffff"><ellipse cx="30" cy="24" rx="26" ry="14" /><ellipse cx="58" cy="18" rx="20" ry="16" /><ellipse cx="82" cy="25" rx="18" ry="11" /></g>
          </svg>
          <svg width="90" height="32" viewBox="0 0 90 32" className="ambient-cloud-drift" style={{ position: 'absolute', top: 340, left: 0, opacity: 0.7, animationDuration: '74s', animationDelay: '-40s' }}>
            <g fill="#ffffff"><ellipse cx="22" cy="19" rx="20" ry="11" /><ellipse cx="46" cy="14" rx="15" ry="12" /><ellipse cx="66" cy="20" rx="14" ry="9" /></g>
          </svg>
          <div className="ambient-twinkle" style={{ position: 'absolute', top: 60, left: 44, width: 8, height: 8, borderRadius: '50%', background: 'var(--node-ring)' }} />
          <div className="ambient-twinkle" style={{ position: 'absolute', top: 220, right: 70, width: 6, height: 6, borderRadius: '50%', background: 'var(--node-ring)', animationDelay: '-1.4s' }} />
        </>
      )}
    </div>
  );
}
