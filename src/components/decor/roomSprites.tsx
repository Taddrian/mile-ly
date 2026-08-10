// Milo's Room — isometric scene + furniture, ported from the Claude Design
// handoff (design-handoff/Milos Room Scene.dc.html) essentially verbatim:
// true 2:1 isometric projection built from flat SVG polygons (no CSS 3D, no
// images). Furniture lives in shared <symbol>s with color regions exposed as
// CSS custom properties (`var(--x, starterHex)`), so shop variants in
// roomCatalog.ts are pure var swaps on the <use> that references them, never
// new geometry. Milo himself is intentionally NOT ported here — the design
// file's sym-milo is an explicit stand-in; the app's real shipped
// box-shadow-pixel-grid <MiloFairy /> is layered on top in RoomScreen.tsx.

import { RoomSlot } from '@/lib/roomCatalog';

// Scene coordinate space every furniture placement is defined against.
export const SCENE_VIEWBOX = '0 0 300 346';
export const SCENE_WIDTH = 300;
export const SCENE_HEIGHT = 346;

// Fixed x/y/width/height offsets into the scene grid, straight from the
// handoff — move a piece by editing one offset here, geometry never changes.
export const FURNITURE_PLACEMENT: Record<RoomSlot, { x: number; y: number; width: number; height: number }> = {
  bed:   { x: 34,  y: 155, width: 120, height: 100 },
  rug:   { x: 70,  y: 194, width: 144, height: 72 },
  plant: { x: 210, y: 231, width: 52,  height: 77 },
};

const SLOT_VIEWBOX: Record<RoomSlot, string> = {
  bed: '0 0 120 100',
  rug: '0 0 144 72',
  plant: '0 -35 52 77',
};
const SLOT_ASPECT: Record<RoomSlot, number> = {
  bed: 120 / 100,
  rug: 144 / 72,
  plant: 52 / 77,
};

// Colors record (roomCatalog.ts) → CSS custom properties consumed by the
// <symbol>'s `var(--x, fallback)` fills. Keys are already the exact suffix
// (e.g. `f1` → `--f1`, `show-round` → `--show-round`).
export function furnitureVars(colors: Record<string, string>): React.CSSProperties {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(colors)) out[`--${k}`] = v;
  return out as React.CSSProperties;
}

// One-off small preview render (shop tiles / "My Items" rows) — an isolated
// mini SVG, not positioned in the room scene's own coordinate space.
export default function FurnitureSprite({ slot, colors, size = 72 }: { slot: RoomSlot; colors: Record<string, string>; size?: number }) {
  const height = size / SLOT_ASPECT[slot];
  return (
    <svg viewBox={SLOT_VIEWBOX[slot]} width={size} height={height} style={furnitureVars(colors)}>
      <use href={`#sym-${slot}`} width="100%" height="100%" />
    </svg>
  );
}

// Shared <symbol> defs — rendered once per page (RoomScreen mounts this).
// Zero visible footprint (0×0, position:absolute) on its own; every visual
// piece is drawn via <use> elsewhere (FurnitureSprite, or directly in the
// room scene for in-place furniture + the static background below).
export function RoomSymbolDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <symbol id="sym-bed" viewBox="0 0 120 100">
        <polygon points="0,73 68,39 116,63 48,97" fill="var(--f3,#7d5335)" />
        <polygon points="0,73 68,39 68,27 0,61" fill="var(--f1,#8a5a3b)" />
        <polygon points="68,39 116,63 116,51 68,27" fill="var(--f2,#9a6b45)" />
        <polygon points="68,27 0,61 48,85 116,51" fill="var(--f1,#8a5a3b)" />
        <polygon points="0,41 48,65 48,85 0,61" fill="var(--b2,#c9b491)" />
        <polygon points="48,65 116,31 116,51 48,85" fill="var(--b2,#c9b491)" />
        <polygon points="68,7 0,41 48,65 116,31" fill="var(--b1,#ddccae)" />
        <g fill="var(--b3,#c9b491)" opacity={0.7}>
          <rect x="20" y="52" width="3" height="3" />
          <rect x="55" y="40" width="3" height="3" />
          <rect x="85" y="46" width="3" height="3" />
        </g>
        <polygon points="54,16 98,38 98,30 54,8" fill="var(--psh,#d9cdb2)" />
        <polygon points="98,38 114,30 114,22 98,30" fill="var(--psh,#d9cdb2)" />
        <polygon points="70,0 54,8 98,30 114,22" fill="var(--p,#f6efe0)" />
      </symbol>

      <symbol id="sym-rug" viewBox="0 0 144 72">
        <polygon points="80,0 0,40 64,72 144,32" fill="var(--r2,#a2854f)" />
        <polygon points="80,8 16,40 64,64 128,32" fill="var(--r1,#e3d2a6)" />
        <polygon points="80,8 60,18 96,36 128,32 96,20" fill="var(--r3,#e3d2a6)" opacity={0.9} />
        <ellipse cx="72" cy="36" rx="38" ry="16" fill="var(--r1,#e3d2a6)" style={{ display: 'var(--show-round, none)' }} />
        <ellipse cx="72" cy="36" rx="38" ry="16" fill="none" stroke="var(--r2,#a2854f)" strokeWidth={6} style={{ display: 'var(--show-round, none)' }} />
      </symbol>

      <symbol id="sym-plant" viewBox="0 -35 52 77">
        <polygon points="0,28 24,16 52,30 28,42" fill="var(--pot2,#a95740)" />
        <polygon points="0,28 24,16 24,0 0,12" fill="var(--pot,#c96f52)" />
        <polygon points="24,16 52,30 52,14 24,0" fill="var(--pot,#c96f52)" />
        <g style={{ display: 'var(--pl-plant, inline)', animation: 'room-leaf-sway 3.4s ease-in-out infinite', transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
          <ellipse cx="26" cy="-2" rx="14" ry="9" fill="var(--l1,#7ba86a)" />
          <ellipse cx="14" cy="4" rx="8" ry="6" fill="var(--l1,#7ba86a)" />
          <ellipse cx="38" cy="5" rx="8" ry="6" fill="var(--l1,#7ba86a)" />
          <ellipse cx="26" cy="0" rx="5" ry="4" fill="var(--l2,#5d8a4f)" />
        </g>
        <g style={{ display: 'var(--pl-fern, none)', animation: 'room-leaf-sway 3s ease-in-out infinite 0.4s', transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
          <path d="M26 12 L26 -20" stroke="var(--l2,#4c7d49)" strokeWidth={2} fill="none" />
          <path d="M26 12 L10 -6" stroke="var(--l2,#4c7d49)" strokeWidth={2} fill="none" />
          <path d="M26 8 L42 -8" stroke="var(--l2,#4c7d49)" strokeWidth={2} fill="none" />
          <path d="M26 4 L4 6" stroke="var(--l2,#4c7d49)" strokeWidth={2} fill="none" />
          <path d="M26 0 L48 4" stroke="var(--l2,#4c7d49)" strokeWidth={2} fill="none" />
          <g fill="var(--l1,#6a9e63)">
            <circle cx="26" cy="-20" r="5" /><circle cx="10" cy="-6" r="5" /><circle cx="42" cy="-8" r="5" /><circle cx="4" cy="6" r="5" /><circle cx="48" cy="4" r="5" />
          </g>
        </g>
        <g style={{ display: 'var(--pl-cactus, none)' }}>
          <rect x="21" y="-24" width="10" height="34" rx="4" fill="var(--l1,#6f9e5e)" />
          <rect x="24" y="-24" width="2" height="34" fill="var(--l2,#55814a)" opacity={0.6} />
          <rect x="7" y="-10" width="9" height="20" rx="4" fill="var(--l1,#6f9e5e)" />
          <rect x="34" y="-14" width="8" height="22" rx="4" fill="var(--l1,#6f9e5e)" />
          <circle cx="26" cy="-27" r="4" fill="var(--fl,#ef8a7a)" />
        </g>
      </symbol>

      {/* Static background — walls, floor, window, shelf, clock, garland,
          light pool, shadow. No <use>/furniture baked in (unlike the source
          file) so RoomScreen can layer live, recolorable furniture on top at
          the exact FURNITURE_PLACEMENT offsets instead. */}
      <symbol id="sym-scene-bg" viewBox={SCENE_VIEWBOX}>
        <polygon points="30,226 150,166 150,26 30,86" fill="#e7d3ac" />
        <polygon points="150,166 270,226 270,86 150,26" fill="#dcc294" />
        <polygon points="150,166 30,226 30,205 150,145" fill="#b3824e" />
        <polygon points="150,166 270,226 270,205 150,145" fill="#a97949" />
        <polygon points="30,226 150,166 270,226 150,286" fill="#c99a6a" />
        <g stroke="#a97e4f" strokeWidth={1.5} opacity={0.6}>
          <line x1="110" y1="186" x2="230" y2="246" />
          <line x1="70" y1="206" x2="190" y2="266" />
          <line x1="190" y1="186" x2="70" y2="246" />
          <line x1="230" y1="206" x2="110" y2="266" />
        </g>
        <g fill="#e7d3ac"><rect x="48" y="72" width="12" height="10" /><rect x="138" y="27" width="12" height="10" /></g>
        <g fill="#c9a674" opacity={0.55}>
          <line x1="66" y1="76" x2="126" y2="46" />
          <line x1="96" y1="96" x2="156" y2="66" />
          <line x1="174" y1="46" x2="234" y2="76" />
          <line x1="144" y1="66" x2="204" y2="96" />
        </g>
        <g fill="#e5b04c">
          <rect x="46" y="75" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite' }} />
          <rect x="76" y="60" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite 0.4s' }} />
          <rect x="106" y="45" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite 0.8s' }} />
          <rect x="136" y="30" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite 1.2s' }} />
        </g>
        <g fill="#57b3a8">
          <rect x="166" y="33" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite 0.2s' }} />
          <rect x="196" y="48" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite 0.6s' }} />
          <rect x="226" y="63" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite 1s' }} />
          <rect x="256" y="72" width="4" height="4" style={{ animation: 'room-twinkle 2.2s ease-in-out infinite 1.4s' }} />
        </g>
        <polygon points="120,132 60,162 60,92 120,62" fill="#8a5a3b" />
        <polygon points="120,136 60,166 60,158 120,128" fill="#7d5335" />
        <polygon points="114,128 66,152 66,96 114,72" fill="#ffe9b4" />
        <polygon points="114,128 66,152 66,145 114,121" fill="#fff6d8" />
        <line x1="90" y1="140" x2="90" y2="84" stroke="#8a5a3b" strokeWidth={4} />
        <line x1="114" y1="100" x2="66" y2="124" stroke="#8a5a3b" strokeWidth={4} />
        <polygon points="186,107 252,140 252,130.2 186,97.2" fill="#8a5a3b" />
        <polygon points="186,107 252,140 252,135 186,102" fill="#6b4a30" />
        <g fill="#57b3a8"><polygon points="196,108 208,114 208,102 196,96" /></g>
        <g fill="#ef8a7a"><polygon points="210,116 220,121 220,111 210,106" /></g>
        <g fill="#e5b04c"><polygon points="222,122 234,128 234,116 222,110" /></g>
        <rect x="192" y="82" width="17" height="21" fill="#6b4a30" transform="skewY(27)" style={{ transformOrigin: '192px 82px' }} />
        <rect x="194" y="85" width="13" height="15" fill="#f7edd6" transform="skewY(27)" style={{ transformOrigin: '194px 85px' }} />
        <g transform="translate(216,80)">
          <rect x="-11" y="-11" width="22" height="22" rx="3" fill="#6b4a30" />
          <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#f7edd6" />
          <rect x="-1" y="-6" width="2" height="7" fill="#4a3328" style={{ animation: 'room-clock-tick 40s linear infinite', transformBox: 'fill-box', transformOrigin: '50% 100%' }} />
          <rect x="-1" y="-1" width="6" height="2" fill="#4a3328" style={{ animation: 'room-clock-tick 480s linear infinite', transformBox: 'fill-box', transformOrigin: '0% 50%' }} />
        </g>
        <g fill="#7a4b26" opacity={0.14}><polygon points="30,226 150,166 150,190 46,244" /><polygon points="150,286 214,250 214,262 150,298" /></g>
        <g fill="#ffdf9e" style={{ opacity: 0.3, animation: 'room-glow 3.6s ease-in-out infinite' }}><polygon points="66,152 30,226 90,226 114,128" /></g>
      </symbol>
    </svg>
  );
}
