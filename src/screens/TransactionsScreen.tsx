'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtCurrency } from '@/lib/currency';
import CategoryChip from '@/components/ui/CategoryChip';
import SwipeableRow from '@/components/transactions/SwipeableRow';
import Sparkle from '@/components/decor/Sparkle';
import MiloMascot from '@/components/decor/MiloMascot';

function fmtDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionsScreen() {
  const { entries, categories, cards, deleteEntry, currency } = useApp();
  const [search, setSearch] = useState('');

  const totalIncome = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'income')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const totalExpense = useMemo(() =>
    entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense')
      .reduce((s, e) => s + e.amount, 0),
    [entries, categories]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .filter((e) => {
        if (!q) return true;
        const cat = categories.find((c) => c.id === e.categoryId);
        return cat?.name.toLowerCase().includes(q) || e.note?.toLowerCase().includes(q);
      });
  }, [entries, categories, search]);

  return (
    <div className="min-h-screen">

      {/* ── Header band ── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1D4ED8 0%, #38BDF8 100%)',
        paddingTop: 52,
        paddingBottom: 36,
        paddingLeft: 20,
        paddingRight: 20,
        color: 'white',
      }}>
        {/* Sparkles */}
        <div style={{ position: 'absolute', top: 18, right: 28 }}>
          <Sparkle size={14} color="#FFC800" />
        </div>
        <div style={{ position: 'absolute', top: 42, right: 56 }}>
          <Sparkle size={9} color="rgba(255,255,255,0.7)" />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
          History
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', color: 'white', marginBottom: 16 }}>
          Transactions
        </h1>

        {/* Summary tiles */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', marginBottom: 3 }}>
              Income
            </p>
            <p style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
              {fmtCurrency(totalIncome, currency)}
            </p>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.18)', borderRadius: 14, padding: '10px 14px', backdropFilter: 'blur(8px)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', marginBottom: 3 }}>
              Spent
            </p>
            <p style={{ fontSize: 18, fontWeight: 900, color: 'white', letterSpacing: '-0.01em' }}>
              {fmtCurrency(totalExpense, currency)}
            </p>
          </div>
        </div>

        {/* Wavy bottom */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 375 24" preserveAspectRatio="none" style={{ width: '100%', height: 24, display: 'block' }}>
            <path d="M0,14 C70,28 140,0 210,14 C280,28 330,6 375,14 L375,24 L0,24 Z" fill="var(--bg)" />
          </svg>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pt-3 pb-6 space-y-3">

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--m-slate)' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="w-full outline-none"
            style={{
              padding: '12px 16px 12px 38px',
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--fg)',
              background: 'var(--card)',
              border: '2px solid var(--m-border)',
              borderRadius: 14,
              boxShadow: '0 3px 0 var(--m-border-dark)',
            }}
          />
        </div>

        {/* Entry count label */}
        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate)', paddingLeft: 2 }}>
          {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
        </p>

        {/* Transaction cards */}
        {filtered.length === 0 ? (
          <div className="card-chunky p-10 text-center">
            <div style={{ width: 140, height: 84, margin: '0 auto 10px' }}>
              <MiloMascot />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-ink)' }}>Nothing here yet</p>
            <p style={{ fontSize: 12, color: 'var(--m-slate)', marginTop: 4 }}>
              {search ? 'No results for that search' : 'Tap + to add your first entry'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry, i) => {
              const cat = categories.find((c) => c.id === entry.categoryId);
              const card = cards.find((c) => c.id === entry.cardId);
              const isIncome = cat?.type === 'income';
              return (
                <SwipeableRow
                  key={entry.id}
                  onDelete={() => deleteEntry(entry.id)}
                  className="list-item-in"
                  style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
                >
                  <div
                    className="card-chunky flex items-center gap-3 p-4"
                    style={{ cursor: 'default' }}
                  >
                    <CategoryChip name={cat?.name ?? '?'} size={40} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cat?.name ?? 'Unknown'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                        {card && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 999,
                            color: 'white',
                            background: card.color,
                            letterSpacing: '0.02em',
                          }}>
                            {card.name}
                          </span>
                        )}
                        {entry.note && (
                          <p style={{ fontSize: 11, color: 'var(--m-slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.note}
                          </p>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--m-slate)', marginTop: 2 }}>
                        {fmtDate(entry.date)}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: isIncome ? '#0D9488' : '#FF6B5E',
                        letterSpacing: '-0.01em',
                      }}>
                        {isIncome ? '+' : '−'}{fmtCurrency(entry.amount, currency)}
                      </p>
                      <span style={{
                        display: 'inline-block',
                        marginTop: 3,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 7px',
                        borderRadius: 999,
                        background: isIncome ? '#CCFBF1' : '#FFE4E1',
                        color: isIncome ? '#0D9488' : '#FF6B5E',
                      }}>
                        {isIncome ? 'IN' : 'OUT'}
                      </span>
                    </div>
                  </div>
                </SwipeableRow>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
