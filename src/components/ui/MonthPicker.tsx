'use client';

import { addCycle, formatCycleLabel } from '@/lib/cycle';

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
  cycleStartDay: number;
  className?: string;
}

export default function MonthPicker({ value, onChange, cycleStartDay, className = '' }: MonthPickerProps) {
  const label = formatCycleLabel(value, cycleStartDay);

  function shift(delta: number) {
    onChange(addCycle(value, delta));
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        onClick={() => shift(-1)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors text-base leading-none"
        aria-label="Previous cycle"
      >
        ‹
      </button>
      <span className="text-sm font-medium px-1 min-w-[110px] text-center">{label}</span>
      <button
        onClick={() => shift(1)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors text-base leading-none"
        aria-label="Next cycle"
      >
        ›
      </button>
    </div>
  );
}
