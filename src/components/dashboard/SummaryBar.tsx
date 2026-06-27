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
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Total Limit</p>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            <span className="text-xs font-normal text-zinc-400 mr-0.5">SGD</span>
            {fmt(totalLimit)}
          </p>
        </div>
        <div className="text-center border-x border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Spent</p>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            <span className="text-xs font-normal text-zinc-400 mr-0.5">SGD</span>
            {fmt(totalSpent)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">Remaining</p>
          <p className={`text-base font-bold ${totalRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            <span className="text-xs font-normal text-zinc-400 mr-0.5">SGD</span>
            {fmt(Math.max(totalRemaining, 0))}
          </p>
        </div>
      </div>
      <ProgressBar value={totalSpent} max={totalLimit} color="#3B82F6" showLabel />
    </div>
  );
}
