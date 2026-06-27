'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CreditCard, MilesProgram } from '@/types';

const PROGRAM_COLORS: Record<MilesProgram, string> = {
  KrisFlyer: '#1a3c6e',
  'Asia Miles': '#006b5b',
  Cashback: '#6b21a8',
  Other: '#71717a',
};

const PROGRAM_LOGO_BG: Record<MilesProgram, string> = {
  KrisFlyer: 'bg-[#1a3c6e]',
  'Asia Miles': 'bg-[#006b5b]',
  Cashback: 'bg-purple-700',
  Other: 'bg-zinc-500',
};

// KrisFlyer Saver award chart (one-way Economy, approximate)
const REDEMPTIONS = [
  { destination: 'Kuala Lumpur', flag: '🇲🇾', miles: 3750, cash: 120 },
  { destination: 'Bangkok', flag: '🇹🇭', miles: 8750, cash: 280 },
  { destination: 'Hong Kong', flag: '🇭🇰', miles: 10000, cash: 350 },
  { destination: 'Tokyo', flag: '🇯🇵', miles: 17500, cash: 600 },
  { destination: 'Sydney', flag: '🇦🇺', miles: 22500, cash: 750 },
  { destination: 'London', flag: '🇬🇧', miles: 67500, cash: 1800 },
  { destination: 'New York', flag: '🇺🇸', miles: 77500, cash: 2200 },
];

function fmt(n: number) {
  return Math.round(n).toLocaleString('en-SG');
}

function CardMilesRow({ card }: { card: CreditCard }) {
  const milesEarned = Math.floor(card.currentSpent * card.milesRate);
  const color = PROGRAM_COLORS[card.milesProgram];

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div
        className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-xs font-bold"
        style={{ backgroundColor: card.color }}
      >
        {card.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{card.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
            style={{ backgroundColor: color }}
          >
            {card.milesProgram}
          </span>
          <span className="text-xs text-zinc-400">{card.milesRate} mpd</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{fmt(milesEarned)}</p>
        <p className="text-xs text-zinc-400">miles</p>
      </div>
    </div>
  );
}

function RedemptionRow({ destination, flag, miles, cash, totalMiles }: { destination: string; flag: string; miles: number; cash: number; totalMiles: number }) {
  const canAfford = totalMiles >= miles;
  const pct = Math.min((totalMiles / miles) * 100, 100);

  return (
    <div className={`py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${!canAfford ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{flag}</span>
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{destination}</p>
            <p className="text-xs text-zinc-400">Economy · SQ Saver award</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${canAfford ? 'text-[#0d6e5a]' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {fmt(miles)} mi
          </p>
          <p className="text-xs text-zinc-400">≈ SGD {cash}</p>
        </div>
      </div>
      <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${canAfford ? 'bg-[#0d6e5a]' : 'bg-zinc-300 dark:bg-zinc-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!canAfford && (
        <p className="text-xs text-zinc-400 mt-1">{fmt(miles - Math.floor(totalMiles))} miles to go</p>
      )}
    </div>
  );
}

export default function PointsScreen() {
  const { cards } = useApp();
  const [cpp, setCpp] = useState(1.5); // cents per mile (SGD)

  const { totalMiles, byProgram } = useMemo(() => {
    let total = 0;
    const prog: Record<string, number> = {};
    for (const card of cards) {
      if (card.milesProgram === 'Cashback') continue;
      const earned = Math.floor(card.currentSpent * card.milesRate);
      total += earned;
      prog[card.milesProgram] = (prog[card.milesProgram] ?? 0) + earned;
    }
    return { totalMiles: total, byProgram: prog };
  }, [cards]);

  const estimatedValue = (totalMiles * cpp) / 100;

  const milesCards = cards.filter(c => c.milesProgram !== 'Cashback');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#0d6e5a] dark:bg-[#0a5747] px-5 pt-14 pb-12">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Air Miles</p>
        <h1 className="text-white text-2xl font-bold mb-0.5">Points Tracker</h1>
        <p className="text-white/60 text-sm">Based on your monthly spend</p>
      </div>

      <div className="px-4 space-y-5 -mt-6">
        {/* Total miles card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Total Miles Earned</p>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{fmt(totalMiles)}</p>
          <p className="text-sm text-zinc-400 mb-4">miles this month across all cards</p>

          {/* By program */}
          {Object.entries(byProgram).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {Object.entries(byProgram).map(([prog, miles]) => (
                <div key={prog} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${PROGRAM_LOGO_BG[prog as MilesProgram]}`}>
                  <span className="text-white text-xs font-bold">{prog}</span>
                  <span className="text-white/80 text-xs">{fmt(miles)} mi</span>
                </div>
              ))}
            </div>
          )}

          {/* Value estimator */}
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Value Estimate</p>
              <p className="text-lg font-bold text-[#0d6e5a]">
                SGD {estimatedValue.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400 shrink-0">0.5¢</span>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={cpp}
                onChange={(e) => setCpp(parseFloat(e.target.value))}
                className="flex-1 accent-[#0d6e5a]"
              />
              <span className="text-xs text-zinc-400 shrink-0">3.0¢</span>
            </div>
            <p className="text-center text-xs text-zinc-400 mt-1">
              at <span className="font-semibold text-zinc-600 dark:text-zinc-300">{cpp.toFixed(1)}¢</span> per mile (SGD)
            </p>
            <p className="text-center text-[10px] text-zinc-300 dark:text-zinc-600 mt-1">
              KrisFlyer economy ≈ 1.5¢ · Business ≈ 3.0¢
            </p>
          </div>
        </div>

        {/* Per-card breakdown */}
        {milesCards.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pt-4 pb-1">By Card</p>
            {milesCards.map(card => (
              <CardMilesRow key={card.id} card={card} />
            ))}
          </div>
        )}

        {/* Redemption ideas */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="pt-4 pb-1">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">What Can You Redeem?</p>
            <p className="text-xs text-zinc-400 mt-0.5">KrisFlyer Economy Saver · one-way from SIN</p>
          </div>
          {REDEMPTIONS.map((r) => (
            <RedemptionRow key={r.destination} {...r} totalMiles={totalMiles} />
          ))}
        </div>

        <div className="text-center pb-4">
          <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
            Miles calculated on current month spend · Rates are approximate
          </p>
        </div>
      </div>
    </div>
  );
}
