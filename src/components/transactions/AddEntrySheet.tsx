'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { currencySymbol } from '@/lib/currency';
import { defaultDateForCycle } from '@/lib/cycle';

interface AddEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type EntryType = 'income' | 'expense' | 'card';

export default function AddEntrySheet({ isOpen, onClose }: AddEntrySheetProps) {
  const { categories, cards, addEntry, addCategory, deleteCategory, updateCardSpent, selectedMonth, cycleStartDay, currency } = useApp();

  const [type, setType] = useState<EntryType>('expense');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [remark, setRemark] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [cardId, setCardId] = useState('');
  const [spentStr, setSpentStr] = useState('');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.type === type);
  const selectedCard = cards.find((c) => c.id === cardId);

  useEffect(() => { setCategoryId(''); }, [type]);

  useEffect(() => {
    if (isOpen) {
      setAmountStr('');
      setCategoryId('');
      setCardId('');
      setSpentStr('');
      setDate(defaultDateForCycle(selectedMonth, cycleStartDay));
      setRemark('');
      setType('expense');
      setAddingCat(false);
      setNewCatName('');
    }
  }, [isOpen, selectedMonth, cycleStartDay]);

  // When picking a card in "card update" mode, prefill with its current total
  useEffect(() => {
    if (type === 'card' && selectedCard) setSpentStr(String(selectedCard.currentSpent));
  }, [type, cardId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(andAnother = false) {
    if (type === 'card') {
      if (!cardId) return;
      const newTotal = parseFloat(spentStr);
      if (isNaN(newTotal) || newTotal < 0) return;
      setSaving(true);
      try {
        await updateCardSpent(cardId, newTotal, date);
        setJustSaved(true);
        onClose();
        // Safety net: re-enable the button if the sheet somehow doesn't close
        setTimeout(() => setJustSaved(false), 2000);
      } finally {
        setSaving(false);
      }
      return;
    }
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0 || (!categoryId && !cardId)) return;
    setSaving(true);
    try {
      const month = date.slice(0, 7) + '-01';
      await addEntry({ month, date, amount, categoryId: categoryId || undefined, cardId: cardId || undefined, note: remark || undefined });
      setJustSaved(true);
      if (andAnother) {
        setAmountStr('');
        setRemark('');
        setTimeout(() => setJustSaved(false), 500);
      } else {
        onClose();
        // Safety net: re-enable the button if the sheet somehow doesn't close
        setTimeout(() => setJustSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleAddCat() {
    const name = newCatName.trim();
    if (!name || type === 'card') return;
    await addCategory(name, type);
    setNewCatName('');
    setAddingCat(false);
  }

  const isIncome = type === 'income';
  const isCardUpdate = type === 'card';
  const canSave = isCardUpdate
    ? !!cardId && !!spentStr && !isNaN(parseFloat(spentStr))
    : !!amountStr && (!!categoryId || !!cardId);
  const accentColor = isCardUpdate ? (selectedCard?.color ?? '#0D9488') : isIncome ? '#0D9488' : '#FF6B5E';
  const accentDark  = isIncome ? '#0A6E63' : '#E04E42';

  if (!isOpen) return null;

  const inputStyle = {
    background: 'var(--bg)',
    color: 'var(--fg)',
    border: '2px solid var(--m-border)',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: 14,
    fontWeight: 500,
    width: '100%',
    outline: 'none',
    boxShadow: '0 2px 0 var(--m-border-dark)',
  } as React.CSSProperties;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-fade-in" onClick={onClose} />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto pb-safe sheet-pop-in"
        style={{
          background: 'var(--card)',
          borderRadius: '24px 24px 0 0',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--m-border)' }} />
        </div>

        {/* Close + title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 4px' }}>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg)', border: '2px solid var(--m-border)',
              color: 'var(--m-slate)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--m-ink)', letterSpacing: '-0.01em' }}>
            {isCardUpdate ? 'Update Card' : 'New Entry'}
          </p>
          <div style={{ width: 34 }} />
        </div>

        <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Amount hero (hidden in card-update mode) */}
          {!isCardUpdate && (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--m-slate)' }}>{currencySymbol(currency)}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  style={{
                    fontSize: 48,
                    fontWeight: 900,
                    background: 'transparent',
                    outline: 'none',
                    width: 180,
                    textAlign: 'center',
                    color: accentColor,
                    letterSpacing: '-0.03em',
                    border: 'none',
                  }}
                />
              </div>
            </div>
          )}

          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(cards.length > 0 ? ['income', 'card', 'expense'] : ['income', 'expense']).map((t) => {
              const et = t as EntryType;
              const active = type === et;
              const color = et === 'income' ? '#0D9488' : et === 'card' ? '#2563EB' : '#FF6B5E';
              const dark  = et === 'income' ? '#0A6E63' : et === 'card' ? '#1E40AF' : '#E04E42';
              const label = et === 'income' ? '💚 Income' : et === 'card' ? '💳 Card' : '🛍️ Spending';
              return (
                <button
                  key={et}
                  onClick={() => setType(et)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: '0.01em',
                    border: active ? `2px solid ${color}` : '2px solid var(--m-border)',
                    boxShadow: active ? `0 3px 0 ${dark}` : '0 3px 0 var(--m-border-dark)',
                    background: active ? color : 'var(--card)',
                    color: active ? 'white' : 'var(--m-slate)',
                    transition: 'all 0.12s',
                    transform: active ? 'translateY(0)' : 'translateY(0)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Card selector (expense + card-update modes) */}
          {(type === 'expense' || isCardUpdate) && cards.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate)', marginBottom: 8 }}>
                Card
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setCardId(isCardUpdate ? card.id : (cardId === card.id ? '' : card.id))}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      border: `2px solid ${cardId === card.id ? card.color : 'var(--m-border)'}`,
                      boxShadow: cardId === card.id ? `0 3px 0 rgba(0,0,0,0.2)` : '0 2px 0 var(--m-border-dark)',
                      background: cardId === card.id ? card.color : 'var(--card)',
                      color: cardId === card.id ? '#fff' : 'var(--m-slate)',
                      transition: 'all 0.1s',
                    }}
                  >
                    {card.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current spent input (card-update mode only) */}
          {isCardUpdate && selectedCard && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate)', marginBottom: 8 }}>
                Current Spent This Month
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--m-slate)' }}>{currencySymbol(currency)}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={spentStr}
                  onChange={(e) => setSpentStr(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0.00"
                  style={{
                    fontSize: 40,
                    fontWeight: 900,
                    background: 'transparent',
                    outline: 'none',
                    width: 180,
                    textAlign: 'center',
                    color: accentColor,
                    letterSpacing: '-0.03em',
                    border: 'none',
                  }}
                />
              </div>
              <p style={{ fontSize: 11, color: 'var(--m-slate)', textAlign: 'center' }}>
                Just type the latest total from your statement — we&rsquo;ll work out the difference for you.
              </p>
            </div>
          )}

          {/* Category (hidden in card-update mode) */}
          {!isCardUpdate && <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate)', marginBottom: 8 }}>
              Category
            </p>
            {filtered.length === 0 && !addingCat ? (
              <p style={{ fontSize: 12, color: 'var(--m-slate)', marginBottom: 6 }}>No {type} categories yet.</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {filtered.map((cat) => {
                  const selected = categoryId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 999,
                        fontSize: 13,
                        fontWeight: 700,
                        border: selected ? `2px solid ${accentColor}` : '2px solid var(--m-border)',
                        boxShadow: selected ? `0 3px 0 ${accentDark}` : '0 2px 0 var(--m-border-dark)',
                        background: selected ? accentColor : 'var(--card)',
                        color: selected ? '#fff' : 'var(--m-slate)',
                        overflow: 'hidden',
                        transition: 'all 0.1s',
                      }}
                    >
                      <button onClick={() => setCategoryId(cat.id)} style={{ padding: '7px 12px 7px 14px', background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer' }}>
                        {cat.name}
                      </button>
                      <button
                        onClick={() => setPendingDeleteId(cat.id)}
                        style={{ padding: '7px 12px 7px 2px', background: 'none', border: 'none', opacity: 0.5, cursor: 'pointer', fontSize: 11, color: 'inherit' }}
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
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Category name"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={handleAddCat}
                  style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: accentColor, color: 'white', border: `2px solid ${accentColor}`, boxShadow: `0 3px 0 ${accentDark}` }}
                >
                  Add
                </button>
                <button
                  onClick={() => setAddingCat(false)}
                  style={{ padding: '10px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, background: 'var(--card)', color: 'var(--m-slate)', border: '2px solid var(--m-border)', boxShadow: '0 3px 0 var(--m-border-dark)' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAddingCat(true)}
                style={{ fontSize: 12, fontWeight: 700, color: accentColor }}
              >
                + New category
              </button>
            )}
          </div>}

          {/* Remark (hidden in card-update mode) — date is logged automatically */}
          {!isCardUpdate && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate)', marginBottom: 6 }}>Remark</p>
              <input
                type="text"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Optional"
                style={inputStyle}
              />
            </div>
          )}

          {/* Chunky save button */}
          <button
            onClick={() => save(false)}
            disabled={saving || justSaved || !canSave}
            style={{
              width: '100%',
              padding: '16px 0',
              borderRadius: 16,
              fontSize: 15,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'white',
              background: canSave ? accentColor : 'var(--m-border)',
              border: `2px solid ${canSave ? accentColor : 'var(--m-border)'}`,
              boxShadow: canSave ? `0 4px 0 ${accentDark}` : '0 4px 0 var(--m-border-dark)',
              opacity: saving ? 0.7 : 1,
              transition: 'all 0.1s',
              cursor: canSave ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {justSaved ? (
              <>
                <svg className="save-check-pop" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Saved!
              </>
            ) : saving ? 'Saving…' : isCardUpdate ? 'Update Card' : 'Save Entry'}
          </button>

          {/* Secondary: save and add another (not shown in card-update mode) */}
          {!isCardUpdate && (
            <button
              onClick={() => save(true)}
              disabled={saving || justSaved || !canSave}
              style={{
                width: '100%',
                padding: '13px 0',
                borderRadius: 14,
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: canSave ? accentColor : 'var(--m-border-dark)',
                background: 'var(--card)',
                border: `2px solid ${canSave ? accentColor : 'var(--m-border)'}`,
                boxShadow: '0 3px 0 var(--m-border-dark)',
                opacity: saving ? 0.7 : 1,
                cursor: canSave ? 'pointer' : 'not-allowed',
                marginTop: -8,
              }}
            >
              + Save Another
            </button>
          )}
        </div>
      </div>

      {/* Category delete action sheet */}
      {pendingDeleteId && (() => {
        const cat = categories.find((c) => c.id === pendingDeleteId);
        return (
          <>
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setPendingDeleteId(null)} />
            <div
              className="fixed bottom-0 left-0 right-0 z-[70] max-w-md mx-auto"
              style={{ background: 'var(--card)', borderRadius: '20px 20px 0 0', padding: '24px 20px' }}
            >
              <p style={{ fontSize: 15, fontWeight: 800, textAlign: 'center', color: 'var(--m-ink)', marginBottom: 6 }}>
                Remove category?
              </p>
              <p style={{ fontSize: 13, textAlign: 'center', color: 'var(--m-slate)', marginBottom: 24 }}>
                "{cat?.name}" will be permanently deleted.
              </p>
              <button
                onClick={() => {
                  if (categoryId === pendingDeleteId) setCategoryId('');
                  deleteCategory(pendingDeleteId);
                  setPendingDeleteId(null);
                }}
                style={{
                  width: '100%', padding: '15px', borderRadius: 14, marginBottom: 10,
                  fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: 'white', background: '#FF6B5E', border: '2px solid #FF6B5E', boxShadow: '0 4px 0 #E04E42',
                }}
              >
                Remove
              </button>
              <button
                onClick={() => setPendingDeleteId(null)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 14,
                  fontSize: 14, fontWeight: 700, color: 'var(--m-slate)',
                  background: 'var(--card)', border: '2px solid var(--m-border)', boxShadow: '0 3px 0 var(--m-border-dark)',
                }}
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
