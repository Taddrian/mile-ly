import { Transaction, CreditCard } from '@/types';
import Badge from '@/components/ui/Badge';

interface TransactionRowProps {
  transaction: Transaction;
  card?: CreditCard;
}

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionRow({ transaction, card }: TransactionRowProps) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ backgroundColor: card?.color ?? '#6B7280' }}
      >
        {transaction.merchant.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate">{transaction.merchant}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{card?.name ?? 'Unknown'}</span>
          <span className="text-zinc-300 dark:text-zinc-700">·</span>
          <Badge label={transaction.category} />
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{fmtDate(transaction.date)}</p>
      </div>
      <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm shrink-0">
        SGD {fmt(transaction.amount)}
      </p>
    </div>
  );
}
