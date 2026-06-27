import { CreditCard } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';

interface CardTileProps {
  card: CreditCard;
}

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function lighten(hex: string, amount = 40): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function CardTile({ card }: CardTileProps) {
  const pct = card.monthlyLimit > 0 ? (card.currentSpent / card.monthlyLimit) * 100 : 0;
  const remaining = card.monthlyLimit - card.currentSpent;
  const gradientEnd = lighten(card.color, 30);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800">
      {/* Card Visual */}
      <div
        className="relative w-full p-5 pb-6"
        style={{ background: `linear-gradient(135deg, ${card.color} 0%, ${gradientEnd} 100%)` }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-20"
          style={{ backgroundColor: 'white' }}
        />
        <div
          className="absolute top-8 -right-2 w-20 h-20 rounded-full opacity-10"
          style={{ backgroundColor: 'white' }}
        />

        <div className="relative">
          {/* Card name */}
          <p className="text-white font-semibold text-sm tracking-wide opacity-95">{card.name}</p>

          {/* Chip */}
          <div className="mt-4 mb-3">
            <div className="w-8 h-6 rounded bg-yellow-300/80 flex items-center justify-center">
              <div className="w-5 h-4 rounded-sm border border-yellow-500/40 grid grid-cols-2 gap-px">
                <div className="bg-yellow-500/30 rounded-tl-sm" />
                <div className="bg-yellow-500/30 rounded-tr-sm" />
                <div className="bg-yellow-500/30 rounded-bl-sm" />
                <div className="bg-yellow-500/30 rounded-br-sm" />
              </div>
            </div>
          </div>

          {/* Card number */}
          <p className="text-white/90 text-sm font-mono tracking-widest">
            •••• •••• •••• {card.last4}
          </p>
        </div>
      </div>

      {/* Spending info */}
      <div className="px-5 py-4">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Monthly Spend</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              SGD {fmt(card.currentSpent)}
              <span className="text-sm font-normal text-zinc-400 ml-1">/ {fmt(card.monthlyLimit)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Remaining</p>
            <p className={`text-base font-semibold ${remaining >= 0 ? 'text-[#0d6e5a]' : 'text-red-500'}`}>
              SGD {fmt(Math.max(remaining, 0))}
            </p>
          </div>
        </div>

        <ProgressBar value={card.currentSpent} max={card.monthlyLimit} color={card.color} showLabel />
      </div>
    </div>
  );
}
