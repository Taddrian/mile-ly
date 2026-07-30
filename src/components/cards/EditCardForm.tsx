'use client';

import { useState } from 'react';
import { CreditCard } from '@/types';

interface EditCardFormProps {
  card: CreditCard;
  onSave: (patch: Partial<Omit<CreditCard, 'id' | 'currentSpent'>>) => void;
  onDelete: () => void;
  onCancel: () => void;
}

// Playful palette matching the rest of the app's design tokens
const PRESET_COLORS = [
  '#0D9488', '#2563EB', '#7C3AED', '#DB2777',
  '#E04E42', '#EA580C', '#D97706', '#65A30D',
  '#0891B2', '#4F46E5', '#BE185D', '#374151',
];

export default function EditCardForm({ card, onSave, onDelete, onCancel }: EditCardFormProps) {
  const [color, setColor] = useState(card.color);
  const [name, setName] = useState(card.name);
  const [limit, setLimit] = useState(String(card.monthlyLimit));
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, monthlyLimit: parseFloat(limit) || 0 });
  }

  return (
    <div className="space-y-5">
      {/* Live preview */}
      <div
        className="rounded-2xl p-4"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color} 100%)`, boxShadow: '0 4px 0 rgba(0,0,0,0.18)' }}
      >
        <p className="text-white text-sm font-bold truncate">{name || 'Card name'}</p>
        <p className="text-white/70 text-xs font-mono mt-1">•• {card.last4}</p>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--m-slate)' }}>
          Card Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1.5 outline-none"
          style={{
            padding: '10px 14px', fontSize: 14, fontWeight: 600, color: 'var(--fg)',
            background: 'var(--card)', border: '2px solid var(--m-border)', borderRadius: 12,
            boxShadow: '0 2px 0 var(--m-border-dark)',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--m-slate)' }}>
          Monthly Limit
        </label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          min="0"
          step="0.01"
          className="w-full mt-1.5 outline-none"
          style={{
            padding: '10px 14px', fontSize: 14, fontWeight: 600, color: 'var(--fg)',
            background: 'var(--card)', border: '2px solid var(--m-border)', borderRadius: 12,
            boxShadow: '0 2px 0 var(--m-border-dark)',
          }}
        />
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--m-slate)' }}>
          Card Colour
        </label>
        <div className="flex gap-2.5 flex-wrap mt-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="rounded-full transition-transform"
              style={{
                width: 36, height: 36, background: c,
                border: color === c ? '3px solid var(--m-ink, #3C3C3C)' : '3px solid transparent',
                transform: color === c ? 'scale(1.1)' : 'scale(1)',
                boxShadow: color === c ? '0 2px 0 rgba(0,0,0,0.25)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl text-sm font-bold"
          style={{ border: '2px solid var(--m-border)', color: 'var(--m-slate)' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white uppercase tracking-wide"
          style={{ background: 'var(--m-teal, #0D9488)', boxShadow: '0 4px 0 var(--m-teal-dark, #0A6E63)' }}
        >
          Save
        </button>
      </div>

      <div className="pt-1">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-3 rounded-2xl text-sm font-bold"
            style={{ color: '#E04E42' }}
          >
            Remove Card
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-3 rounded-2xl text-sm font-bold"
              style={{ border: '2px solid var(--m-border)', color: 'var(--m-slate)' }}
            >
              Keep it
            </button>
            <button
              onClick={onDelete}
              className="flex-1 py-3 rounded-2xl text-sm font-extrabold text-white uppercase tracking-wide"
              style={{ background: '#FF6B5E', boxShadow: '0 4px 0 #E04E42' }}
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
