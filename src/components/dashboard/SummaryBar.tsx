import { CreditCard } from '@/types';
import ProgressBar from '@/components/ui/ProgressBar';

interface SummaryBarProps {
  cards: CreditCard[];
}

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SummaryBar({ cards }: SummaryBarProps) {
  const totalLimit = cards.reduce((s, c) => s + c.monthlyLimit, 0);
  const totalSpent = cards.reduce((s, c) => s + c.currentSpent, 0);
  const totalRemaining = totalLimit - totalSpent;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
      <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
        June Overview
      </p>

      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
        SGD {fmt(totalSpent)}
      </p>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">
        of SGD {fmt(totalLimit)} total limit
      </p>

      <ProgressBar value={totalSpent} max={totalLimit} />

      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Remaining</p>
          <p className={`text-base font-semibold ${totalRemaining >= 0 ? 'text-[#0d6e5a]' : 'text-red-500'}`}>
            SGD {fmt(Math.max(totalRemaining, 0))}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-0.5">Cards</p>
          <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{cards.length} linked</p>
        </div>
      </div>
    </div>
  );
}
