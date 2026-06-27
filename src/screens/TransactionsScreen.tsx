'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import TransactionList from '@/components/transactions/TransactionList';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import Modal from '@/components/ui/Modal';

export default function TransactionsScreen() {
  const { transactions, cards, addTransaction } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Transactions</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {transactions.length} transactions · SGD {totalSpend.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
        </p>
      </div>

      <div className="px-4">
        <TransactionList transactions={transactions} cards={cards} />
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-2xl z-30"
      >
        +
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Transaction"
        key={showModal ? 'open' : 'closed'}
      >
        <AddTransactionForm
          cards={cards}
          onSubmit={(data) => { addTransaction(data); setShowModal(false); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
