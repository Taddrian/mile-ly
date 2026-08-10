'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCountUp } from '@/lib/useCountUp';
import { CoinsIcon } from '@/components/decor/icons';
import MiloFairy from '@/components/decor/MiloFairy';
import Modal from '@/components/ui/Modal';
import {
  FURNITURE_ITEMS, WARDROBE_ITEMS, ROOM_SLOT_LABELS,
  RoomSlot, findFurniture, findWardrobe,
} from '@/lib/roomCatalog';

type ShopKind = 'decor' | 'wardrobe' | 'pet' | null;

// Anchors for the 3 fixed Phase 1 slots within the room diorama (percentage-
// based, so it scales with the card regardless of viewport width).
const SLOT_POSITIONS: Record<RoomSlot, React.CSSProperties> = {
  bed: { left: '14%', top: '20%' },
  plant: { right: '10%', top: '18%' },
  rug: { left: '50%', bottom: '14%', transform: 'translateX(-50%)' },
};

export default function RoomScreen() {
  const {
    coinBalance, level, xpIntoLevel, xpForNextLevel,
    inventory, roomSlots, equippedWardrobe, budgetState,
    purchaseItem, equipItem, unequipSlot,
  } = useApp();

  const [openShop, setOpenShop] = useState<ShopKind>(null);
  const [shopMode, setShopMode] = useState<'shop' | 'mine'>('shop');
  const [buying, setBuying] = useState<string | null>(null);
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
  const shopItems = catalog.filter((i) => !ownedIds.has(i.id));
  const ownedItems = catalog.filter((i) => ownedIds.has(i.id));

  return (
    <div className="min-h-screen">
      {/* Header — level/XP + Sparks balance. Deliberately not hue-flooded with
          budgetState (teal/coral) like the rest of the app: a coral flood here
          during an overspend cycle would read as punitive on a "fun" screen. */}
      <div className="px-4 pt-14 pb-3 flex items-center justify-between">
        <div>
          <p className="font-display" style={{ fontSize: 12, fontWeight: 800, color: 'var(--m-ink)', marginBottom: 4 }}>
            Level {level}
          </p>
          <div style={{ width: 130, height: 7, borderRadius: 999, background: 'var(--m-border)', overflow: 'hidden' }}>
            <div style={{
              width: `${(xpIntoLevel / xpForNextLevel) * 100}%`, height: '100%', borderRadius: 999,
              background: 'linear-gradient(90deg, #f2a6cf, #e0568c)', transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
        <div className="card-chunky" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px' }}>
          <CoinsIcon size={16} color="#e8a33f" />
          <span className="font-display" style={{ fontSize: 15, fontWeight: 800, color: 'var(--m-ink)' }}>
            {Math.round(animatedCoins)}
          </span>
        </div>
      </div>

      {/* Room diorama */}
      <div
        className="mx-4"
        style={{
          position: 'relative', height: 260, borderRadius: 22, overflow: 'hidden',
          border: '2px solid #e8e0cf', boxShadow: '0 3px 0 #ddd2ba',
          background: 'linear-gradient(180deg, #fdf6ec 0%, #f3ead9 62%, #e8ddc8 100%)',
        }}
      >
        {(Object.keys(SLOT_POSITIONS) as RoomSlot[]).map((slot) => {
          const itemId = roomSlots[slot];
          const item = itemId ? findFurniture(itemId) : undefined;
          return (
            <div key={slot} style={{ position: 'absolute', ...SLOT_POSITIONS[slot] }}>
              {item ? (
                <button
                  onClick={() => unequipSlot(slot)}
                  aria-label={`${item.name} — tap to remove`}
                  style={{
                    width: 56, height: 56, borderRadius: 16, background: item.color,
                    boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.15), 0 3px 8px rgba(0,0,0,0.1)',
                  }}
                />
              ) : (
                <button
                  onClick={() => openShopSheet('decor')}
                  aria-label={`Add ${ROOM_SLOT_LABELS[slot]}`}
                  style={{
                    width: 56, height: 56, borderRadius: 16, border: '2px dashed #c9bda0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#a99b7a', fontSize: 20, fontWeight: 700,
                  }}
                >
                  +
                </button>
              )}
            </div>
          );
        })}

        <div className="milo-roam" style={{ position: 'absolute', zIndex: 0 }}>
          <div className="milo-idle-bob">
            <MiloFairy colorOverrides={equippedOutfit?.colorOverrides} />
          </div>
        </div>
      </div>

      {/* Bottom icon-menu */}
      <div className="flex justify-center gap-3 mt-4 px-4">
        {([
          { key: 'decor' as const, label: 'Decor', emoji: '🛋️' },
          { key: 'wardrobe' as const, label: 'Wardrobe', emoji: '🧥' },
          { key: 'pet' as const, label: 'Pet', emoji: '🐾' },
        ]).map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => (key === 'pet' ? setOpenShop('pet') : openShopSheet(key))}
            className="card-chunky"
            style={{ flex: 1, maxWidth: 110, padding: '12px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
          >
            <span style={{ fontSize: 20 }}>{emoji}</span>
            <span className="font-display" style={{ fontSize: 11, fontWeight: 700, color: 'var(--m-ink)' }}>{label}</span>
          </button>
        ))}
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
            const swatchColor = isWardrobe ? (item.colorOverrides.S ?? item.colorOverrides.W ?? '#e0568c') : item.color;
            return (
              <div key={item.id} className="card-chunky" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: swatchColor, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--m-ink)' }}>{item.name}</p>
                  {shopMode === 'shop' ? (
                    <p style={{ fontSize: 11, color: 'var(--m-slate)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CoinsIcon size={11} color="#e8a33f" /> {item.cost}
                    </p>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--m-slate)', marginTop: 2 }}>
                      {isWardrobe ? 'Outfit' : ROOM_SLOT_LABELS[item.slot]}
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
                    onClick={() => (equipped ? unequipSlot(isWardrobe ? 'outfit' : item.slot) : equipItem(item.id))}
                    className="font-display"
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                      background: equipped ? '#DFF3EF' : 'var(--card)',
                      color: equipped ? 'var(--node-deep)' : 'var(--m-slate)',
                      border: `2px solid ${equipped ? 'var(--node-ring)' : 'var(--m-border)'}`,
                    }}
                  >
                    {equipped ? '✓ Equipped' : 'Equip'}
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
    </div>
  );
}
