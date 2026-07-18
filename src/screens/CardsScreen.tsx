'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CreditCard } from '@/types';
import { fmtAmount } from '@/lib/currency';
import AddCardForm from '@/components/cards/AddCardForm';
import Modal from '@/components/ui/Modal';
import ProgressBar from '@/components/ui/ProgressBar';

function lighten(hex: string, amount = 40): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function CardItem({ card, currency }: { card: CreditCard; currency: string }) {
  const pct = card.monthlyLimit > 0 ? (card.currentSpent / card.monthlyLimit) * 100 : 0;
  const remaining = card.monthlyLimit - card.currentSpent;
  const gradientEnd = lighten(card.color, 30);

  return (
    <div className="w-full">
      <div
        className="relative rounded-3xl overflow-hidden shadow-xl"
        style={{ background: `linear-gradient(135deg, ${card.color} 0%, ${gradientEnd} 100%)`, aspectRatio: '1.586' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 bg-white" />
        <div className="absolute top-10 -right-4 w-24 h-24 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-10 bg-white" />

        <div className="relative p-6 flex flex-col justify-between h-full">
          {/* Top row */}
          <div className="flex justify-between items-start">
            <p className="text-white font-semibold text-base tracking-wide">{card.name}</p>
            <div className="text-white/80 text-xs font-medium bg-white/20 px-2 py-1 rounded-lg">
              {pct.toFixed(0)}% used
            </div>
          </div>

          {/* Chip */}
          <div className="w-10 h-7 rounded bg-yellow-300/80 flex items-center justify-center">
            <div className="w-6 h-5 rounded-sm border border-yellow-500/40 grid grid-cols-2 gap-px">
              <div className="bg-yellow-500/30 rounded-tl-sm" />
              <div className="bg-yellow-500/30 rounded-tr-sm" />
              <div className="bg-yellow-500/30 rounded-bl-sm" />
              <div className="bg-yellow-500/30 rounded-br-sm" />
            </div>
          </div>

          {/* Bottom */}
          <div>
            <p className="text-white/90 text-base font-mono tracking-widest mb-3">
              •••• •••• •••• {card.last4}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-white/60 text-xs mb-0.5">Spent</p>
                <p className="text-white font-bold text-lg">{currency} {fmtAmount(card.currentSpent, currency)}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs mb-0.5">Remaining</p>
                <p className="text-white font-semibold text-base">{currency} {fmtAmount(Math.max(remaining, 0), currency)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar below card */}
      <div className="mt-3 px-1">
        <ProgressBar value={card.currentSpent} max={card.monthlyLimit} color={card.color} showLabel />
      </div>
    </div>
  );
}

export default function CardsScreen() {
  const { cards, addCard, currency } = useApp();
  const [showModal, setShowModal] = useState(false);

  const totalLimit = cards.reduce((s, c) => s + c.monthlyLimit, 0);
  const totalSpent = cards.reduce((s, c) => s + c.currentSpent, 0);

  return (
    <div className="min-h-screen">
      <div className="px-5 pt-14 pb-4 md:pt-6">
        <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Your Cards</p>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{cards.length} Cards Linked</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-0.5">
          {currency} {fmtAmount(totalSpent, currency)} spent of {currency} {fmtAmount(totalLimit, currency)} total limit
        </p>
      </div>

      <div className="px-4 pb-4">
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {cards.map((card) => (
            <CardItem key={card.id} card={card} currency={currency} />
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 mt-4 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-400 dark:text-zinc-500 hover:border-[#0d6e5a] hover:text-[#0d6e5a] transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span> Add New Card
        </button>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Card" key={showModal ? 'open' : 'closed'}>
        <AddCardForm
          onSubmit={(data) => { addCard(data); setShowModal(false); }}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
}
