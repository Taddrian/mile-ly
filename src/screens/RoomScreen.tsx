'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCountUp } from '@/lib/useCountUp';
import { CoinsIcon } from '@/components/decor/icons';
import MiloFairy from '@/components/decor/MiloFairy';
import FurnitureSprite, { StaticSprite, WINDOW_SPRITE, WINDOW_COLORS, FRAME_SPRITE, FRAME_COLORS } from '@/components/decor/roomSprites';
import AmbientScene from '@/components/decor/AmbientScene';
import Modal from '@/components/ui/Modal';
import {
  FURNITURE_ITEMS, WARDROBE_ITEMS, ROOM_SLOT_LABELS,
  RoomSlot, findFurniture, findWardrobe,
} from '@/lib/roomCatalog';

type ShopKind = 'decor' | 'wardrobe' | 'pet' | null;

// Anchors for the 3 fixed Phase 1 slots, percentage-based against the whole
// diorama so they scale with it. Floor starts at WALL_HEIGHT_PCT — furniture
// sits just below that line, not scattered across the wall.
const WALL_HEIGHT_PCT = 56;
const SLOT_POSITIONS: Record<RoomSlot, React.CSSProperties> = {
  bed: { left: '6%', top: '60%' },
  plant: { right: '6%', top: '58%' },
  rug: { left: '50%', bottom: '6%', transform: 'translateX(-50%)' },
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
  // Free starter items are always available — they only ever show under "My
  // Items" (as the fallback you can switch back to), never in "Shop".
  const shopItems = catalog.filter((i) => i.cost > 0 && !ownedIds.has(i.id));
  const ownedItems = catalog.filter((i) => i.cost === 0 || ownedIds.has(i.id));

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

      {/* Room diorama — capped width + aspect-ratio (not a fixed height) so it
          reads as a room box on any viewport instead of stretching into a
          shallow strip on wide screens. Wall/floor are two distinct regions
          with a trim line between them, plus fixed wall dressing (window,
          picture frame) so it has depth instead of one flat gradient. */}
      <div className="px-4">
        <div
          style={{
            position: 'relative', maxWidth: 420, margin: '0 auto', aspectRatio: '4 / 4.6',
            borderRadius: 22, overflow: 'hidden', border: '2px solid #e8e0cf', boxShadow: '0 3px 0 #ddd2ba',
          }}
        >
          {/* Wall */}
          <div style={{ position: 'absolute', inset: 0, height: `${WALL_HEIGHT_PCT}%`, background: 'linear-gradient(180deg, #f2f0e2 0%, #e9e6d4 100%)' }} />
          {/* Floor */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: `${WALL_HEIGHT_PCT}%`, background: 'linear-gradient(180deg, #f3ead9 0%, #e8ddc8 100%)' }} />
          {/* Baseboard trim */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: `${WALL_HEIGHT_PCT}%`, height: 3, background: '#d4c7a8' }} />

          <AmbientScene variant="card" />

          {/* Fixed wall dressing */}
          <div style={{ position: 'absolute', top: '9%', right: '10%', zIndex: 1 }}>
            <StaticSprite sprite={WINDOW_SPRITE} colors={WINDOW_COLORS} pixel={3.4} />
          </div>
          <div style={{ position: 'absolute', top: '13%', left: '11%', zIndex: 1 }}>
            <StaticSprite sprite={FRAME_SPRITE} colors={FRAME_COLORS} pixel={3} />
          </div>

          {(Object.keys(SLOT_POSITIONS) as RoomSlot[]).map((slot) => {
            const itemId = roomSlots[slot];
            const item = itemId ? findFurniture(itemId) : undefined;
            return (
              <div key={slot} style={{ position: 'absolute', zIndex: 1, ...SLOT_POSITIONS[slot] }}>
                {item ? (
                  <button
                    onClick={() => openShopSheet('decor')}
                    aria-label={`${item.name} — tap to swap`}
                    style={{ borderRadius: 16, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.12))' }}
                  >
                    <FurnitureSprite slot={slot} colors={item.colors} />
                  </button>
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

          <div className="milo-roam" style={{ position: 'absolute', zIndex: 2 }}>
            <div className="milo-idle-bob">
              <MiloFairy colorOverrides={equippedOutfit?.colorOverrides} />
            </div>
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
            return (
              <div key={item.id} className="card-chunky" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'color-mix(in srgb, var(--m-border) 30%, white)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {isWardrobe ? (
                    <div style={{ transform: 'scale(0.55)' }}><MiloFairy colorOverrides={item.colorOverrides} /></div>
                  ) : (
                    <div style={{ transform: 'scale(0.68)' }}><FurnitureSprite slot={item.slot} colors={item.colors} size={40} /></div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--m-ink)' }}>{item.name}</p>
                  {shopMode === 'shop' ? (
                    <p style={{ fontSize: 11, color: 'var(--m-slate)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CoinsIcon size={11} color="#e8a33f" /> {item.cost}
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
    </div>
  );
}
