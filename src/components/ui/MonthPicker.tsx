'use client';

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
  className?: string;
}

export default function MonthPicker({ value, onChange, className = '' }: MonthPickerProps) {
  const date = new Date(value);
  const label = date.toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });

  function shift(delta: number) {
    const d = new Date(value);
    d.setMonth(d.getMonth() + delta);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => shift(-1)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors text-base leading-none"
        aria-label="Previous month"
      >
        ‹
      </button>
      <span className="text-sm font-medium px-1 min-w-[110px] text-center">{label}</span>
      <button
        onClick={() => shift(1)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors text-base leading-none"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}
