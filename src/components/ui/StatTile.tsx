interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
  chipLabel: string;
}

const ICONS: Record<string, string> = {
  savings: '💰',
  calendar: '📅',
};

export default function StatTile({ label, value, caption, chipLabel }: StatTileProps) {
  const emoji = ICONS[chipLabel] ?? '✦';
  return (
    <div
      className="flex-1 card-chunky p-4 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ background: 'var(--m-teal-xl, #CCFBF1)' }}
          aria-hidden
        >
          {emoji}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--m-slate, #777777)',
          }}
        >
          {label}
        </span>
      </div>
      <p className="font-display" style={{ fontSize: 20, fontWeight: 800, color: 'var(--m-ink, #3C3C3C)', lineHeight: 1.1 }}>
        {value}
      </p>
      {caption && (
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--m-teal, #0D9488)' }}>
          {caption}
        </p>
      )}
    </div>
  );
}
