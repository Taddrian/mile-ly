'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { CreditCard, MilesProgram } from '@/types';

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'MYR', flag: '🇲🇾' },
  { code: 'JPY', flag: '🇯🇵' },
  { code: 'AUD', flag: '🇦🇺' },
  { code: 'GBP', flag: '🇬🇧' },
];

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

type AwardRates = { saver: number; advantage: number; cash: number } | null;
type CabinClass = 'economy' | 'business' | 'first';

interface Redemption {
  destination: string;
  region: string;
  flag: string;
  economy: AwardRates;
  business: AwardRates;
  first: AwardRates;
}

// KrisFlyer award chart — one-way from SIN, approximate. null = not operated.
const ALL_DESTINATIONS: Redemption[] = [
  // Malaysia / Brunei
  { destination: 'Kuala Lumpur',   region: 'Malaysia',       flag: '🇲🇾', economy: { saver: 3750,   advantage: 5500,   cash: 120  }, business: { saver: 12500,  advantage: 18750,  cash: 450  }, first: null },
  { destination: 'Kota Kinabalu',  region: 'Malaysia',       flag: '🇲🇾', economy: { saver: 3750,   advantage: 5500,   cash: 150  }, business: { saver: 12500,  advantage: 18750,  cash: 500  }, first: null },
  { destination: 'Penang',         region: 'Malaysia',       flag: '🇲🇾', economy: { saver: 3750,   advantage: 5500,   cash: 130  }, business: { saver: 12500,  advantage: 18750,  cash: 480  }, first: null },
  { destination: 'Brunei',         region: 'Malaysia',       flag: '🇧🇳', economy: { saver: 3750,   advantage: 5500,   cash: 160  }, business: { saver: 12500,  advantage: 18750,  cash: 520  }, first: null },
  // Southeast Asia
  { destination: 'Bangkok',        region: 'Southeast Asia', flag: '🇹🇭', economy: { saver: 8750,   advantage: 13125,  cash: 280  }, business: { saver: 19000,  advantage: 28500,  cash: 850  }, first: null },
  { destination: 'Jakarta',        region: 'Southeast Asia', flag: '🇮🇩', economy: { saver: 8750,   advantage: 13125,  cash: 260  }, business: { saver: 19000,  advantage: 28500,  cash: 800  }, first: null },
  { destination: 'Bali',           region: 'Southeast Asia', flag: '🇮🇩', economy: { saver: 8750,   advantage: 13125,  cash: 300  }, business: { saver: 19000,  advantage: 28500,  cash: 900  }, first: null },
  { destination: 'Manila',         region: 'Southeast Asia', flag: '🇵🇭', economy: { saver: 8750,   advantage: 13125,  cash: 300  }, business: { saver: 19000,  advantage: 28500,  cash: 900  }, first: null },
  { destination: 'Ho Chi Minh',    region: 'Southeast Asia', flag: '🇻🇳', economy: { saver: 8750,   advantage: 13125,  cash: 250  }, business: { saver: 19000,  advantage: 28500,  cash: 780  }, first: null },
  { destination: 'Hanoi',          region: 'Southeast Asia', flag: '🇻🇳', economy: { saver: 8750,   advantage: 13125,  cash: 260  }, business: { saver: 19000,  advantage: 28500,  cash: 800  }, first: null },
  { destination: 'Yangon',         region: 'Southeast Asia', flag: '🇲🇲', economy: { saver: 8750,   advantage: 13125,  cash: 270  }, business: { saver: 19000,  advantage: 28500,  cash: 820  }, first: null },
  { destination: 'Phnom Penh',     region: 'Southeast Asia', flag: '🇰🇭', economy: { saver: 8750,   advantage: 13125,  cash: 280  }, business: { saver: 19000,  advantage: 28500,  cash: 850  }, first: null },
  // Northeast Asia
  { destination: 'Hong Kong',      region: 'Northeast Asia', flag: '🇭🇰', economy: { saver: 10000,  advantage: 15000,  cash: 350  }, business: { saver: 30000,  advantage: 45000,  cash: 1200 }, first: null },
  { destination: 'Taipei',         region: 'Northeast Asia', flag: '🇹🇼', economy: { saver: 10000,  advantage: 15000,  cash: 380  }, business: { saver: 30000,  advantage: 45000,  cash: 1250 }, first: null },
  { destination: 'Tokyo',          region: 'Northeast Asia', flag: '🇯🇵', economy: { saver: 17500,  advantage: 26250,  cash: 600  }, business: { saver: 51000,  advantage: 76500,  cash: 2200 }, first: { saver: 85500,  advantage: 128250, cash: 4500  } },
  { destination: 'Osaka',          region: 'Northeast Asia', flag: '🇯🇵', economy: { saver: 17500,  advantage: 26250,  cash: 580  }, business: { saver: 51000,  advantage: 76500,  cash: 2100 }, first: { saver: 85500,  advantage: 128250, cash: 4300  } },
  { destination: 'Seoul',          region: 'Northeast Asia', flag: '🇰🇷', economy: { saver: 17500,  advantage: 26250,  cash: 550  }, business: { saver: 51000,  advantage: 76500,  cash: 2000 }, first: null },
  { destination: 'Beijing',        region: 'Northeast Asia', flag: '🇨🇳', economy: { saver: 15000,  advantage: 22500,  cash: 500  }, business: { saver: 45000,  advantage: 67500,  cash: 1800 }, first: null },
  { destination: 'Shanghai',       region: 'Northeast Asia', flag: '🇨🇳', economy: { saver: 15000,  advantage: 22500,  cash: 480  }, business: { saver: 45000,  advantage: 67500,  cash: 1750 }, first: null },
  // South Asia
  { destination: 'Mumbai',         region: 'South Asia',     flag: '🇮🇳', economy: { saver: 23750,  advantage: 35625,  cash: 700  }, business: { saver: 71250,  advantage: 106875, cash: 2800 }, first: null },
  { destination: 'Delhi',          region: 'South Asia',     flag: '🇮🇳', economy: { saver: 23750,  advantage: 35625,  cash: 720  }, business: { saver: 71250,  advantage: 106875, cash: 2900 }, first: null },
  { destination: 'Chennai',        region: 'South Asia',     flag: '🇮🇳', economy: { saver: 15000,  advantage: 22500,  cash: 450  }, business: { saver: 45000,  advantage: 67500,  cash: 1600 }, first: null },
  { destination: 'Colombo',        region: 'South Asia',     flag: '🇱🇰', economy: { saver: 15000,  advantage: 22500,  cash: 420  }, business: { saver: 45000,  advantage: 67500,  cash: 1500 }, first: null },
  // Australia / New Zealand
  { destination: 'Sydney',         region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 22500,  advantage: 33750,  cash: 750  }, business: { saver: 67500,  advantage: 101250, cash: 3000 }, first: null },
  { destination: 'Melbourne',      region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 22500,  advantage: 33750,  cash: 750  }, business: { saver: 67500,  advantage: 101250, cash: 3000 }, first: null },
  { destination: 'Brisbane',       region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 22500,  advantage: 33750,  cash: 780  }, business: { saver: 67500,  advantage: 101250, cash: 3100 }, first: null },
  { destination: 'Perth',          region: 'Australia & NZ', flag: '🇦🇺', economy: { saver: 17500,  advantage: 26250,  cash: 600  }, business: { saver: 51000,  advantage: 76500,  cash: 2200 }, first: null },
  { destination: 'Auckland',       region: 'Australia & NZ', flag: '🇳🇿', economy: { saver: 28500,  advantage: 42750,  cash: 950  }, business: { saver: 85500,  advantage: 128250, cash: 3800 }, first: null },
  // Europe
  { destination: 'London',         region: 'Europe',         flag: '🇬🇧', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: { saver: 204750, advantage: 307125, cash: 11000 } },
  { destination: 'Paris',          region: 'Europe',         flag: '🇫🇷', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: { saver: 204750, advantage: 307125, cash: 11000 } },
  { destination: 'Amsterdam',      region: 'Europe',         flag: '🇳🇱', economy: { saver: 67500,  advantage: 101250, cash: 1750 }, business: { saver: 132750, advantage: 199125, cash: 5400 }, first: { saver: 204750, advantage: 307125, cash: 10500 } },
  { destination: 'Frankfurt',      region: 'Europe',         flag: '🇩🇪', economy: { saver: 67500,  advantage: 101250, cash: 1750 }, business: { saver: 132750, advantage: 199125, cash: 5400 }, first: { saver: 204750, advantage: 307125, cash: 10500 } },
  { destination: 'Zurich',         region: 'Europe',         flag: '🇨🇭', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: { saver: 204750, advantage: 307125, cash: 11000 } },
  { destination: 'Milan',          region: 'Europe',         flag: '🇮🇹', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: null },
  { destination: 'Copenhagen',     region: 'Europe',         flag: '🇩🇰', economy: { saver: 67500,  advantage: 101250, cash: 1750 }, business: { saver: 132750, advantage: 199125, cash: 5400 }, first: null },
  { destination: 'Manchester',     region: 'Europe',         flag: '🇬🇧', economy: { saver: 67500,  advantage: 101250, cash: 1700 }, business: { saver: 132750, advantage: 199125, cash: 5300 }, first: null },
  { destination: 'Barcelona',      region: 'Europe',         flag: '🇪🇸', economy: { saver: 67500,  advantage: 101250, cash: 1800 }, business: { saver: 132750, advantage: 199125, cash: 5500 }, first: null },
  // Middle East & Africa
  { destination: 'Dubai',          region: 'Middle East',    flag: '🇦🇪', economy: { saver: 35000,  advantage: 52500,  cash: 900  }, business: { saver: 85000,  advantage: 127500, cash: 3500 }, first: null },
  { destination: 'Johannesburg',   region: 'Africa',         flag: '🇿🇦', economy: { saver: 67500,  advantage: 101250, cash: 2000 }, business: { saver: 132750, advantage: 199125, cash: 6000 }, first: null },
  // USA
  { destination: 'New York',       region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2200 }, business: { saver: 152500, advantage: 228750, cash: 6500 }, first: { saver: 228750, advantage: 343125, cash: 13000 } },
  { destination: 'Los Angeles',    region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2000 }, business: { saver: 152500, advantage: 228750, cash: 6000 }, first: { saver: 228750, advantage: 343125, cash: 12000 } },
  { destination: 'San Francisco',  region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2100 }, business: { saver: 152500, advantage: 228750, cash: 6200 }, first: { saver: 228750, advantage: 343125, cash: 12500 } },
  { destination: 'Houston',        region: 'USA',            flag: '🇺🇸', economy: { saver: 77500,  advantage: 116250, cash: 2200 }, business: { saver: 152500, advantage: 228750, cash: 6500 }, first: null },
];

const DEFAULT_PICKS = ['Bangkok', 'Tokyo', 'Sydney', 'London', 'New York'];
const MAX_PICKS = 5;
const STORAGE_KEY = 'milely_destinations';
const ESCAPES_KEY = 'milely_escapes';

interface Escape {
  id: string;
  destination: string;
  flag: string;
  miles: number;
  cabin: string;
  travelWindow: string; // e.g. "1–31 Aug 2025"
}

const SAMPLE_ESCAPES: Escape[] = [
  { id: '1', destination: 'Bangkok',   flag: '🇹🇭', miles: 6500,  cabin: 'Economy',  travelWindow: 'Jul – Aug 2025' },
  { id: '2', destination: 'Bali',      flag: '🇮🇩', miles: 7000,  cabin: 'Economy',  travelWindow: 'Jul – Aug 2025' },
  { id: '3', destination: 'Tokyo',     flag: '🇯🇵', miles: 14000, cabin: 'Economy',  travelWindow: 'Jul – Aug 2025' },
];

const REGIONS = [...new Set(ALL_DESTINATIONS.map(d => d.region))];

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
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: color }}>
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
                {!canAfford && <span className="text-[10px] text-zinc-400">{fmt(miles - Math.floor(totalMiles))} to go</span>}
                <span className={`text-xs font-bold ${canAfford ? 'text-[#0d6e5a]' : 'text-zinc-400'}`}>{fmt(miles)} mi</span>
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

function DestinationPicker({ selected, onSave, onClose }: {
  selected: string[];
  onSave: (picks: string[]) => void;
  onClose: () => void;
}) {
  const [picks, setPicks] = useState<string[]>(selected);

  function toggle(dest: string) {
    setPicks(prev =>
      prev.includes(dest)
        ? prev.filter(d => d !== dest)
        : prev.length < MAX_PICKS ? [...prev, dest] : prev
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50 dark:bg-zinc-950 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-14 pb-4 bg-[#0d6e5a]">
        <div>
          <h2 className="text-white text-lg font-bold">Choose Destinations</h2>
          <p className="text-white/70 text-xs mt-0.5">Pick up to {MAX_PICKS} · {picks.length}/{MAX_PICKS} selected</p>
        </div>
        <button onClick={onClose} className="text-white/80 p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pb-24">
        {REGIONS.map(region => (
          <div key={region}>
            <p className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 sticky top-0">
              {region}
            </p>
            {ALL_DESTINATIONS.filter(d => d.region === region).map(d => {
              const isSelected = picks.includes(d.destination);
              const isDisabled = !isSelected && picks.length >= MAX_PICKS;
              return (
                <button
                  key={d.destination}
                  onClick={() => toggle(d.destination)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 transition-colors text-left ${
                    isDisabled ? 'opacity-35' : 'active:bg-zinc-100 dark:active:bg-zinc-800'
                  }`}
                >
                  <span className="text-xl">{d.flag}</span>
                  <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">{d.destination}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-[#0d6e5a] border-[#0d6e5a]' : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-5 pb-8 pt-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => { onSave(picks); onClose(); }}
          disabled={picks.length === 0}
          className="w-full py-3.5 rounded-2xl bg-[#0d6e5a] text-white font-semibold text-sm disabled:opacity-40 transition-opacity"
        >
          Save {picks.length} destination{picks.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
}

function EscapeRow({ escape, totalMiles, onDelete }: { escape: Escape; totalMiles: number; onDelete: () => void }) {
  const canAfford = totalMiles >= escape.miles;
  const pct = Math.min((totalMiles / escape.miles) * 100, 100);
  return (
    <div className="py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{escape.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{escape.destination}</p>
              <p className="text-xs text-zinc-400">{escape.cabin} · {escape.travelWindow}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${canAfford ? 'text-[#0d6e5a]' : 'text-zinc-500'}`}>{fmt(escape.miles)} mi</p>
              {!canAfford && <p className="text-[10px] text-zinc-400">{fmt(escape.miles - Math.floor(totalMiles))} to go</p>}
              {canAfford && <p className="text-[10px] text-[#0d6e5a] font-semibold">Can redeem ✓</p>}
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${canAfford ? 'bg-[#0d6e5a]' : 'bg-zinc-300 dark:bg-zinc-600'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <button onClick={onDelete} className="text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors mt-0.5 shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AddEscapeForm({ onAdd, onClose }: { onAdd: (e: Escape) => void; onClose: () => void }) {
  const [destination, setDestination] = useState('');
  const [flag, setFlag] = useState('');
  const [miles, setMiles] = useState('');
  const [cabin, setCabin] = useState('Economy');
  const [travelWindow, setTravelWindow] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination || !miles) return;
    onAdd({
      id: Date.now().toString(),
      destination: destination.trim(),
      flag: flag.trim() || '✈️',
      miles: parseInt(miles),
      cabin,
      travelWindow: travelWindow.trim(),
    });
    onClose();
  }

  const inputCls = 'w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0d6e5a] transition-shadow';
  const labelCls = 'block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-end max-w-md mx-auto">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full bg-white dark:bg-zinc-900 rounded-t-3xl px-5 pt-5 pb-10 shadow-xl">
        <div className="w-10 h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full mx-auto mb-5" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4">Add Spontaneous Escape</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className={labelCls}>Destination</label>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Tokyo" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Flag</label>
              <input type="text" value={flag} onChange={e => setFlag(e.target.value)} placeholder="🇯🇵" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Miles</label>
              <input type="number" value={miles} onChange={e => setMiles(e.target.value)} placeholder="14000" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Cabin</label>
              <select value={cabin} onChange={e => setCabin(e.target.value)} className={inputCls}>
                <option>Economy</option>
                <option>Business</option>
                <option>First</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Travel Window</label>
            <input type="text" value={travelWindow} onChange={e => setTravelWindow(e.target.value)} placeholder="e.g. Jul – Aug 2025" className={inputCls} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-500">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-xl bg-[#0d6e5a] text-white text-sm font-semibold">Add Deal</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PointsScreen() {
  const { cards } = useApp();
  const [cpp, setCpp] = useState(1.5);
  const [manualMiles, setManualMiles] = useState('');
  const [selectedCabin, setSelectedCabin] = useState<CabinClass>('economy');
  const [showPicker, setShowPicker] = useState(false);
  const [pickedDestinations, setPickedDestinations] = useState<string[]>(DEFAULT_PICKS);
  const [escapes, setEscapes] = useState<Escape[]>(SAMPLE_ESCAPES);
  const [showAddEscape, setShowAddEscape] = useState(false);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load saved destinations and escapes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPickedDestinations(JSON.parse(saved));
      const savedEscapes = localStorage.getItem(ESCAPES_KEY);
      if (savedEscapes) setEscapes(JSON.parse(savedEscapes));
    } catch {}
  }, []);

  function savePicks(picks: string[]) {
    setPickedDestinations(picks);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(picks)); } catch {}
  }

  function addEscape(escape: Escape) {
    const updated = [...escapes, escape];
    setEscapes(updated);
    try { localStorage.setItem(ESCAPES_KEY, JSON.stringify(updated)); } catch {}
  }

  function deleteEscape(id: string) {
    const updated = escapes.filter(e => e.id !== id);
    setEscapes(updated);
    try { localStorage.setItem(ESCAPES_KEY, JSON.stringify(updated)); } catch {}
  }

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

  const { totalMiles } = useMemo(() => {
    let total = 0;
    for (const card of cards) {
      if (card.milesProgram !== 'KrisFlyer') continue;
      total += Math.floor(card.currentSpent * card.milesRate);
    }
    return { totalMiles: total };
  }, [cards]);

  const displayMiles = manualMiles !== '' ? parseInt(manualMiles) || 0 : totalMiles;
  const estimatedValue = (displayMiles * cpp) / 100;
  const milesCards = cards.filter(c => c.milesProgram === 'KrisFlyer');

  const visibleDestinations = ALL_DESTINATIONS.filter(d =>
    pickedDestinations.includes(d.destination) && d[selectedCabin] !== null
  ).sort((a, b) => pickedDestinations.indexOf(a.destination) - pickedDestinations.indexOf(b.destination));

  return (
    <>
      {showPicker && (
        <DestinationPicker
          selected={pickedDestinations}
          onSave={savePicks}
          onClose={() => setShowPicker(false)}
        />
      )}

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
                <input type="range" min="0.5" max="3.0" step="0.1" value={cpp}
                  onChange={(e) => setCpp(parseFloat(e.target.value))} className="flex-1 accent-[#0d6e5a]" />
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
                    <button onClick={fetchRates} className="text-xs font-semibold text-[#0d6e5a] mt-1">Retry</button>
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
              {milesCards.map(card => <CardMilesRow key={card.id} card={card} />)}
            </div>
          )}

          {/* Redemption section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">What Can You Redeem?</p>
                <button
                  onClick={() => setShowPicker(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-[#0d6e5a]"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                  Edit
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mb-3">One-way from SIN · Saver &amp; Advantage awards</p>
              {/* Cabin selector */}
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

            {visibleDestinations.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-400">No First Class routes for your selections</p>
                <button onClick={() => setShowPicker(true)} className="text-xs font-semibold text-[#0d6e5a] mt-2">
                  Edit destinations
                </button>
              </div>
            ) : (
              visibleDestinations.map(r => (
                <RedemptionRow
                  key={r.destination}
                  destination={r.destination}
                  flag={r.flag}
                  rates={r[selectedCabin]!}
                  cabin={selectedCabin}
                  totalMiles={displayMiles}
                />
              ))
            )}
          </div>

          {/* Spontaneous Escapes */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Spontaneous Escapes</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">SQ flash deals · update monthly</p>
                </div>
                <button
                  onClick={() => setShowAddEscape(true)}
                  className="flex items-center gap-1 bg-[#0d6e5a] text-white text-xs font-semibold px-3 py-1.5 rounded-xl"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add
                </button>
              </div>
            </div>
            {escapes.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-zinc-400">No deals added yet</p>
                <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1">Tap Add when SQ releases monthly escapes</p>
              </div>
            ) : (
              escapes.map(escape => (
                <EscapeRow
                  key={escape.id}
                  escape={escape}
                  totalMiles={displayMiles}
                  onDelete={() => deleteEscape(escape.id)}
                />
              ))
            )}
          </div>

          <div className="text-center pb-4">
            <p className="text-[10px] text-zinc-300 dark:text-zinc-600">
              Award rates are approximate · Exchange rates updated live
            </p>
          </div>
        </div>
      </div>

      {showAddEscape && (
        <AddEscapeForm onAdd={addEscape} onClose={() => setShowAddEscape(false)} />
      )}
    </>
  );
}
