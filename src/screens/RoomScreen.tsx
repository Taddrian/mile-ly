'use client';

import { useMemo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { fmtCurrency, fmtShort, currencySymbol } from '@/lib/currency';
import { useCountUp } from '@/lib/useCountUp';
import { daysLeftInCycle, weekOfCycle } from '@/lib/cycle';
import MonthPicker from '@/components/ui/MonthPicker';
import AddCardForm from '@/components/cards/AddCardForm';
import EditCardForm from '@/components/cards/EditCardForm';
import CardRow from '@/components/cards/CardRow';
import Modal from '@/components/ui/Modal';
import MiloFairy from '@/components/decor/MiloFairy';
import FurnitureSprite, { RoomSymbolDefs, FURNITURE_PLACEMENT, SCENE_VIEWBOX, SCENE_WIDTH, SCENE_HEIGHT, furnitureVars } from '@/components/decor/roomSprites';
import {
  FURNITURE_ITEMS, WARDROBE_ITEMS, ROOM_SLOT_LABELS,
  RoomSlot, findFurniture, findWardrobe,
} from '@/lib/roomCatalog';

type ShopKind = 'decor' | 'wardrobe' | 'pet' | null;

// Dock icons — exact paths from the Claude Design handoff (design-handoff/).
const CouchIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="#fff"><rect x="3" y="10" width="18" height="7" rx="2" /><rect x="4" y="7" width="4" height="6" rx="1.5" /><rect x="16" y="7" width="4" height="6" rx="1.5" /><rect x="3" y="16" width="3" height="3" rx="1" /><rect x="18" y="16" width="3" height="3" rx="1" /></svg>
);
const HangerIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round"><circle cx="12" cy="5" r="1.6" /><path d="M12 6.5 L4 14 H20 Z" /></svg>
);
const PawIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="#fff"><ellipse cx="12" cy="16" rx="6" ry="4.5" /><circle cx="5" cy="9" r="2.6" /><circle cx="10.5" cy="6" r="2.6" /><circle cx="15.5" cy="6" r="2.6" /><circle cx="19" cy="9" r="2.6" /></svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="#fff"><rect x="4" y="13" width="4" height="8" rx="1" /><rect x="10" y="8" width="4" height="13" rx="1" /><rect x="16" y="3" width="4" height="18" rx="1" /></svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="#cfd0e6" strokeWidth={3}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="7" height="7" fill="none" stroke="#2e2145" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"><polyline points="5,13 10,18 19,7" /></svg>
);
const EditGlyph = ({ color = '#ffffff' }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />
  </svg>
);

// Glossy-orb accent palette, cycled per category node (see globals.css .orb).
const ORB_COLORS = ['#5fd6c4', '#f28cc4', '#f4c86e', '#9d8cf0', '#7c8ce0', '#ef8a7a'];

// Milo's wander "home" — standing on the rug, not the scene's (0,0) corner.
// .room-milo-wander only ever *translates* from wherever it's positioned, so
// without an explicit anchor here he'd default to the container's top-left
// and never actually reach the floor.
const MILO_HOME_PCT = {
  left: ((FURNITURE_PLACEMENT.rug.x + FURNITURE_PLACEMENT.rug.width / 2 - 40) / SCENE_WIDTH) * 100,
  top: ((FURNITURE_PLACEMENT.rug.y + 6) / SCENE_HEIGHT) * 100,
};

export default function RoomScreen() {
  const {
    cards, addCard, updateCard, deleteCard, entries, categories,
    selectedMonth, setSelectedMonth, cycleStartDay, currency, budgetState,
    coinBalance, level, xpIntoLevel, xpForNextLevel,
    inventory, roomSlots, equippedWardrobe,
    purchaseItem, equipItem, unequipSlot,
  } = useApp();

  // ── Budget overlay + trail notes (ported from the old Home dashboard) ──
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [remark, setRemark] = useState('');
  const [editingRemark, setEditingRemark] = useState(false);
  const [remarkInput, setRemarkInput] = useState('');
  const [showBudget, setShowBudget] = useState(false);

  // ── Room shop state ──
  const [openShop, setOpenShop] = useState<ShopKind>(null);
  const [shopMode, setShopMode] = useState<'shop' | 'mine'>('shop');
  const [buying, setBuying] = useState<string | null>(null);

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

  const sortedCards = useMemo(() => {
    const lastActivity = (cardId: string) => {
      const times = entries
        .filter((e) => e.cardId === cardId)
        .map((e) => (e.createdAt ? new Date(e.createdAt).getTime() : -Infinity));
      return times.length > 0 ? Math.max(...times) : -Infinity;
    };
    return [...cards].sort((a, b) => lastActivity(b.id) - lastActivity(a.id));
  }, [cards, entries]);

  const currentNodeKey = useMemo(() => {
    const expenseEntries = entries.filter((e) => categories.find((c) => c.id === e.categoryId)?.type === 'expense');
    if (expenseEntries.length === 0) return null;
    const recency = (e: typeof expenseEntries[number]) => e.createdAt ?? e.date;
    const latest = expenseEntries.reduce((a, b) => (recency(b) > recency(a) ? b : a));
    if (latest.cardId) return '__cards';
    return categories.find((c) => c.id === latest.categoryId)?.name ?? null;
  }, [entries, categories]);

  const cardsTotal = cards.reduce((s, c) => s + c.currentSpent, 0);
  const week = weekOfCycle(selectedMonth, cycleStartDay);
  const pctSaved = income > 0 ? Math.round((saved / income) * 100) : 0;
  const animatedExpenses = useCountUp(expenses);
  const animatedPctSaved = useCountUp(pctSaved);
  const animatedDaysLeft = useCountUp(daysLeft);
  const hasAnyData = income > 0 || expenses > 0 || cards.length > 0;

  // Node shelf — Cards pinned first, then one glossy orb per expense category
  // (dynamic count; the shelf scrolls horizontally rather than assuming a
  // fixed number, per the handoff's own "try next" note on this).
  const shelfNodes = useMemo(() => [
    { key: '__cards', label: 'Cards', amount: cardsTotal, color: ORB_COLORS[0], showCheck: cards.length > 0, isHere: currentNodeKey === '__cards', fraction: undefined as number | undefined },
    ...catSpend.map((c, i) => ({
      key: c.name, label: c.name, amount: c.amount, color: ORB_COLORS[(i + 1) % ORB_COLORS.length],
      showCheck: false, isHere: c.name === currentNodeKey, fraction: expenses > 0 ? c.amount / expenses : 0,
    })),
  ], [cardsTotal, cards.length, currentNodeKey, catSpend, expenses]);

  const budgetPills = [
    { color: '#f4c86e', value: `${currencySymbol(currency)}${fmtShort(animatedExpenses, currency)}` },
    { color: '#5fd6c4', value: `${currencySymbol(currency)}${fmtShort(animatedSaved, currency)}` },
    { color: '#f28cc4', value: `${Math.round(animatedPctSaved)}%` },
    { color: '#9d8cf0', value: daysLeft > 0 ? String(Math.round(animatedDaysLeft)) : '—' },
  ];

  // ── Room shop ──
  const animatedCoins = useCountUp(coinBalance);
  const ownedIds = new Set(inventory.map((i) => i.itemId));
  const equippedOutfit = equippedWardrobe.outfit ? findWardrobe(equippedWardrobe.outfit) : undefined;

  function openShopSheet(kind: 'decor' | 'wardrobe') {
    setOpenShop(kind);
    setShopMode('shop');
  }

  async function handleBuy(itemId: string) {
    setBuying(itemId);
    await purchaseItem(itemId);
    setBuying(null);
  }

  const catalog = openShop === 'wardrobe' ? WARDROBE_ITEMS : openShop === 'decor' ? FURNITURE_ITEMS : [];
  const shopItems = catalog.filter((i) => i.cost > 0 && !ownedIds.has(i.id));
  const ownedItems = catalog.filter((i) => i.cost === 0 || ownedIds.has(i.id));

  const DOCK_ITEMS = [
    { key: 'decor' as const, label: 'Decor', Icon: CouchIcon, onClick: () => openShopSheet('decor') },
    { key: 'wardrobe' as const, label: 'Wardrobe', Icon: HangerIcon, onClick: () => openShopSheet('wardrobe') },
    { key: 'pet' as const, label: 'Pet', Icon: PawIcon, onClick: () => setOpenShop('pet') },
    { key: 'budget' as const, label: 'Budget', Icon: ChartIcon, onClick: () => setShowBudget((v) => !v) },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <RoomSymbolDefs />

      {/* ── Room scene — full-bleed hero, fills the visible screen up to
          where <main>'s pb-24 reserves room for the floating nav pill. Fixed
          warm palette regardless of app theme (intentional — this screen
          stays cozy/neutral); only the HUD/dock chrome swaps for dark mode
          via the --room-* tokens in globals.css. ── */}
      <div style={{ position: 'relative', minHeight: 'calc(100dvh - 96px)', overflow: 'hidden' }}>
        <svg viewBox={SCENE_VIEWBOX} preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{ position: 'absolute', inset: 0, display: 'block', background: '#f4e8cd' }}>
          <use href="#sym-scene-bg" />
          {(Object.keys(FURNITURE_PLACEMENT) as RoomSlot[]).map((slot) => {
            const itemId = roomSlots[slot];
            const item = itemId ? findFurniture(itemId) : undefined;
            if (!item) return null;
            const p = FURNITURE_PLACEMENT[slot];
            return (
              <g key={slot} onClick={() => openShopSheet('decor')} style={{ cursor: 'pointer' }} aria-label={`${item.name} — tap to swap`}>
                <use href={`#sym-${slot}`} x={p.x} y={p.y} width={p.width} height={p.height} style={furnitureVars(item.colors)} />
              </g>
            );
          })}
        </svg>

        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 150, background: 'var(--room-scrim-top)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--room-scrim-bottom)' }} />

        {/* Walking, not floating — full layered motion ported from the
            handoff's MILO_ANIMATION.md: wander (this wrapper) → walk bob +
            ground shadow (synced) → feet tapping + wings flapping (inside
            MiloFairy itself, walking-only feet vs. always-on wings). */}
        <div className="room-milo-wander" style={{ position: 'absolute', zIndex: 2, left: `${MILO_HOME_PCT.left}%`, top: `${MILO_HOME_PCT.top}%` }}>
          <div style={{ position: 'relative' }}>
            <div className="room-milo-walk-bob">
              <MiloFairy colorOverrides={equippedOutfit?.colorOverrides} walking />
            </div>
            <div className="room-milo-walk-shadow" style={{ position: 'absolute', left: '50%', bottom: -3, width: 24, height: 7, borderRadius: '50%', background: 'rgba(50,32,16,0.4)', filter: 'blur(0.5px)' }} />
          </div>
        </div>

        {/* ── Top HUD ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3, padding: '16px 14px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--room-hud-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid var(--room-hud-border)', borderRadius: 999, padding: '5px 12px 5px 5px', boxShadow: 'var(--room-hud-shadow)' }}>
            <span className="font-display" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: '50%', background: '#3f7d6e', color: '#f3efe6', fontWeight: 800, fontSize: 11, flexShrink: 0 }}>
              {level}
            </span>
            <div style={{ width: 96, height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.35)', overflow: 'hidden' }}>
              <div style={{ width: `${(xpIntoLevel / xpForNextLevel) * 100}%`, height: '100%', borderRadius: 999, background: '#8fe0cf', transition: 'width 0.5s ease' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--room-hud-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid var(--room-hud-border)', borderRadius: 999, padding: '6px 12px', boxShadow: 'var(--room-hud-shadow)' }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#f4dc9e', border: '1px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
            <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{Math.round(animatedCoins)}</span>
          </div>
        </div>

        {/* ── Vertical dock ── */}
        <div style={{ position: 'absolute', top: 150, right: -6, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, background: 'var(--room-dock-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid var(--room-dock-border)', borderRadius: 999, padding: '16px 10px', boxShadow: 'var(--room-dock-shadow)' }}>
          {DOCK_ITEMS.map(({ key, label, Icon, onClick }) => (
            <button key={key} onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} aria-label={label}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--room-chip-bg)', border: '1px solid var(--room-chip-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon />
              </span>
              <span className="font-display" style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Budget overlay card — everything the old Home dashboard showed
            (income/saved/%/days-left, the cycle headline, category spend,
            cards) lives here now, consolidated into one panel with the node
            shelf scrolling inside it rather than floating separately. ── */}
        {showBudget && (
          <div style={{ position: 'absolute', top: 74, left: 14, width: 238, maxWidth: 'calc(100% - 82px)', zIndex: 4, background: 'linear-gradient(160deg, #2e2145, #1c1430)', border: '1px solid rgba(214,168,255,0.22)', borderRadius: 20, padding: '14px 16px 16px', boxShadow: '0 8px 22px rgba(20,10,35,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
              <span className="font-display" style={{ fontSize: 12, fontWeight: 800, color: '#f0eef7' }}>Budget</span>
              <button onClick={() => setShowBudget(false)} aria-label="Close" style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseIcon />
              </button>
            </div>

            {!hasAnyData ? (
              <p style={{ fontSize: 11, fontWeight: 600, color: '#c9b8f2', lineHeight: 1.5, padding: '4px 0 2px' }}>
                Nothing tracked yet this cycle — tap the + button to add your first entry.
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 6, marginBottom: 11, flexWrap: 'wrap' }}>
                  {budgetPills.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 999, padding: '4px 8px 4px 4px' }}>
                      <span style={{ width: 16, height: 16, borderRadius: 6, background: p.color, flexShrink: 0 }} />
                      <span className="font-display" style={{ fontSize: 9.5, fontWeight: 800, color: '#f0eef7' }}>{p.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.045)', borderRadius: 14, padding: '10px 12px 11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-display" style={{ fontSize: 8.5, fontWeight: 800, color: '#e8c9ff', letterSpacing: '0.06em', background: 'rgba(157,140,240,0.22)', borderRadius: 999, padding: '2px 7px' }}>
                      {week ? `WEEK ${week} OF 4` : 'THIS CYCLE'}
                    </span>
                    <button
                      onClick={() => { setRemarkInput(remark); setEditingRemark((v) => !v); }}
                      aria-label="Trail notes"
                      style={{ position: 'relative', width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <EditGlyph color="#cfd0e6" />
                      {remark && <span style={{ position: 'absolute', top: -1, right: -1, width: 6, height: 6, borderRadius: '50%', background: '#f4c86e', border: '1px solid #1c1430' }} />}
                    </button>
                  </div>
                  <div style={{ marginTop: 6, color: '#cfc3e6' }}>
                    <MonthPicker value={selectedMonth} onChange={setSelectedMonth} cycleStartDay={cycleStartDay} />
                  </div>
                  <div className="font-display" style={{ fontSize: 21, fontWeight: 800, color: '#f6f5fb', marginTop: 5, letterSpacing: '-0.01em' }}>
                    {fmtCurrency(animatedSaved, currency)} <span style={{ fontSize: 10.5, fontWeight: 700, color: '#c9b8f2' }}>left to spend</span>
                  </div>

                  {editingRemark && (
                    <div style={{ marginTop: 10 }}>
                      <textarea
                        value={remarkInput}
                        onChange={(e) => setRemarkInput(e.target.value)}
                        autoFocus
                        placeholder="e.g. Splurged on flights ✈️, birthday dinner 🎂..."
                        rows={3}
                        className="w-full outline-none resize-none font-display"
                        style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.5, color: '#f0eef7', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 10, padding: '8px 10px' }}
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button onClick={saveRemark} className="font-display" style={{ padding: '5px 12px', borderRadius: 8, fontSize: 10.5, fontWeight: 700, color: '#1c1430', background: '#8fe0cf' }}>Save</button>
                        <button onClick={() => setEditingRemark(false)} className="font-display" style={{ padding: '5px 12px', borderRadius: 8, fontSize: 10.5, fontWeight: 700, color: '#cfc3e6', border: '1px solid rgba(255,255,255,0.18)' }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Node shelf — scrolls horizontally so it works for any
                    number of categories, folded inside the card (not a
                    separately floating shelf) to keep one visual material
                    instead of two clashing ones. */}
                <div style={{ display: 'flex', gap: 14, marginTop: 12, overflowX: 'auto', paddingBottom: 2 }}>
                  {shelfNodes.map((node) => (
                    <button
                      key={node.key}
                      onClick={node.key === '__cards' ? () => setShowAllCards(true) : undefined}
                      style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', paddingTop: node.isHere ? 12 : 0 }}
                    >
                      <div style={{ position: 'relative', width: 46, height: 46 }}>
                        <div className="orb" style={{ '--c': node.color, width: 46, height: 46 } as React.CSSProperties} />
                        {node.fraction !== undefined && (
                          <div style={{
                            position: 'absolute', inset: -5, borderRadius: '50%',
                            background: `conic-gradient(${node.color} calc(1% * ${Math.round(node.fraction * 100)}), rgba(255,255,255,0.14) 0)`,
                            WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
                            mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
                          }} />
                        )}
                        {node.showCheck && (
                          <span style={{ position: 'absolute', top: -2, right: -2, width: 15, height: 15, borderRadius: '50%', background: '#f4c86e', border: '2px solid #241a3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon />
                          </span>
                        )}
                        {node.isHere && (
                          <>
                            <span className="font-display" style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 7.5, fontWeight: 800, color: '#2e2145', letterSpacing: '0.03em', background: '#9d8cf0', borderRadius: 999, padding: '2px 6px', zIndex: 2 }}>
                              YOU ARE HERE
                            </span>
                            <div style={{ position: 'absolute', left: -14, top: 4, animation: 'room-float-bob 2.4s ease-in-out infinite', transform: 'scale(0.42)', transformOrigin: 'top left' }}>
                              <MiloFairy colorOverrides={equippedOutfit?.colorOverrides} />
                            </div>
                          </>
                        )}
                      </div>
                      <span className="font-display" style={{ fontSize: 10, fontWeight: 800, color: '#f0eef7', maxWidth: 68, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</span>
                      <span className="font-display" style={{ fontSize: 9, fontWeight: 700, color: '#c9b8f2' }}>{fmtCurrency(node.amount, currency)}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Decor / Wardrobe shop sheet */}
      <Modal
        isOpen={openShop === 'decor' || openShop === 'wardrobe'}
        onClose={() => setOpenShop(null)}
        title={openShop === 'wardrobe' ? 'Wardrobe' : 'Decor Shop'}
      >
        <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
          {(['shop', 'mine'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setShopMode(m)}
              className="font-display"
              style={{
                flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 700,
                background: shopMode === m ? 'linear-gradient(180deg, var(--node-ring), var(--node-deep))' : 'color-mix(in srgb, var(--m-border) 40%, white)',
                color: shopMode === m ? '#fff' : 'var(--m-slate)',
              }}
            >
              {m === 'shop' ? 'Shop' : 'My Items'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(shopMode === 'shop' ? shopItems : ownedItems).length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--m-slate)', textAlign: 'center', padding: '12px 0' }}>
              {shopMode === 'shop' ? 'Nothing left to buy here!' : "You don't own any of these yet."}
            </p>
          )}
          {(shopMode === 'shop' ? shopItems : ownedItems).map((item) => {
            const isWardrobe = 'category' in item;
            const equipped = isWardrobe
              ? equippedWardrobe.outfit === item.id
              : roomSlots[item.slot] === item.id;
            return (
              <div key={item.id} className="card-chunky" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'color-mix(in srgb, var(--m-border) 30%, white)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {isWardrobe ? (
                    <div style={{ transform: 'scale(0.55)' }}><MiloFairy colorOverrides={item.colorOverrides} /></div>
                  ) : (
                    <FurnitureSprite slot={item.slot} colors={item.colors} size={40} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--m-ink)' }}>{item.name}</p>
                  {shopMode === 'shop' ? (
                    <p style={{ fontSize: 11, color: 'var(--m-slate)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f4dc9e', display: 'inline-block' }} /> {item.cost}
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--m-slate)', marginTop: 2 }}>
                      {isWardrobe ? 'Outfit' : ROOM_SLOT_LABELS[item.slot]}{item.cost === 0 ? ' · Free' : ''}
                    </p>
                  )}
                </div>
                {shopMode === 'shop' ? (
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={coinBalance < item.cost || buying === item.id}
                    className="font-display"
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#fff',
                      background: coinBalance < item.cost ? 'var(--m-border)' : 'linear-gradient(180deg, var(--node-ring), var(--node-deep))',
                      opacity: buying === item.id ? 0.6 : 1,
                    }}
                  >
                    {buying === item.id ? '…' : 'Buy'}
                  </button>
                ) : (
                  <button
                    onClick={() => (equipped ? isWardrobe && unequipSlot('outfit') : equipItem(item.id))}
                    disabled={equipped && !isWardrobe}
                    className="font-display"
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: equipped ? '#DFF3EF' : 'var(--card)',
                      color: equipped ? 'var(--node-deep)' : 'var(--m-slate)',
                      border: `2px solid ${equipped ? 'var(--node-ring)' : 'var(--m-border)'}`,
                    }}
                  >
                    {equipped ? '✓ Equipped' : isWardrobe ? 'Equip' : 'Place'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Pet panel */}
      <Modal isOpen={openShop === 'pet'} onClose={() => setOpenShop(null)} title="Milo">
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <MiloFairy colorOverrides={equippedOutfit?.colorOverrides} />
          </div>
          <p className="font-display" style={{ fontSize: 14, fontWeight: 700, color: 'var(--m-ink)' }}>
            {budgetState === 'teal' ? "Milo's thriving!" : "Milo's a little worried…"}
          </p>
          <p style={{ fontSize: 12, color: 'var(--m-slate)', marginTop: 4 }}>
            {budgetState === 'teal'
              ? "You're on track this cycle — keep it up!"
              : "Spending's ahead of income this cycle."}
          </p>
        </div>
      </Modal>

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
  );
}
