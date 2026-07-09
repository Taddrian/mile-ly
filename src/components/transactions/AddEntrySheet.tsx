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

export default function AddEntrySheet({ isOpen, onClose }: AddEntrySheetProps) {
  const { categories, addEntry, addCategory } = useApp();

  const [type, setType] = useState<EntryType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(today());
  const [remark, setRemark] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = categories.filter((c) => c.type === type);

  useEffect(() => {
    setCategoryId('');
  }, [type]);

  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setCategoryId('');
      setDate(today());
      setRemark('');
      setType('expense');
      setAddingCat(false);
      setNewCatName('');
    }
  }, [isOpen]);

  async function save(andAnother = false) {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0 || !categoryId) return;
    setSaving(true);
    const month = date.slice(0, 7) + '-01';
    await addEntry({ month, amount, categoryId, note: remark || undefined });
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
                {filtered.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(cat.id)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: categoryId === cat.id ? '#0F6E56' : 'var(--bg)',
                      color: categoryId === cat.id ? '#fff' : 'var(--text-secondary)',
                      border: '0.5px solid var(--border)',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
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
    </>
  );
}
