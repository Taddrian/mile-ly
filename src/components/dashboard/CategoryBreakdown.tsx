import { Transaction } from '@/types';

interface CategoryBreakdownProps {
  transactions: Transaction[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drink': '#f97316',
  'Shopping': '#8b5cf6',
  'Groceries': '#22c55e',
  'Transport': '#3b82f6',
  'Entertainment': '#ec4899',
  'Health': '#14b8a6',
  'Utilities': '#f59e0b',
  'Other': '#94a3b8',
};

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CategoryBreakdown({ transactions }: CategoryBreakdownProps) {
  const totals: Record<string, number> = {};
  for (const t of transactions) {
    totals[t.category] = (totals[t.category] ?? 0) + t.amount;
  }

  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = sorted.reduce((s, [, v]) => s + v, 0);

  if (sorted.length === 0) {
    return <p className="text-sm text-zinc-400 text-center py-4">No spending data</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map(([cat, amount]) => {
        const pct = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
        const color = CATEGORY_COLORS[cat] ?? '#94a3b8';
        return (
          <div key={cat}>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{cat}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">{pct.toFixed(0)}%</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                  SGD {fmt(amount)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
