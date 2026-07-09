interface Segment {
  label: string;
  value: number;
  color: string;
}

interface StackedBarProps {
  segments: Segment[];
  height?: number;
}

export default function StackedBar({ segments, height = 10 }: StackedBarProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  return (
    <div>
      {/* Bar */}
      <div
        className="flex w-full overflow-hidden rounded-full"
        style={{ height }}
      >
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              width: `${(seg.value / total) * 100}%`,
              backgroundColor: seg.color,
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-[var(--text-secondary)]">
              {seg.label}{' '}
              <span className="font-medium text-[var(--fg)]">
                {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
