'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import TransactionList from '@/components/transactions/TransactionList';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import Modal from '@/components/ui/Modal';

export default function TransactionsScreen() {
  const { transactions, cards, categories, addTransaction, deleteTransaction, addCategory } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalSpend = transactions.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-4 md:pt-6">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">History</p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Transactions</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          {transactions.length} entries · SGD {totalSpend.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="px-4">
        <TransactionList transactions={transactions} cards={cards} onDelete={deleteTransaction} />
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-[#0d6e5a] text-white rounded-full shadow-lg hover:bg-[#0a5747] active:scale-95 transition-all flex items-center justify-center z-30"
        style={{ boxShadow: '0 4px 20px rgba(13, 110, 90, 0.4)' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Transaction" key={showModal ? 'open' : 'closed'}>
        <AddTransactionForm
          cards={cards}
          categories={categories}
          onSubmit={(data) => { addTransaction(data); setShowModal(false); }}
          onAddCategory={addCategory}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
