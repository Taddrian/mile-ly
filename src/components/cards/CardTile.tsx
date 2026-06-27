import { CreditCard } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';

interface CardTileProps {
  card: CreditCard;
}

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CardTile({ card }: CardTileProps) {
  const pct = card.monthlyLimit > 0 ? (card.currentSpent / card.monthlyLimit) * 100 : 0;
  const remaining = card.monthlyLimit - card.currentSpent;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">{card.name}</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">•••• {card.last4}</p>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
          style={{ backgroundColor: card.color }}
        >
          {card.name.charAt(0)}
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Spent</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">SGD {fmt(card.currentSpent)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Limit</span>
          <span className="text-zinc-600 dark:text-zinc-300">SGD {fmt(card.monthlyLimit)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">Remaining</span>
          <span className={`font-medium ${remaining < 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
            SGD {fmt(Math.max(remaining, 0))}
          </span>
        </div>
      </div>

      <ProgressBar value={card.currentSpent} max={card.monthlyLimit} color={card.color} showLabel />
    </div>
  );
}
