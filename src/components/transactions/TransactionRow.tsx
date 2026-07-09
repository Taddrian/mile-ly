'use client';

import { useState } from 'react';
import { Transaction, CreditCard } from '@/types';
import Badge from '@/components/ui/Badge';

interface TransactionRowProps {
  transaction: Transaction;
  card?: CreditCard;
  onDelete?: (id: string) => void;
}

function fmt(n: number) {
  return n.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionRow({ transaction, card, onDelete }: TransactionRowProps) {
  const [confirming, setConfirming] = useState(false);
  const isIncome = transaction.type === 'income';

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ backgroundColor: isIncome ? '#0d6e5a' : (card?.color ?? '#6B7280') }}
      >
        {transaction.merchant.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-zinc-900 dark:text-zinc-100 text-sm truncate">{transaction.merchant}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {!isIncome && <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{card?.name ?? 'Unknown'}</span>}
          {!isIncome && <span className="text-zinc-300 dark:text-zinc-700">·</span>}
          <Badge label={transaction.category} />
        </div>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{fmtDate(transaction.date)}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <p className={`font-semibold text-sm ${isIncome ? 'text-[#0d6e5a]' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {isIncome ? '+' : '-'}SGD {fmt(transaction.amount)}
        </p>
        {onDelete && (
          confirming ? (
            <div className="flex gap-1">
              <button onClick={() => onDelete(transaction.id)} className="text-xs text-red-500 font-semibold px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40">Del</button>
              <button onClick={() => setConfirming(false)} className="text-xs text-zinc-400 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">✕</button>
            </div>
          ) : (
            <button onClick={() => setConfirming(true)} className="text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none">⋯</button>
          )
        )}
      </div>
    </div>
  );
}
