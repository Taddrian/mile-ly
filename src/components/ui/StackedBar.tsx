interface Segment {
  label: string;
  value: number;
  color: string;
}

interface StackedBarProps {
  segments: Segment[];
  height?: number;
}

export default function StackedBar({ segments, height = 22 }: StackedBarProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  return (
    <div>
      {/* Bar with label-in-bar for each segment */}
      <div
        className="flex w-full overflow-hidden rounded-full"
        style={{ height, background: '#EFF3F2' }}
      >
        {segments.map((seg, i) => {
          const pct = Math.round((seg.value / total) * 100);
          return (
            <div
              key={i}
              style={{
                width: `${(seg.value / total) * 100}%`,
                backgroundColor: seg.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 6,
                position: 'relative',
              }}
            >
              {pct >= 12 && (
                <span style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.02em' }}>
                  {pct}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Caption row */}
      <p style={{
        marginTop: 8,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--m-slate, #777777)',
      }}>
        {segments.map((seg, i) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return `${pct} ${seg.label.toUpperCase()}${i < segments.length - 1 ? ' · ' : ''}`;
        }).join('')}
      </p>
    </div>
  );
}
