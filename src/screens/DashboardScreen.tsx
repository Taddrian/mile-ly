'use client';

import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { fmtAmount, fmtShort } from '@/lib/currency';
import DonutRing from '@/components/ui/DonutRing';
import StatTile from '@/components/ui/StatTile';
import MonthPicker from '@/components/ui/MonthPicker';
import CategoryChip from '@/components/ui/CategoryChip';
import AddCardForm from '@/components/cards/AddCardForm';
import EditCardForm from '@/components/cards/EditCardForm';
import Modal from '@/components/ui/Modal';
import MiloMascot from '@/components/decor/MiloMascot';
import OnTrackBadge from '@/components/decor/OnTrackBadge';
import Sparkle from '@/components/decor/Sparkle';

function prevMonthStr(month: string) {
  const d = new Date(month);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function delta(current: number, previous: number) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

function daysLeftInMonth(monthStr: string) {
  const now = new Date();
  const [y, m] = monthStr.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const isCurrentMonth = now.getFullYear() === y && now.getMonth() + 1 === m;
  return isCurrentMonth ? lastDay - now.getDate() + 1 : 0;
}

export default function DashboardScreen() {
  const { entries, categories, cards, addCard, updateCard, deleteCard, addEntry, deleteEntry, addCategory, selectedMonth, setSelectedMonth, currency } = useApp();
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const QUICK_UPDATE_NOTE = '⚡ Balance update';

  async function updateCardSpent(cardId: string, newTotal: number) {
    const cardEntries = entries.filter((e) => e.cardId === cardId);
    const quickEntry = cardEntries.find((e) => e.note === QUICK_UPDATE_NOTE);
    const itemizedTotal = cardEntries
      .filter((e) => e.note !== QUICK_UPDATE_NOTE)
      .reduce((s, e) => s + e.amount, 0);
    const neededQuickAmount = Math.round((newTotal - itemizedTotal) * 100) / 100;

    if (quickEntry) await deleteEntry(quickEntry.id);

    if (neededQuickAmount > 0) {
      let cat = categories.find((c) => c.name === 'Credit Card' && c.type === 'expense');
      if (!cat) cat = await addCategory('Credit Card', 'expense');
      await addEntry({
        month: selectedMonth,
        amount: neededQuickAmount,
        categoryId: cat?.id,
        cardId,
        note: QUICK_UPDATE_NOTE,
      });
    }
  }
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
    const pm = prevMonthStr(selectedMonth);
    supabase.from('entries').select('amount, category_id').eq('month', pm).then(({ data }) => {
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
  const daysLeft = daysLeftInMonth(selectedMonth);
  const perDay = daysLeft > 0 && saved > 0 ? saved / daysLeft : 0;

  const catSpend = useMemo(() => {
    const map: Record<string, { name: string; amount: number }> = {};
    entries.forEach((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      if (!cat || cat.type !== 'expense') return;
      if (!map[cat.id]) map[cat.id] = { name: cat.name, amount: 0 };
      map[cat.id].amount += e.amount;
    });
    return Object.values(map).sort((a, b) => b.amount - a.amount);
  }, [entries, categories]);

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
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
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
          <div style={{ position: 'absolute', top: -14, right: 14, zIndex: 10 }}>
            <OnTrackBadge />
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--m-slate, #777777)', marginBottom: 14 }}>
            Balance
          </p>

          {/* DonutRing + Mascot row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DonutRing
              segments={ringSegments}
              centerLabel={`${currency} ${fmtShort(saved)}`}
              centerSublabel="left to spend"
              trackColor="#EFF3F2"
              size={140}
            />
            <MiloMascot />
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
                    {fmtAmount(value, currency)}
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
            value={`${currency} ${fmtAmount(saved, currency)}`}
            caption={income > 0 ? `${Math.round((saved / income) * 100)}% of income` : 'No income yet'}
          />
          <StatTile
            chipLabel="calendar"
            label="Safe to spend / day"
            value={perDay > 0 ? `${currency} ${fmtAmount(perDay, currency)}` : '—'}
            caption={daysLeft > 0 ? `${daysLeft} days left` : 'End of month'}
          />
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
                      <span style={{ fontWeight: 700, color: 'var(--m-ink, #3C3C3C)' }}>{currency} {fmtAmount(amount, currency)}</span>
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
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
              {cards.map((card) => {
                const pct = card.monthlyLimit > 0 ? Math.min((card.currentSpent / card.monthlyLimit) * 100, 100) : 0;
                const num = parseInt(card.color.replace('#', ''), 16);
                const r = Math.min(255, (num >> 16) + 30);
                const g = Math.min(255, ((num >> 8) & 0xff) + 30);
                const b = Math.min(255, (num & 0xff) + 30);
                const lighter = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                return (
                  <button
                    key={card.id}
                    onClick={() => setEditingCardId(card.id)}
                    className="shrink-0 rounded-2xl p-4 flex flex-col justify-between text-left relative overflow-hidden active:scale-[0.97] transition-transform"
                    style={{
                      width: 168,
                      minHeight: 110,
                      background: `linear-gradient(135deg, ${card.color} 0%, ${lighter} 100%)`,
                      boxShadow: '0 4px 0 rgba(0,0,0,0.18)',
                    }}
                  >
                    {/* Decorative circles for depth */}
                    <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute bottom-0 right-6 w-10 h-10 rounded-full bg-white/10 pointer-events-none" />

                    <div className="flex items-center justify-between mb-3 relative">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div style={{ width: 18, height: 13, borderRadius: 3, background: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
                        <p className="text-white text-xs font-bold truncate">{card.name}</p>
                      </div>
                      <p className="text-white/60 text-[10px] font-mono shrink-0 ml-1">••{card.last4}</p>
                    </div>
                    <div className="relative">
                      <p className="text-white text-sm font-extrabold">{currency} {fmtAmount(card.currentSpent, currency)}</p>
                      {card.monthlyLimit > 0 && (
                        <>
                          <p className="text-white/60 text-[10px] mb-1.5">of {currency} {fmtAmount(card.monthlyLimit, currency)}</p>
                          <div className="h-1.5 rounded-full bg-white/20">
                            <div className="h-1.5 rounded-full bg-white transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAddCard} onClose={() => setShowAddCard(false)} title="Add New Card" key={showAddCard ? 'open' : 'closed'}>
        <AddCardForm
          onSubmit={(data) => { addCard(data); setShowAddCard(false); }}
          onCancel={() => setShowAddCard(false)}
        />
      </Modal>

      <Modal isOpen={!!editingCardId} onClose={() => setEditingCardId(null)} title="Edit Card" key={editingCardId ?? 'closed'}>
        {editingCardId && (() => {
          const card = cards.find((c) => c.id === editingCardId);
          if (!card) return null;
          const itemizedTotal = entries
            .filter((e) => e.cardId === card.id && e.note !== QUICK_UPDATE_NOTE)
            .reduce((s, e) => s + e.amount, 0);
          return (
            <EditCardForm
              card={card}
              itemizedTotal={itemizedTotal}
              currency={currency}
              onSave={(patch, newSpent) => {
                updateCard(card.id, patch);
                if (newSpent !== card.currentSpent) updateCardSpent(card.id, newSpent);
                setEditingCardId(null);
              }}
              onDelete={() => { deleteCard(card.id); setEditingCardId(null); }}
              onCancel={() => setEditingCardId(null)}
            />
          );
        })()}
      </Modal>
    </div>
  );
}
