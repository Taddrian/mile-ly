'use client';

import { useState } from 'react';
import { CreditCard, MilesProgram } from '@/types';

interface AddCardFormProps {
  onSubmit: (card: Omit<CreditCard, 'id' | 'currentSpent'>) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#0D9488', '#2563EB', '#7C3AED', '#DB2777',
  '#E04E42', '#EA580C', '#D97706', '#65A30D',
  '#0891B2', '#4F46E5', '#BE185D', '#374151',
];

const PROGRAMS: MilesProgram[] = ['KrisFlyer', 'Asia Miles', 'Cashback', 'Other'];

// Common SG card presets for quick fill
const CARD_PRESETS: { name: string; milesRate: number; program: MilesProgram }[] = [
  { name: 'UOB PRVI Miles', milesRate: 1.4, program: 'KrisFlyer' },
  { name: 'DBS Altitude', milesRate: 1.3, program: 'KrisFlyer' },
  { name: 'Citi PremierMiles', milesRate: 1.2, program: 'KrisFlyer' },
  { name: 'UOB Preferred Platinum', milesRate: 4.0, program: 'KrisFlyer' },
  { name: 'Citi Rewards', milesRate: 4.0, program: 'KrisFlyer' },
  { name: 'HSBC Revolution', milesRate: 4.0, program: 'Asia Miles' },
  { name: 'SC Journey', milesRate: 1.2, program: 'KrisFlyer' },
];

const inputClass = 'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0d6e5a] transition-shadow';
const labelClass = 'block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5';

export default function AddCardForm({ onSubmit, onCancel }: AddCardFormProps) {
  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [milesRate, setMilesRate] = useState('');
  const [milesProgram, setMilesProgram] = useState<MilesProgram>('KrisFlyer');
  const [showPresets, setShowPresets] = useState(false);

  function applyPreset(preset: typeof CARD_PRESETS[0]) {
    setName(preset.name);
    setMilesRate(String(preset.milesRate));
    setMilesProgram(preset.program);
    setShowPresets(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      last4,
      color,
      monthlyLimit: parseFloat(limit) || 0,
      milesRate: parseFloat(milesRate) || 1.0,
      milesProgram,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Quick presets */}
      <div>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-xs font-semibold text-[#0d6e5a] flex items-center gap-1"
        >
          <span>{showPresets ? '▾' : '▸'}</span> Quick fill from common SG cards
        </button>
        {showPresets && (
          <div className="mt-2 space-y-1">
            {CARD_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="w-full text-left px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{p.name}</span>
                <span className="text-xs text-zinc-400 ml-2">{p.milesRate} mpd · {p.program}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Card Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DBS Altitude" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Last 4 Digits (optional)</label>
        <input
          type="text"
          value={last4}
          onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="1234"
          maxLength={4}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Monthly Limit (SGD, optional)</label>
        <input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="5000" min="0" step="0.01" className={inputClass} />
      </div>

      {/* Miles fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Miles per SGD (optional)</label>
          <input
            type="number"
            value={milesRate}
            onChange={(e) => setMilesRate(e.target.value)}
            placeholder="1.2"
            min="0"
            step="0.1"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Program</label>
          <select value={milesProgram} onChange={(e) => setMilesProgram(e.target.value as MilesProgram)} className={inputClass}>
            {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Card Color</label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-zinc-900 dark:ring-white scale-110' : ''
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-[#0d6e5a] text-white text-sm font-semibold hover:bg-[#0a5747] transition-colors"
        >
          Save Card
        </button>
      </div>
    </form>
  );
}
