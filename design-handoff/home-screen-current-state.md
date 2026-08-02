# Mile-ly — Home Screen "Adventure Path": Current State Handoff (v2)

**Purpose of this doc:** describe exactly what's implemented today on Mile-ly's Home screen, so design work can build on the real current state. This supersedes the v1 handoff — a round of Claude Design's spec (`Mile-ly Home Current State.dc.html` + its README) has since been executed. A fresh screenshot is attached (`current-home-screen-v2.png`).

**App context:** Mile-ly is a personal finance / credit-card / miles-tracking web app (Next.js + Supabase), used mobile-first (~390px viewport) at mile-ly.vercel.app.

---

## 1. Screen structure, top to bottom

1. **Ambient background** — sits behind literally everything on the screen (see §5). Purely decorative, `pointer-events: none`.

2. **Stat strip** — flex row, `space-between`, `padding: 14px 24px 4px`. Four items, each a 26×26 rounded-square chip (radius 9) tinted `color-mix(in srgb, <stat color> 13%, transparent)`, holding a real icon (15px) + a `Baloo 2` 800 16px number, no labels:
   - **Income** this cycle — coins icon, tinted `var(--node-deep)` (follows the teal/coral budget-status hue)
   - **Left to spend** this cycle — wallet icon, `#e8a33f` amber — same value as the banner headline, kept in sync
   - **% saved** this cycle — piggy-bank icon, `#b689ec` lilac
   - **Days left** in the cycle — calendar icon, `#b8b2a8` gray — shows `—` when viewing a non-current cycle
   
   All four numbers count up on load/change via `useCountUp` (700ms ease-out-cubic).

3. **Quest banner** — the hero. `border-radius: 20px`, gradient `linear-gradient(135deg, ring 0%, deep 100%)`, `box-shadow: inset 0 -6px 0 rgba(0,0,0,.18), 0 8px 20px -8px <shadow>`. Contents:
   - A faint decorative dashed-route + arrow doodle, bottom-right, 14% opacity (pure decoration).
   - Top-right: a round pencil/edit icon button (30×30, `rgba(255,255,255,.22)` bg) — opens **Trail Notes** inline below the banner. Shows a small gold dot badge when a note exists.
   - Eyebrow row: `Week N of this cycle` + a 4-dot week-progress indicator (filled dots = weeks elapsed, capped at 4) — only shown when viewing the *current* cycle. Falls back to plain `This cycle` (no dots) for past/future cycles.
   - `MonthPicker` — `‹ August 2026 ›` cycle navigation, styled as small translucent-white circular chevrons.
   - Hero line: **`{amount} left to spend`**, `Baloo 2` 800 25px white, count-up animated (`income − expenses`, floored at 0).

4. **Trail Notes editor** (conditional, only while open) — `card-chunky` panel, textarea + Save/✕. Freeform per-cycle text in `localStorage`, unchanged data model from the old "Remarks" feature.

5. **Empty state** — only when zero income, zero expenses, *and* zero cards. Milo (static, no swim here) + "Nothing here yet."

6. **The path** — the main card. Structural details in §2–4 below.

7. **Compact fallback** (only when total nodes would exceed 5) — a slim "Cards" row + a restyled "Spending by category" list with per-category progress bars. Milo does **not** appear in this fallback mode.

8. Three modals (Add Card, Your Cards list, Edit Card) — unchanged from before the redesign, just restyled.

---

## 2. The path card

- Container: `border-radius: 22px`, `border: 2px solid #e8e5dd`, `box-shadow: 0 3px 0 #e0dcd2`, `overflow: hidden`.
- **Background**: a soft hue-tinted gradient — `linear-gradient(180deg, color-mix(in srgb, var(--node-ring) 4%, var(--card)), color-mix(in srgb, var(--node-ring) 9%, var(--card)))` — automatically re-tints with the teal/coral budget-status hue. No hardcoded hex pairs needed for the two states.
- A lighter `AmbientScene variant="card"` instance sits behind the node content (see §5) — smaller glows, denser dot-grid, no sun/clouds.
- Title: "YOUR PATH THIS CYCLE" — `Baloo 2` 700 10px tracked uppercase.

### Path nodes
- 68px circle (`ringSize = 88px` including the progress-ring gutter), `linear-gradient(180deg, ring, deep)`, glossy top-third sheen via `::before`, rim shadow `inset 0 -7px 0 rgba(0,0,0,.18)`, soft blurred contact-shadow ellipse beneath each node.
- **Real icons** (not letters, not placeholder squares) — cycles through card / piggy-bank / coins / layers / target, indexed by the node's position (Cards is always the card icon).
- **Double-stroke progress ring** on every node *except* Cards: a faint always-visible track (`opacity .18`) + a colored arc (`opacity .85`) showing that category's share of total expenses this cycle, capped at ~90% arc so there's always a visible gap.
- **Check badge**: white circular checkmark, bottom-right — only on the Cards node, only once `cards.length > 0`. Pops in once, first time it appears.
- **"You are here" pill**: tinted background (`color-mix(in srgb, var(--node-ring) 16%, white)`) + 1.5px ring-colored border, `Baloo 2` 700 9.5px tracked uppercase — attached to whichever node touches the user's most-recently-*created* entry this cycle (`createdAt`, not transaction `date` — those tie constantly). Bounces in on first appearance.
- **Colors**: each node gets a distinct color from a 6-entry palette (teal/coral/blue/gold/lilac/pink), assigned by **position** in the path (Cards = index 0, then each category node increments) — not a hash of the category name. This means a category's color can shift if its spend ranking changes relative to others; accepted trade-off, not a bug.
- **Label**: `Baloo 2` 700 13px `"{Name} · {amount}"` (amount in `var(--m-slate)`), single-line with ellipsis truncation at 130px wide — long category names can truncate (e.g. "Sinking fund · S$400...").
- Dynamic count: one node per expense category with spend this cycle, plus the always-present Cards node. Capped at **5 total** (`MAX_PATH_NODES`); beyond that, path is replaced entirely by the compact fallback list.
- Positions (`src/lib/pathLayout.ts`): first node centered, then alternating 75%/25% of card width, **74px vertical spacing** (tightened from an earlier 116px per the latest spec — compact by design, don't widen).
- Connector: a single **smooth cubic-bezier path** through all node centers (not straight segments) — `stroke-dasharray: 1 5`, `var(--m-border)`, fades in on mount (replays only if node *count* changes, not on reorder).
- Node position changes on reorder animate via `left`/`top` transition (0.5s); color reassignment animates via the typed `--node-deep`/`--node-ring`/`--node-shadow` custom properties (0.4s).

### Milo (inside the path card)
- **Swims again** — this reverses an earlier "static peek" decision, per the latest design spec. Translate-only motion between 3 waypoints (no `scaleX` mirror flip), driven by CSS custom properties `--sx1/--sy1/--sx2/--sy2/--sx3/--sy3` set inline, `16s ease-in-out infinite`, plus an independent small idle bob.
- **Reserved lane**: Milo is positioned in a dedicated zone *below all path nodes* (`miloTop = lastNodeY + 110`), with his own small vertical swim range bounded to that lane. This was a real bug fix — his old bottom-anchored-to-total-height position could land directly on top of the last node's "You are here" pill when the path was short (1–2 nodes). The path card's total height (`pathHeight`) now always includes this reserved `MILO_ZONE` (90px) so he never needs to intrude on node space.
- Carries a small pill showing the current cycle's month abbreviation (e.g. "AUG") — real data, not the mockup's hardcoded "JUL".
- Mood (happy/sad face, from the existing `MiloMascot` component) reflects whether the user is in the red this cycle.
- Not shown in the compact-fallback-list mode (no path = nowhere natural for him to swim).

---

## 3. Design tokens (`src/app/globals.css`)

**Fonts:** `Baloo 2` (500–800, `next/font/google`) via `.font-display` utility, for display/numbers. `Nunito` (600–800) for body text.

**Budget-status hue** (banner, active nav tab, path-card background tint, compact-list fallback — *not* individual node colors, see §2):
```
teal (on track): deep #129C8C · ring #3CC4B0 · shadow rgba(18,156,140,.3)
coral (over):    deep #E8734F · ring #FF9A70 · shadow rgba(232,115,79,.35)
```
`--node-deep` / `--node-ring` / `--node-shadow` are registered via `@property` as `<color>`, so transitioning them (teal↔coral swap) actually interpolates rather than snapping (~0.4s).

**Node palette** (`src/lib/nodeColors.ts`) — 6 entries, assigned by node position: teal `#129C8C`, coral `#E8734F`, blue `#2E6FAE`, gold `#B0862B`, lilac `#7C5CB0`, pink `#C24D72` (each with a matching lighter `ring` and `shadow`).

**Locked/empty node fill:** gradient `#EFEDE8 → #D5D1C8` (dark: `#333331 → #232321`), text `#B3AEA5`.

**Ambient scene tokens**: no new hardcoded colors — glows/dots/twinkles all derive from `var(--node-ring)` via `color-mix()`, so they automatically re-tint with the budget-status hue.

**Chunky card** (`.card-chunky`, pre-existing): still used for Trail Notes, empty state, compact fallback — flat offset shadow, no gradient. Coexists by design with the "candy" gradient language used by the path/banner/nav.

---

## 4. Real icon set (`src/components/decor/icons.tsx`)

Hand-rolled inline SVG, `strokeWidth 2.2`, round caps — matching the app's existing icon convention (no icon library). Exports: `CardIcon`, `PiggyIcon`, `CoinsIcon`, `LayersIcon`, `TargetIcon`, `CalendarIcon`, `WalletIcon`, `PlaneIcon`, plus `nodeIconFor(index)` which cycles the first five by node position. The bottom nav's Miles tab now uses a plane icon (previously a car/bus shape — plane is more semantically correct for a frequent-flyer feature).

---

## 5. Ambient background (`src/components/decor/AmbientScene.tsx`)

Purely decorative, `position: absolute; inset: 0; pointer-events: none`, sits behind real content via DOM order (no z-index gymnastics needed — it's the first child of its `position: relative` container).

Two variants:
- **`page`** — full treatment: 2 pulsing hue-tinted glow blobs, a drifting dot-grid, a bobbing sun, 2 drifting cloud SVGs, 2 twinkling sparkle dots. Sits behind the entire screen.
- **`card`** — lighter: just the glow blobs (smaller) + a denser dot-grid. Sits behind the path card's content so the ambience "reads through" without competing with node content.

All colors derive from `var(--node-ring)` via `color-mix()` — no separate light/dark or teal/coral color sets to maintain. `meadow` background mode from the original spec was **not** implemented (no UI exposes a background-mode toggle in the real app; `sky` is the only mode, hardcoded) — flag if that's wanted later.

All animations respect `prefers-reduced-motion: reduce`.

---

## 6. Bottom nav (`src/components/layout/BottomNav.tsx`)

Floating glass pill (mobile) / sidebar (desktop ≥768px). Four tabs (Home, Transactions, Miles, More) + a separate center "+" button. Inactive tab icons: fixed distinct colors (blue `#5fb2f2`, coral `#f4845f`, lilac `#b689ec`, gold `#f0b429`). Active tab + "+" get the candy-gradient treatment in the current budget-status hue. Miles tab icon updated to a plane (§4).

Glass pill background is intentionally near-invisible (`rgba(255,255,255,.02)` light / `rgba(28,28,30,.02)` dark, `blur(14px) saturate(1.4)`) — tuned through many rounds of feedback; don't casually increase opacity.

---

## 7. Known trade-offs / open items

- Node label truncation on longer category names (§2) — acceptable given the compact 74px/130px-wide spec, but worth knowing if a design pass wants to address it.
- Milo's swim waypoints use a fixed `spanX = 190px` (not measured from actual card width) — reasonable across typical mobile widths but not pixel-exact per device.
- `meadow` ambient background mode exists in code structure but isn't wired to any UI toggle (§5).
- Every other screen (Transactions, Miles, More/Settings/Changelog/Feedback, Add Entry sheet) still uses the **older** "chunky flat-shadow" visual language — not migrated to candy/Baloo2/ambient-scene yet.

---

## 8. Files touched by this round

- `src/screens/DashboardScreen.tsx` — layout, banner, stat strip, path composition
- `src/components/dashboard/PathNode.tsx` — double ring, pill subLabel
- `src/components/decor/AmbientScene.tsx` — new
- `src/components/decor/icons.tsx` — new
- `src/components/decor/MiloMascot.tsx` — unchanged internally; now wrapped with `.milo-swim-path` + `.milo-idle-bob` when used in the path
- `src/lib/pathLayout.ts` — spacing/amplitude constants
- `src/lib/nodeColors.ts` — unchanged from v1
- `src/components/layout/BottomNav.tsx` — Miles icon
- `src/app/globals.css` — ambient keyframes, milo-swim-path keyframe
