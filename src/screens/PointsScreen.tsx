'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'MYR', flag: '🇲🇾' },
  { code: 'JPY', flag: '🇯🇵' },
  { code: 'AUD', flag: '🇦🇺' },
  { code: 'GBP', flag: '🇬🇧' },
];
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

// KrisFlyer award chart — one-way from SIN, approximate
// null = not available on this route
type AwardRates = { saver: number; advantage: number; cash: number } | null;
interface Redemption {
  destination: string;
  flag: string;
  economy: AwardRates;
  business: AwardRates;
  first: AwardRates;
}

const REDEMPTIONS: Redemption[] = [
  {
    destination: 'Kuala Lumpur', flag: '🇲🇾',
    economy:  { saver: 3750,   advantage: 5500,   cash: 120 },
    business: { saver: 12500,  advantage: 18750,  cash: 450 },
    first:    null,
  },
  {
    destination: 'Bangkok', flag: '🇹🇭',
    economy:  { saver: 8750,   advantage: 13125,  cash: 280 },
    business: { saver: 19000,  advantage: 28500,  cash: 850 },
    first:    null,
  },
  {
    destination: 'Hong Kong', flag: '🇭🇰',
    economy:  { saver: 10000,  advantage: 15000,  cash: 350 },
    business: { saver: 30000,  advantage: 45000,  cash: 1200 },
    first:    null,
  },
  {
    destination: 'Tokyo', flag: '🇯🇵',
    economy:  { saver: 17500,  advantage: 26250,  cash: 600 },
    business: { saver: 51000,  advantage: 76500,  cash: 2200 },
    first:    { saver: 85500,  advantage: 128250, cash: 4500 },
  },
  {
    destination: 'Sydney', flag: '🇦🇺',
    economy:  { saver: 22500,  advantage: 33750,  cash: 750 },
    business: { saver: 67500,  advantage: 101250, cash: 3000 },
    first:    null,
  },
  {
    destination: 'London', flag: '🇬🇧',
    economy:  { saver: 67500,  advantage: 101250, cash: 1800 },
    business: { saver: 132750, advantage: 199125, cash: 5500 },
    first:    { saver: 204750, advantage: 307125, cash: 11000 },
  },
  {
    destination: 'New York', flag: '🇺🇸',
    economy:  { saver: 77500,  advantage: 116250, cash: 2200 },
    business: { saver: 152500, advantage: 228750, cash: 6500 },
    first:    { saver: 228750, advantage: 343125, cash: 13000 },
  },
];

type CabinClass = 'economy' | 'business' | 'first';

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

function RedemptionRow({ destination, flag, rates, cabin, totalMiles }: {
  destination: string; flag: string;
  rates: NonNullable<AwardRates>;
  cabin: CabinClass;
  totalMiles: number;
}) {
  const cabinLabel = cabin === 'economy' ? 'Economy' : cabin === 'business' ? 'Business' : 'First';

  return (
    <div className="py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xl">{flag}</span>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{destination}</p>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-auto">{cabinLabel}</span>
      </div>
      {(['saver', 'advantage'] as const).map(type => {
        const miles = rates[type];
        const canAfford = totalMiles >= miles;
        const pct = Math.min((totalMiles / miles) * 100, 100);
        return (
          <div key={type} className={`mb-2 ${!canAfford ? 'opacity-55' : ''}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 capitalize">{type}</span>
              <div className="flex items-center gap-2">
                {!canAfford && (
                  <span className="text-[10px] text-zinc-400">{fmt(miles - Math.floor(totalMiles))} to go</span>
                )}
                <span className={`text-xs font-bold ${canAfford ? 'text-[#0d6e5a]' : 'text-zinc-400'}`}>
                  {fmt(miles)} mi
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${canAfford ? 'bg-[#0d6e5a]' : 'bg-zinc-300 dark:bg-zinc-600'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-zinc-400 mt-1">≈ SGD {rates.cash} cash fare</p>
    </div>
  );
}

export default function PointsScreen() {
  const { cards } = useApp();
  const [cpp, setCpp] = useState(1.5); // cents per mile (SGD)
  const [manualMiles, setManualMiles] = useState('');
  const [selectedCabin, setSelectedCabin] = useState<CabinClass>('economy');
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchRates = useCallback(() => {
    setRatesLoading(true);
    setRatesError(false);
    fetch('https://open.er-api.com/v6/latest/SGD')
      .then(r => r.json())
      .then(data => {
        setRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }));
      })
      .catch(() => setRatesError(true))
      .finally(() => setRatesLoading(false));
  }, []);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const { totalMiles, byProgram } = useMemo(() => {
    let total = 0;
    const prog: Record<string, number> = {};
    for (const card of cards) {
      if (card.milesProgram !== 'KrisFlyer') continue;
      const earned = Math.floor(card.currentSpent * card.milesRate);
      total += earned;
      prog[card.milesProgram] = (prog[card.milesProgram] ?? 0) + earned;
    }
    return { totalMiles: total, byProgram: prog };
  }, [cards]);

  const displayMiles = manualMiles !== '' ? parseInt(manualMiles) || 0 : totalMiles;
  const estimatedValue = (displayMiles * cpp) / 100;

  const milesCards = cards.filter(c => c.milesProgram === 'KrisFlyer');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#0d6e5a] dark:bg-[#0a5747] px-5 pt-14 pb-12">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Singapore Airlines</p>
        <h1 className="text-white text-2xl font-bold mb-0.5">KrisFlyer Miles</h1>
        <p className="text-white/60 text-sm">Based on your monthly spend</p>
      </div>

      <div className="px-4 space-y-5 -mt-6">
        {/* Total miles card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">KrisFlyer Miles Balance</p>
          <input
            type="number"
            inputMode="numeric"
            placeholder={fmt(totalMiles)}
            value={manualMiles}
            onChange={(e) => setManualMiles(e.target.value)}
            className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 bg-transparent w-full outline-none border-b-2 border-zinc-200 dark:border-zinc-700 focus:border-[#0d6e5a] pb-1 mb-1 transition-colors"
          />
          <p className="text-sm text-zinc-400 mb-5">Enter your actual KrisFlyer balance</p>

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

            {/* Live exchange rates */}
            <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Live Conversion</p>
                {lastUpdated && !ratesError && (
                  <p className="text-[10px] text-zinc-300 dark:text-zinc-600">Updated {lastUpdated}</p>
                )}
              </div>

              {ratesLoading && (
                <div className="space-y-2">
                  {CURRENCIES.map(c => (
                    <div key={c.code} className="flex justify-between items-center animate-pulse">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.flag}</span>
                        <div className="h-3 w-8 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      </div>
                      <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    </div>
                  ))}
                </div>
              )}

              {ratesError && (
                <div className="text-center py-2">
                  <p className="text-xs text-zinc-400">Could not load live rates</p>
                  <button
                    onClick={fetchRates}
                    className="text-xs font-semibold text-[#0d6e5a] mt-1"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!ratesLoading && !ratesError && rates && (
                <div className="space-y-2.5">
                  {CURRENCIES.map(({ code, flag }) => {
                    const rate = rates[code];
                    const converted = estimatedValue * (rate ?? 1);
                    const isJpy = code === 'JPY';
                    return (
                      <div key={code} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{flag}</span>
                          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{code}</span>
                        </div>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {isJpy
                            ? `¥${Math.round(converted).toLocaleString()}`
                            : converted.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
          <div className="pt-4 pb-3">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">What Can You Redeem?</p>
            <p className="text-[10px] text-zinc-400 mb-3">One-way from SIN · Saver &amp; Advantage awards</p>
            {/* Cabin class selector */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 gap-1">
              {(['economy', 'business', 'first'] as CabinClass[]).map(cabin => (
                <button
                  key={cabin}
                  onClick={() => setSelectedCabin(cabin)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedCabin === cabin
                      ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                >
                  {cabin}
                </button>
              ))}
            </div>
          </div>
          {REDEMPTIONS.filter(r => r[selectedCabin] !== null).map((r) => (
            <RedemptionRow
              key={r.destination}
              destination={r.destination}
              flag={r.flag}
              rates={r[selectedCabin]!}
              cabin={selectedCabin}
              totalMiles={displayMiles}
            />
          ))}
        </div>

        <div className="text-center pb-4">
          <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
            Award rates are approximate · Exchange rates updated live
          </p>
        </div>
      </div>
    </div>
  );
}
