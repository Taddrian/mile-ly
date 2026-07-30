'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from '@/types';
import { fmtCurrency } from '@/lib/currency';

interface CardRowProps {
  card: CreditCard;
  currency: string;
  onClick: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export default function CardRow({ card, currency, onClick, style, className }: CardRowProps) {
  const hasLimit = card.monthlyLimit > 0;
  const pct = hasLimit ? Math.min((card.currentSpent / card.monthlyLimit) * 100, 100) : 0;

  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 text-left transition-opacity active:opacity-70 ${className ?? ''}`}
      style={{
        background: 'var(--card)',
        border: '2px solid var(--m-border)',
        borderRadius: 14,
        boxShadow: '0 2px 0 var(--m-border-dark)',
        ...style,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: card.color, flexShrink: 0 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--m-ink, #3C3C3C)' }}>{card.name}</p>
          {card.last4 && (
            <span className="text-xs font-mono shrink-0" style={{ color: 'var(--m-slate)' }}>•• {card.last4}</span>
          )}
        </div>
        {hasLimit ? (
          <div className="mt-1.5" style={{ height: 4, borderRadius: 999, background: 'var(--m-border)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, width: filled ? `${pct}%` : '0%', background: card.color, transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }} />
          </div>
        ) : (
          <p className="text-xs mt-1" style={{ color: 'var(--m-slate)' }}>No limit set</p>
        )}
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p className="text-sm font-extrabold" style={{ color: 'var(--m-ink, #3C3C3C)' }}>
          {fmtCurrency(card.currentSpent, currency)}
        </p>
        {hasLimit && (
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--m-slate)' }}>
            of {fmtCurrency(card.monthlyLimit, currency)}
          </p>
        )}
      </div>
    </button>
  );
}
