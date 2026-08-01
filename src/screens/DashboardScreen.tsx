'use client';

import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { fmtShort, fmtCurrency, currencySymbol } from '@/lib/currency';
import { useCountUp } from '@/lib/useCountUp';
import { addCycle, cycleEndExclusive, daysLeftInCycle } from '@/lib/cycle';
import DonutRing from '@/components/ui/DonutRing';
import StatTile from '@/components/ui/StatTile';
import MonthPicker from '@/components/ui/MonthPicker';
import CategoryChip from '@/components/ui/CategoryChip';
import AddCardForm from '@/components/cards/AddCardForm';
import EditCardForm from '@/components/cards/EditCardForm';
import CardRow from '@/components/cards/CardRow';
import Modal from '@/components/ui/Modal';
import MiloMascot from '@/components/decor/MiloMascot';
import OnTrackBadge from '@/components/decor/OnTrackBadge';
import Sparkle from '@/components/decor/Sparkle';

function delta(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export default function DashboardScreen() {
  const { cards, addCard, updateCard, deleteCard, entries, categories, selectedMonth, setSelectedMonth, cycleStartDay, currency } = useApp();
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [remark, setRemark] = useState('');
  const [editingRemark, setEditingRemark] = useState(false);
  const [remarkInput, setRemarkInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(`milely_remark_${selectedMonth}`);
    setRemark(stored ?? '');
    setEditingRemark(false);
  }, [selectedMonth]);

  function saveRemark() {
    const trimmed = remarkInput.trim();
    setRemark(trimmed);
    if (trimmed) localStorage.setItem(`milely_remark_${selectedMonth}`, trimmed);
    else localStorage.removeItem(`milely_remark_${selectedMonth}`);
    setEditingRemark(false);
  }

  const [prevIncome, setPrevIncome] = useState(0);
  const [prevExpenses, setPrevExpenses] = useState(0);

  useEffect(() => {
    const prevCycleStart = addCycle(selectedMonth, -1);
    supabase.from('entries').select('amount, category_id')
      .gte('date', prevCycleStart)
      .lt('date', cycleEndExclusive(prevCycleStart))
      .then(({ data }) => {
        if (!data) return;
        let inc = 0, exp = 0;
        data.forEach((r) => {
          const cat = categories.find((c) => c.id === r.category_id);
          if (cat?.type === 'income') inc += Number(r.amount);
          else exp += Number(r.amount);
        });
        setPrevIncome(inc);
        setPrevExpenses(exp);
      });
  }, [selectedMonth, categories]);

  const income = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'income')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const expenses = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const saved = Math.max(0, income - expenses);
  const animatedSaved = useCountUp(saved);
  const daysLeft = daysLeftInCycle(selectedMonth, cycleStartDay);
  const perDay = daysLeft > 0 && saved > 0 ? saved / daysLeft : 0;

  const catSpend = useMemo(() => {
    const map: Record<string, { name: string; amount: number }> = {};
    entries.forEach((e) => {
      // Any entry tied to a card (itemized or quick balance-update) counts
      // toward total card spend, regardless of what category it's tagged with.
      if (e.cardId) {
        if (!map['__card_total']) map['__card_total'] = { name: 'Credit Card', amount: 0 };
        map['__card_total'].amount += e.amount;
        return;
      }
      const cat = categories.find((c) => c.id === e.categoryId);
      if (!cat || cat.type !== 'expense') return;
      if (!map[cat.id]) map[cat.id] = { name: cat.name, amount: 0 };
      map[cat.id].amount += e.amount;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [entries, categories]);

  // Surface the most recently touched card first (itemized entries or balance updates)
  const sortedCards = useMemo(() => {
    const lastActivity = (cardId: string) => {
      const times = entries
        .filter((e) => e.cardId === cardId)
        .map((e) => (e.createdAt ? new Date(e.createdAt).getTime() : -Infinity));
      return times.length > 0 ? Math.max(...times) : -Infinity;
    };
    return [...cards].sort((a, b) => lastActivity(b.id) - lastActivity(a.id));
  }, [cards, entries]);

  // teal = saved, coral = spent  (matches reference design)
  const ringSegments = [
    { value: saved,    color: '#0D9488' },
    { value: expenses, color: '#FF6B5E' },
  ];

  const legendItems = [
    { dot: '#0D9488', label: 'SAVED',  value: saved,    prev: null         },
    { dot: '#FF6B5E', label: 'SPENT',  value: expenses, prev: prevExpenses },
    { dot: '#E4E9E8', label: 'INCOME', value: income,   prev: prevIncome   },
  ];

  return (
    <div className="min-h-screen">

      {/* ── Gradient header band ── */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0D9488 0%, #2DD4BF 100%)',
          paddingTop: 52,
          paddingBottom: 36,
          paddingLeft: 20,
          paddingRight: 20,
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {/* Decorative sparkles */}
        <div style={{ position: 'absolute', top: 18, right: 32, opacity: 0.9 }}>
          <Sparkle size={16} color="#FFC800" />
        </div>
        <div style={{ position: 'absolute', top: 36, right: 62, opacity: 0.7 }}>
          <Sparkle size={9} color="rgba(255,255,255,0.85)" />
        </div>
        <div style={{ position: 'absolute', top: 64, right: 26, opacity: 0.6 }}>
          <Sparkle size={7} color="rgba(255,255,255,0.6)" />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>
          Mile-ly
        </p>
        <div style={{ color: 'white' }}>
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} cycleStartDay={cycleStartDay} />
        </div>

        {/* Wavy bottom edge */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 375 24" preserveAspectRatio="none" style={{ width: '100%', height: 24, display: 'block' }}>
            <path d="M0,14 C70,28 140,0 210,14 C280,28 330,6 375,14 L375,24 L0,24 Z" fill="var(--bg)" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 space-y-3 pb-6 pt-2">

        {/* Balance ring card */}
        <div className="card-chunky p-5" style={{ position: 'relative', overflow: 'visible' }}>
          {/* OnTrackBadge overlapping top-right */}
          {income > 0 && saved > 0 && (
            <div style={{ position: 'absolute', top: -14, right: 14, zIndex: 10 }}>
              <OnTrackBadge />
            </div>
          )}

          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--m-slate, #777777)', marginBottom: 14 }}>
            Balance
          </p>

          {/* DonutRing + Mascot row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DonutRing
              segments={ringSegments}
              centerLabel={`${currencySymbol(currency)} ${fmtShort(Math.round(animatedSaved))}`}
              centerSublabel="left to spend"
              trackColor="#EFF3F2"
              size={140}
            />
            <MiloMascot mood={income > 0 && saved <= 0 ? 'sad' : 'happy'} />
          </div>

          {/* Horizontal legend */}
          <div style={{ borderTop: '1.5px solid var(--m-border, #E5E5E5)', marginTop: 16, paddingTop: 14, display: 'flex', justifyContent: 'space-around' }}>
            {legendItems.map(({ dot, label, value, prev }) => {
              const d = prev !== null ? delta(value, prev) : null;
              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--m-slate, #777777)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {label}
                    </span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--m-ink, #3C3C3C)' }}>
                    {fmtCurrency(value, currency)}
                  </span>
                  {d !== null && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 5px',
                      borderRadius: 6,
                      background: d > 0 ? (label === 'SPENT' ? '#FEE2E2' : '#D1FAE5') : (label === 'SPENT' ? '#D1FAE5' : '#FEE2E2'),
                      color: d > 0 ? (label === 'SPENT' ? '#E24B4A' : '#1D9E75') : (label === 'SPENT' ? '#1D9E75' : '#E24B4A'),
                    }}>
                      {d > 0 ? '+' : ''}{d}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stat tiles */}
        <div className="flex gap-3">
          <StatTile
            chipLabel="savings"
            label="Saved this month"
            value={fmtCurrency(saved, currency)}
            caption={income > 0 ? `${Math.round((saved / income) * 100)}% of income` : 'No income yet'}
          />
          <StatTile
            chipLabel="calendar"
            label="Safe to spend / day"
            value={perDay > 0 ? fmtCurrency(perDay, currency) : '—'}
            caption={daysLeft > 0 ? `${daysLeft} days left` : 'End of month'}
          />
        </div>

        {/* Category breakdown */}
        {catSpend.length > 0 && (
          <div className="card-chunky p-5">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)', marginBottom: 14 }}>
              Spending by category
            </p>
            <div className="space-y-4">
              {catSpend.map(({ name, amount }) => (
                <div key={name}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <CategoryChip name={name} size={28} />
                    <div className="flex-1 flex justify-between text-xs">
                      <span style={{ fontWeight: 600, color: 'var(--m-ink, #3C3C3C)' }}>{name}</span>
                      <span style={{ fontWeight: 700, color: 'var(--m-ink, #3C3C3C)' }}>{fmtCurrency(amount, currency)}</span>
                    </div>
                  </div>
                  {/* Mini progress bar */}
                  <div style={{ height: 6, borderRadius: 999, background: '#EFF3F2', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: '#0D9488', width: `${(amount / expenses) * 100}%`, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {income === 0 && expenses === 0 && (
          <div className="card-chunky p-8 text-center">
            <div style={{ width: 140, height: 84, margin: '0 auto 6px' }}>
              <MiloMascot />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-ink)' }} className="mb-1">Nothing here yet</p>
            <p style={{ fontSize: 12, color: 'var(--m-slate)' }}>
              Tap the + button to add your first entry
            </p>
          </div>
        )}

        {/* Cards */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)' }}>
              Your Cards
            </p>
            <button
              onClick={() => setShowAddCard(true)}
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--m-teal, #0D9488)' }}
            >
              + Add
            </button>
          </div>

          {cards.length === 0 ? (
            <button
              onClick={() => setShowAddCard(true)}
              className="w-full py-5 rounded-[18px] text-xs font-semibold transition-colors"
              style={{ border: '2px dashed var(--m-border)', color: 'var(--m-slate)' }}
            >
              Add your first card
            </button>
          ) : (
            <>
              <div className="space-y-2">
                {sortedCards.slice(0, 4).map((card, i) => (
                  <CardRow
                    key={card.id}
                    card={card}
                    currency={currency}
                    onClick={() => setEditingCardId(card.id)}
                    className="list-item-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  />
                ))}
              </div>
              {cards.length > 4 && (
                <button
                  onClick={() => setShowAllCards(true)}
                  className="w-full text-center mt-2"
                  style={{ fontSize: 12, fontWeight: 700, color: 'var(--m-teal, #0D9488)' }}
                >
                  See all {cards.length} cards
                </button>
              )}
            </>
          )}
        </div>

        {/* Remarks */}
        <div className="card-chunky p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FFF3C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)' }}>
                Remarks
              </p>
            </div>
            {!editingRemark ? (
              <button
                onClick={() => { setRemarkInput(remark); setEditingRemark(true); }}
                style={{ fontSize: 12, fontWeight: 700, color: 'var(--m-teal, #0D9488)' }}
              >
                {remark ? 'Edit' : '+ Add'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={saveRemark}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'var(--m-teal)', boxShadow: '0 2px 0 var(--m-teal-dark)' }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingRemark(false)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold"
                  style={{ border: '2px solid var(--m-border)', color: 'var(--m-slate)' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {editingRemark ? (
            <textarea
              value={remarkInput}
              onChange={(e) => setRemarkInput(e.target.value)}
              autoFocus
              placeholder={"e.g. Splurged on flights ✈️, birthday dinner 🎂, gym membership renewed..."}
              rows={4}
              className="w-full outline-none resize-none"
              style={{
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.6,
                color: 'var(--fg)',
                background: 'var(--bg)',
                border: '2px solid var(--m-border)',
                borderRadius: 12,
                padding: '10px 12px',
                boxShadow: '0 2px 0 var(--m-border-dark)',
              }}
            />
          ) : remark ? (
            <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: 'var(--fg)', whiteSpace: 'pre-wrap' }}>
              {remark}
            </p>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--m-slate, #777777)', fontStyle: 'italic' }}>
              No remarks yet — tap "+ Add" to note any highlights or surprises this month.
            </p>
          )}
        </div>
      </div>

      <Modal isOpen={showAddCard} onClose={() => setShowAddCard(false)} title="Add New Card" key={showAddCard ? 'open' : 'closed'}>
        <AddCardForm
          onSubmit={(data) => { addCard(data); setShowAddCard(false); }}
          onCancel={() => setShowAddCard(false)}
        />
      </Modal>

      <Modal isOpen={showAllCards} onClose={() => setShowAllCards(false)} title="Your Cards" key={showAllCards ? 'all-open' : 'all-closed'}>
        <div className="space-y-2">
          {sortedCards.map((card, i) => (
            <CardRow
              key={card.id}
              card={card}
              currency={currency}
              onClick={() => { setShowAllCards(false); setEditingCardId(card.id); }}
              className="list-item-in"
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            />
          ))}
        </div>
      </Modal>

      <Modal isOpen={!!editingCardId} onClose={() => setEditingCardId(null)} title="Edit Card" key={editingCardId ?? 'closed'}>
        {editingCardId && (() => {
          const card = cards.find((c) => c.id === editingCardId);
          if (!card) return null;
          return (
            <EditCardForm
              card={card}
              onSave={(patch) => { updateCard(card.id, patch); setEditingCardId(null); }}
              onDelete={() => { deleteCard(card.id); setEditingCardId(null); }}
              onCancel={() => setEditingCardId(null)}
            />
          );
        })()}
      </Modal>
    </div>
  );
}
