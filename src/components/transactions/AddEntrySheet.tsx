'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

interface AddEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type EntryType = 'income' | 'expense';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function defaultDateForMonth(month: string): string {
  const cm = currentMonth();
  if (month === cm) return today();
  // Past month: last day; future month: first day
  const [y, m] = month.split('-').map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const d = new Date(month) < new Date(cm) ? lastDay : 1;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function AddEntrySheet({ isOpen, onClose }: AddEntrySheetProps) {
  const { categories, cards, addEntry, addCategory, deleteCategory, selectedMonth } = useApp();

  const [type, setType] = useState<EntryType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(today); // updated when sheet opens
  const [remark, setRemark] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [cardId, setCardId] = useState('');
  const [saving, setSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.type === type);

  useEffect(() => {
    setCategoryId('');
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setCategoryId('');
      setCardId('');
      setDate(defaultDateForMonth(selectedMonth));
      setRemark('');
      setType('expense');
      setAddingCat(false);
      setNewCatName('');
    }
  }, [isOpen, selectedMonth]);

  async function save(andAnother = false) {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0 || !categoryId) return;
    setSaving(true);
    const month = date.slice(0, 7) + '-01';
    await addEntry({ month, amount, categoryId, cardId: cardId || undefined, note: remark || undefined });
    setSaving(false);
    if (andAnother) {
      setAmountStr('');
      setRemark('');
    } else {
      onClose();
    }
  }

  async function handleAddCat() {
    const name = newCatName.trim();
    if (!name) return;
    await addCategory(name, type);
    setNewCatName('');
    setAddingCat(false);
  }

  const amount = parseFloat(amountStr) || 0;
  const isIncome = type === 'income';
  const amountColor = isIncome ? '#1D9E75' : '#1A1A18';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[24px] shadow-2xl max-w-md mx-auto pb-safe"
        style={{ backgroundColor: 'var(--card)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>New entry</p>
          <div className="w-8" />
        </div>

        <div className="px-5 pb-6 space-y-5">
          {/* Big amount */}
          <div className="text-center py-2">
            <div className="flex items-center justify-center gap-1">
              <span className="text-2xl font-medium" style={{ color: 'var(--text-muted)' }}>SGD</span>
              <input
                type="number"
                inputMode="decimal"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="text-[40px] font-medium bg-transparent outline-none w-40 text-center"
                style={{ color: amountColor }}
              />
            </div>
          </div>

          {/* Type toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: '0.5px solid var(--border)' }}
          >
            {(['expense', 'income'] as EntryType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex-1 py-2.5 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: type === t ? (t === 'income' ? '#0F6E56' : '#E24B4A') : 'var(--bg)',
                  color: type === t ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {t === 'income' ? 'Income' : 'Spending'}
              </button>
            ))}
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Category</p>
            {filtered.length === 0 && !addingCat ? (
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>No {type} categories yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-2">
                {filtered.map((cat) => {
                  const selected = categoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center rounded-full text-xs font-medium overflow-hidden"
                      style={{
                        backgroundColor: selected ? '#0F6E56' : 'var(--bg)',
                        color: selected ? '#fff' : 'var(--text-secondary)',
                        border: '0.5px solid var(--border)',
                      }}
                    >
                      <button onClick={() => setCategoryId(cat.id)} className="pl-3 pr-2 py-1.5">
                        {cat.name}
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(cat.id)}
                        className="pr-2.5 py-1.5 opacity-40 hover:opacity-70 transition-opacity text-[10px]"
                        aria-label={`Delete ${cat.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {addingCat ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0F6E56]"
                  style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)', border: '0.5px solid var(--border)' }}
                />
                <button onClick={handleAddCat} className="px-3 py-2 rounded-xl text-xs font-medium text-white" style={{ backgroundColor: '#0F6E56' }}>Add</button>
                <button onClick={() => setAddingCat(false)} className="px-3 py-2 rounded-xl text-xs" style={{ border: '0.5px solid var(--border)', color: 'var(--text-secondary)' }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setAddingCat(true)} className="text-xs font-medium" style={{ color: '#0F6E56' }}>
                + New category
              </button>
            )}
          </div>

          {/* Card (expense only) */}
          {type === 'expense' && cards.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Card</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCardId('')}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: cardId === '' ? '#0F6E56' : 'var(--bg)',
                    color: cardId === '' ? '#fff' : 'var(--text-secondary)',
                    border: '0.5px solid var(--border)',
                  }}
                >
                  Cash / Other
                </button>
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setCardId(card.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: cardId === card.id ? card.color : 'var(--bg)',
                      color: cardId === card.id ? '#fff' : 'var(--text-secondary)',
                      border: `0.5px solid ${cardId === card.id ? card.color : 'var(--border)'}`,
                    }}
                  >
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Date</p>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F6E56]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)', border: '0.5px solid var(--border)' }}
            />
          </div>

          {/* Remark */}
          <div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Remark</p>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Optional note"
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0F6E56]"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)', border: '0.5px solid var(--border)' }}
            />
          </div>

          {/* Actions */}
          <button
            onClick={() => save(false)}
            disabled={saving || !amountStr || !categoryId}
            className="w-full py-3.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#0F6E56' }}
          >
            {saving ? 'Saving…' : 'Save entry'}
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving || !amountStr || !categoryId}
            className="w-full text-center text-xs font-medium py-1 disabled:opacity-40"
            style={{ color: '#0F6E56' }}
          >
            Save and add another
          </button>
        </div>
      </div>

    {/* Category delete action sheet */}
    {pendingDeleteId && (() => {
      const cat = categories.find((c) => c.id === pendingDeleteId);
      return (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setPendingDeleteId(null)} />
          <div
            className="fixed bottom-0 left-0 right-0 z-[70] rounded-t-[20px] p-6 max-w-md mx-auto"
            style={{ backgroundColor: 'var(--card)' }}
          >
            <p className="text-sm font-medium text-center mb-1" style={{ color: 'var(--fg)' }}>
              Remove category?
            </p>
            <p className="text-xs text-center mb-6" style={{ color: 'var(--text-muted)' }}>
              "{cat?.name}" will be permanently deleted.
            </p>
            <button
              onClick={() => {
                if (categoryId === pendingDeleteId) setCategoryId('');
                deleteCategory(pendingDeleteId);
                setPendingDeleteId(null);
              }}
              className="w-full py-4 rounded-xl text-sm font-semibold text-white mb-3"
              style={{ backgroundColor: '#E24B4A' }}
            >
              Remove
            </button>
            <button
              onClick={() => setPendingDeleteId(null)}
              className="w-full py-4 rounded-xl text-sm font-medium"
              style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}
            >
              Cancel
            </button>
          </div>
        </>
      );
    })()}
    </>
  );
}
