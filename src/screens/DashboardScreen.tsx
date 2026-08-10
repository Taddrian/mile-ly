'use client';

import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtCurrency, fmtShort, currencySymbol } from '@/lib/currency';
import { useCountUp } from '@/lib/useCountUp';
import { daysLeftInCycle, weekOfCycle } from '@/lib/cycle';
import { hueVars } from '@/lib/hue';
import { layoutPathNodes, MAX_PATH_NODES } from '@/lib/pathLayout';
import MonthPicker from '@/components/ui/MonthPicker';
import CategoryChip from '@/components/ui/CategoryChip';
import AddCardForm from '@/components/cards/AddCardForm';
import EditCardForm from '@/components/cards/EditCardForm';
import CardRow from '@/components/cards/CardRow';
import Modal from '@/components/ui/Modal';
import MiloMascot from '@/components/decor/MiloMascot';
import MiloFairy from '@/components/decor/MiloFairy';
import AmbientScene from '@/components/decor/AmbientScene';
import { CoinsIcon, WalletIcon, PiggyIcon, CalendarIcon, nodeIconFor } from '@/components/decor/icons';
import PathNode from '@/components/dashboard/PathNode';

const EditGlyph = ({ color = '#ffffff' }: { color?: string }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
);

// Smooth cubic-bezier through a sequence of points (centers of each path node).
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    d += ` C ${a.x} ${a.y + 36}, ${b.x} ${b.y - 36}, ${b.x} ${b.y}`;
  }
  return d;
}

export default function DashboardScreen() {
  const {
    cards, addCard, updateCard, deleteCard, entries, categories,
    selectedMonth, setSelectedMonth, cycleStartDay, currency, budgetState,
  } = useApp();
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

  const catSpend = useMemo(() => {
    const map: Record<string, { name: string; amount: number }> = {};
    entries.forEach((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      if (!cat || cat.type !== 'expense') return;
      // Any expense entry tied to a card (itemized or quick balance-update) rolls
      // into one Credit Card total, regardless of which category it's tagged with,
      // so this always sums to exactly the same "Spent" figure shown up top.
      if (e.cardId) {
        if (!map['__card_total']) map['__card_total'] = { name: 'Credit Card', amount: 0 };
        map['__card_total'].amount += e.amount;
        return;
      }
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

  // The node touching whichever expense entry was most recently CREATED (not the
  // one with the latest transaction date — those can tie/be backdated) gets a
  // real "YOU ARE HERE" caption, i.e. the user's newest edit. '__cards' if that
  // entry was card-tied.
  const currentNodeKey = useMemo(() => {
    const expenseEntries = entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense');
    if (expenseEntries.length === 0) return null;
    const recency = (e: typeof expenseEntries[number]) => e.createdAt ?? e.date;
    const latest = expenseEntries.reduce((a, b) => (recency(b) > recency(a) ? b : a));
    if (latest.cardId) return '__cards';
    return categories.find((c) => c.id === latest.categoryId)?.name ?? null;
  }, [entries, categories]);

  // The "Cards" node always leads the path; category nodes follow, one per
  // expense category that has spend this cycle. Fits within MAX_PATH_NODES,
  // otherwise falls back to the classic list below instead of an overlong path.
  const cardsTotal = cards.reduce((s, c) => s + c.currentSpent, 0);
  const totalPathNodes = 1 + catSpend.length;
  const useCompactList = totalPathNodes > MAX_PATH_NODES;
  const positions = useMemo(() => layoutPathNodes(useCompactList ? 0 : totalPathNodes), [useCompactList, totalPathNodes]);
  // 145 covers the tallest node variant (one carrying the "You are here" pill);
  // Milo roams the full card at a lower z-index than the nodes (see below), so
  // this is just bottom breathing room now, not a reserved lane for him.
  const NODE_FOOTPRINT = 145;
  const lastNodeY = positions.length > 0 ? positions[positions.length - 1].y : 0;
  const pathHeight = positions.length > 0 ? lastNodeY + NODE_FOOTPRINT + 24 : 0;

  const week = weekOfCycle(selectedMonth, cycleStartDay);

  const pctSaved = income > 0 ? Math.round((saved / income) * 100) : 0;

  const animatedIncome = useCountUp(income);
  const animatedPctSaved = useCountUp(pctSaved);
  const animatedDaysLeft = useCountUp(daysLeft);

  const statStrip = [
    { value: `${currencySymbol(currency)}${fmtShort(animatedIncome, currency)}`, color: 'var(--node-deep)', Icon: CoinsIcon },
    { value: `${currencySymbol(currency)}${fmtShort(animatedSaved, currency)}`, color: '#e8a33f', Icon: WalletIcon },
    { value: `${Math.round(animatedPctSaved)}%`, color: '#b689ec', Icon: PiggyIcon },
    { value: daysLeft > 0 ? String(Math.round(animatedDaysLeft)) : '—', color: '#b8b2a8', Icon: CalendarIcon },
  ];

  const monthAbbrev = new Date(selectedMonth).toLocaleDateString('en-SG', { month: 'short' }).toUpperCase();

  return (
    <div className="min-h-screen" style={{ position: 'relative', ...hueVars(budgetState) }}>
      <AmbientScene variant="page" />

      <div style={{ position: 'relative', zIndex: 1 }}>

      {/* ── Stat strip ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px 4px' }}>
        {statStrip.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: 9, background: `color-mix(in srgb, ${s.color} 13%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.Icon size={15} color={s.color} />
            </div>
            <span className="font-display" style={{ fontSize: 16, fontWeight: 800, color: 'var(--m-ink)' }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Quest banner ── */}
      <div className="quest-banner" style={{ position: 'relative', margin: '8px 16px 0', padding: '16px 20px 18px', color: 'white', overflow: 'hidden' }}>
        {/* Faint decorative route doodle */}
        <svg viewBox="0 0 200 110" style={{ position: 'absolute', right: 0, bottom: 0, width: '55%', height: '100%', opacity: 0.14, pointerEvents: 'none' }} preserveAspectRatio="none">
          <path d="M -10 95 C 40 45, 80 100, 120 55 S 180 15, 215 45" fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
          <path d="M 150 32 l 15 -7 -4 15 -5.5 -4 z" fill="#ffffff" />
        </svg>

        <button
          onClick={() => { setRemarkInput(remark); setEditingRemark((v) => !v); }}
          aria-label="Trail notes"
          style={{
            position: 'absolute', top: 14, right: 16, width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <EditGlyph color="#ffffff" />
          {remark && (
            <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#FFC800', border: '1.5px solid var(--node-deep)' }} />
          )}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingRight: 40 }}>
          <p className="font-display" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)' }}>
            {week ? `Week ${week} of this cycle` : 'This cycle'}
          </p>
          {week && (
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4].map((w) => (
                <div key={w} style={{ width: 6, height: 6, borderRadius: 3, background: w <= week ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)' }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <MonthPicker value={selectedMonth} onChange={setSelectedMonth} cycleStartDay={cycleStartDay} />
        </div>
        <p className="font-display" style={{ fontSize: 25, fontWeight: 800, color: '#ffffff', marginTop: 6, lineHeight: 1.15 }}>
          {fmtCurrency(animatedSaved, currency)} left to spend
        </p>
      </div>

      {/* ── Trail notes editor (only shown while open) ── */}
      {editingRemark && (
        <div className="card-chunky p-4" style={{ margin: '10px 16px 0' }}>
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)' }}>
              Trail notes
            </p>
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
          </div>
          <textarea
            value={remarkInput}
            onChange={(e) => setRemarkInput(e.target.value)}
            autoFocus
            placeholder="e.g. Splurged on flights ✈️, birthday dinner 🎂, gym membership renewed..."
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
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-4 space-y-3 pb-6 pt-3">

        {/* Empty state */}
        {income === 0 && expenses === 0 && cards.length === 0 && (
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

        {/* Adventure path — one node per expense category, plus a Cards node */}
        {!useCompactList && totalPathNodes > 0 && (
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              border: '2px solid #e8e5dd',
              borderRadius: 22,
              boxShadow: '0 3px 0 #e0dcd2',
              padding: '18px 0 16px',
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--node-ring) 4%, var(--card)), color-mix(in srgb, var(--node-ring) 9%, var(--card)))',
              transition: 'background 0.4s ease',
            }}
          >
            <AmbientScene variant="card" />
            <p style={{ position: 'relative', zIndex: 1, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--m-slate, #777777)', padding: '0 22px', marginBottom: 6 }}>
              Your path this cycle
            </p>
            <div style={{ position: 'relative', height: pathHeight, zIndex: 1 }}>
              <svg
                viewBox={`0 0 100 ${pathHeight}`}
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: pathHeight, zIndex: 0 }}
              >
                <path
                  key={positions.length}
                  className="connector-fade-in"
                  d={smoothPath(positions.map((p) => ({ x: p.xPct, y: p.y + 44 })))}
                  fill="none"
                  stroke="var(--m-border)"
                  strokeWidth={2}
                  strokeDasharray="1 5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              {/* Cards node always leads the path */}
              <div style={{ position: 'absolute', left: `${positions[0].xPct}%`, top: positions[0].y, transform: 'translateX(-50%)', zIndex: 1, transition: 'left 0.5s cubic-bezier(0.22,1,0.36,1), top 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
                <PathNode
                  label="Cards"
                  amount={fmtCurrency(cardsTotal, currency)}
                  active={cards.length > 0}
                  colorIndex={0}
                  icon={nodeIconFor(0)}
                  showCheck={cards.length > 0}
                  subLabel={currentNodeKey === '__cards' ? 'You are here' : undefined}
                  onClick={() => setShowAllCards(true)}
                  style={{ animationDelay: '0ms' }}
                />
              </div>

              {catSpend.map((c, i) => {
                const pos = positions[i + 1];
                return (
                  <div key={c.name} style={{ position: 'absolute', left: `${pos.xPct}%`, top: pos.y, transform: 'translateX(-50%)', zIndex: 1, transition: 'left 0.5s cubic-bezier(0.22,1,0.36,1), top 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
                    <PathNode
                      label={c.name}
                      amount={fmtCurrency(c.amount, currency)}
                      fraction={expenses > 0 ? c.amount / expenses : 0}
                      active
                      showRing
                      colorIndex={i + 1}
                      icon={nodeIconFor(i + 1)}
                      subLabel={c.name === currentNodeKey ? 'You are here' : undefined}
                      style={{ animationDelay: `${(i + 1) * 90}ms` }}
                    />
                  </div>
                );
              })}

              {/* Milo free-roams the whole path card behind the nodes (zIndex 0 < nodes' 1),
                  so any brief crossing never covers a label or the "You are here" pill. */}
              <div className="milo-roam" style={{ position: 'absolute', zIndex: 0 }}>
                <div className="milo-idle-bob" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MiloFairy />
                  <span
                    className="font-display"
                    style={{ background: 'var(--node-deep)', color: 'white', fontSize: 12, fontWeight: 800, padding: '4px 12px', borderRadius: 10, whiteSpace: 'nowrap' }}
                  >
                    {monthAbbrev}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact fallback: Cards keeps its own tappable row since it isn't in the path here */}
        {useCompactList && (
          <button
            onClick={() => setShowAllCards(true)}
            className="w-full flex items-center gap-3 text-left"
            style={{
              background: 'var(--card)',
              border: '2px solid var(--m-border)',
              borderRadius: 14,
              boxShadow: '0 2px 0 var(--m-border-dark)',
              padding: '12px 14px',
            }}
          >
            <div className="node-candy" style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...hueVars(budgetState) }}>
              {nodeIconFor(0, 18)}
            </div>
            <span className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--m-ink)', flex: 1 }}>Cards</span>
            <span className="font-display" style={{ fontSize: 13, fontWeight: 800, color: 'var(--m-ink)' }}>{fmtCurrency(cardsTotal, currency)}</span>
          </button>
        )}

        {/* Compact fallback list when there are too many categories for the path */}
        {useCompactList && catSpend.length > 0 && (
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
                  <div style={{ height: 6, borderRadius: 999, background: '#EFF3F2', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 999, background: 'var(--node-deep)', width: `${(amount / expenses) * 100}%`, transition: 'width 0.5s ease', ...hueVars(budgetState) }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAddCard} onClose={() => setShowAddCard(false)} title="Add New Card" key={showAddCard ? 'add-open' : 'add-closed'}>
        <AddCardForm
          onSubmit={(data) => { addCard(data); setShowAddCard(false); }}
          onCancel={() => setShowAddCard(false)}
        />
      </Modal>

      <Modal isOpen={showAllCards} onClose={() => setShowAllCards(false)} title="Your Cards" key={showAllCards ? 'all-open' : 'all-closed'}>
        {cards.length === 0 ? (
          <button
            onClick={() => { setShowAllCards(false); setShowAddCard(true); }}
            className="w-full py-5 rounded-[18px] text-xs font-semibold transition-colors"
            style={{ border: '2px dashed var(--m-border)', color: 'var(--m-slate)' }}
          >
            Add your first card
          </button>
        ) : (
          <>
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
            <button
              onClick={() => { setShowAllCards(false); setShowAddCard(true); }}
              className="w-full text-center mt-3"
              style={{ fontSize: 12, fontWeight: 700, color: 'var(--m-teal, #0D9488)' }}
            >
              + Add another card
            </button>
          </>
        )}
      </Modal>

      <Modal isOpen={!!editingCardId} onClose={() => setEditingCardId(null)} title="Edit Card" key={editingCardId ?? 'edit-closed'}>
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
    </div>
  );
}
