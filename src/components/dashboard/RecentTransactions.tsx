import { Transaction, CreditCard } from '@/types';
import TransactionRow from '@/components/transactions/TransactionRow';

interface RecentTransactionsProps {
  transactions: Transaction[];
  cards: CreditCard[];
}

export default function RecentTransactions({ transactions, cards }: RecentTransactionsProps) {
  const cardMap = Object.fromEntries(cards.map((c) => [c.id, c]));
  const recent = transactions.slice(0, 5);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl px-5 shadow-sm border border-zinc-100 dark:border-zinc-800">
      {recent.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">No transactions yet</p>
      ) : (
        recent.map((txn) => (
          <TransactionRow key={txn.id} transaction={txn} card={cardMap[txn.cardId]} />
        ))
      )}
    </div>
  );
}
