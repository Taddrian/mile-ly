'use client';

import { addCycle, formatCycleLabel } from '@/lib/cycle';

interface MonthPickerProps {
  value: string;
  onChange: (month: string) => void;
  cycleStartDay: number;
  className?: string;
  // Arrow-button background — defaults to the light-glass-on-dark treatment
  // every existing call site relies on. Text/glyph color isn't set here at
  // all; it inherits from whatever wraps this, so callers on a light
  // background just need to set their own wrapper `color`.
  buttonBg?: string;
}

export default function MonthPicker({ value, onChange, cycleStartDay, className = '', buttonBg = 'rgba(255,255,255,0.22)' }: MonthPickerProps) {
  const label = formatCycleLabel(value, cycleStartDay);

  function shift(delta: number) {
    onChange(addCycle(value, delta));
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <button
        onClick={() => shift(-1)}
        className="w-7 h-7 flex items-center justify-center rounded-full transition-colors text-base leading-none"
        style={{ background: buttonBg }}
        aria-label="Previous cycle"
      >
        ‹
      </button>
      <span className="font-display text-sm font-bold px-1 min-w-[110px] text-center">{label}</span>
      <button
        onClick={() => shift(1)}
        className="w-7 h-7 flex items-center justify-center rounded-full transition-colors text-base leading-none"
        style={{ background: buttonBg }}
        aria-label="Next cycle"
      >
        ›
      </button>
    </div>
  );
}
