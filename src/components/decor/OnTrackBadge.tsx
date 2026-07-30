export default function OnTrackBadge() {
  return (
    <div
      aria-hidden
      className="badge-pulse"
      style={{
        background: '#FFC800',
        border: '2.5px solid #E6A800',
        borderRadius: 999,
        padding: '5px 14px',
        display: 'inline-flex',
        alignItems: 'center',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: '#8A6400', fontWeight: 800, fontSize: 12, letterSpacing: '0.08em' }}>
        ON TRACK!
      </span>
    </div>
  );
}
