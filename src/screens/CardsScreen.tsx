'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import CardTile from '@/components/cards/CardTile';
import AddCardForm from '@/components/cards/AddCardForm';
import Modal from '@/components/ui/Modal';

export default function CardsScreen() {
  const { cards, addCard } = useApp();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen">
      <div className="px-4 pt-14 pb-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">My Cards</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{cards.length} cards linked</p>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {cards.map((card) => (
          <CardTile key={card.id} card={card} />
        ))}
      </div>

      <div className="px-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3.5 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> Add Card
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Card"
        key={showModal ? 'open' : 'closed'}
      >
        <AddCardForm
          onSubmit={(data) => { addCard(data); setShowModal(false); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
