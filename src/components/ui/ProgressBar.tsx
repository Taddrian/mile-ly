interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ value, max, color = '#3B82F6', showLabel = false, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const displayColor = pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : color;

  return (
    <div className={`w-full ${className}`}>
      <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: displayColor }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
          {pct.toFixed(0)}% used
        </span>
      )}
    </div>
  );
}
