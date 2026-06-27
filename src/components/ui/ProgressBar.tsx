interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({ value, max, color = '#0d6e5a', showLabel = false, className = '' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const displayColor = pct >= 90 ? '#dc2626' : pct >= 75 ? '#d97706' : color;

  return (
    <div className={`w-full ${className}`}>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: displayColor }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 block">
          {pct.toFixed(0)}% used
        </span>
      )}
    </div>
  );
}
