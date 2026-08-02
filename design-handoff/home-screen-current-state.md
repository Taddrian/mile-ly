# Mile-ly — Home Screen "Adventure Path": Current State Handoff

**Purpose of this doc:** describe exactly what's implemented today on Mile-ly's Home screen, so design work can build on the real current state instead of the original mockup (which has since diverged in several deliberate ways). A screenshot of the current live screen is attached alongside this doc (`current-home-screen.png`).

**App context:** Mile-ly is a personal finance / credit-card / miles-tracking web app (Next.js + Supabase), used mobile-first (~390px viewport) at mile-ly.vercel.app. Home was recently redesigned from a traditional card-dashboard into a gamified "adventure path."

---

## 1. Screen structure, top to bottom

1. **Stat strip** — flex row, `space-between`, `padding: 14px 24px 4px`. Four items, each an outline-square icon (16×16, `rx=4`, `strokeWidth=2.2`) + a number, no labels, `Baloo 2` 800 16px:
   - **Income** this cycle (icon tinted `var(--node-deep)`, i.e. it follows the teal/coral budget-status hue)
   - **Left to spend** this cycle (icon `#e8a33f` amber) — same value as the banner headline below, kept in sync
   - **% saved** this cycle (icon `#b689ec` lilac)
   - **Days left** in the cycle (icon `#b8b2a8` gray) — shows `—` instead of a number when viewing a non-current cycle (days-left isn't meaningful there)
   
   All four numbers count up on load/change via a shared `useCountUp` hook (700ms ease-out-cubic).

2. **Quest banner** — the hero. `border-radius: 20px`, gradient background `linear-gradient(135deg, ring 0%, deep 100%)`, `box-shadow: inset 0 -6px 0 rgba(0,0,0,.18), 0 8px 20px -8px <shadow>`. Contents:
   - Top-right corner: a small round icon button (30×30, `rgba(255,255,255,.22)` bg) — this is **Trail Notes** (see §3). Shows a small gold dot badge when a note exists.
   - Eyebrow line: `Week N of this cycle` (real week number, computed from the cycle's start day — only shown when viewing the *current* cycle) or `This cycle` (fallback for past/future cycles).
   - Below the eyebrow: `MonthPicker` — a `‹ August 2026 ›` cycle-navigation control, restyled as small translucent-white circular chevron buttons around the label.
   - Hero line: **`{amount} left to spend`**, `Baloo 2` 800 25px white, the count-up-animated `saved` value (`income − expenses`, floored at 0).

3. **Trail Notes editor** (conditionally rendered, only while open) — a `card-chunky` panel with a textarea, Save/✕ buttons. Same underlying data as the old "Remarks" feature: freeform per-cycle text, persisted to `localStorage` (not the backend), keyed per cycle.

4. **Empty state** — only shown when there's zero income, zero expenses, *and* zero cards. Milo + "Nothing here yet."

5. **The path** — a `card-chunky` card titled "YOUR PATH THIS CYCLE", containing:
   - A dashed SVG connector line (`stroke-dasharray: 1 5`, `var(--m-border)` gray) linking node centers in sequence, fading in on mount.
   - A **"Cards" node** — always first/leads the path. Shows the sum of all cards' current spend. Gets a white checkmark badge once the user has ≥1 card. Tapping it opens the "Your Cards" modal (list + add/edit).
   - **One node per expense category** that has spend this cycle, sorted by amount descending. Each shows `{category name} · {amount}`.
   - Nodes are dynamically laid out in a zig-zag (see §4) — capped at 5 total nodes (Cards + 4 categories). Beyond that, the path is replaced by a simpler restyled list (see §6).
   - Exactly one node (whichever was touched by the user's most-recently-*created* entry — not most recent transaction date) gets a small **"You are here"** caption underneath.
   - Each node has an optional progress ring (category's share of total expenses this cycle, capped visually at ~90% arc).

6. **Milo** — the mascot, now a small static "peek" (idle bob, no swimming), sitting centered just below the path, next to a small pill showing the current cycle's month abbreviation (e.g. "AUG"). Mood (happy/sad face) reflects whether the user is in the red this cycle.

7. **Compact fallback** (only when >5 total nodes would be needed) — a slim "Cards" row + a restyled "Spending by category" list with per-category progress bars, replacing the path entirely for that render.

8. Three modals (Add Card, Your Cards list, Edit Card) — functionally unchanged from before the redesign, just restyled.

---

## 2. Design tokens (`src/app/globals.css`)

**Fonts:** `Baloo 2` (weights 500–800, via `next/font/google`) for display/numbers — applied via `.font-display` utility class. `Nunito` (600–800) for body text.

**Budget-status hue** (drives banner, active nav tab, compact-list fallback — *not* individual path nodes, see §5):
```
teal (on track): deep #129C8C · ring #3CC4B0 · shadow rgba(18,156,140,.3)
coral (over):    deep #E8734F · ring #FF9A70 · shadow rgba(232,115,79,.35)
```
Implemented as CSS custom properties `--node-deep` / `--node-ring` / `--node-shadow`, registered via `@property` as `<color>` so they're transition-animatable (teal↔coral swap smoothly interpolates, ~0.4s, rather than snapping).

**Locked/empty node fill:** gradient `#EFEDE8 → #D5D1C8` (dark mode: `#333331 → #232321`), text `#B3AEA5`.

**Candy node treatment** (`.node-candy`): `linear-gradient(180deg, ring, deep)` circle, glossy top-third sheen via `::before` (white→transparent ellipse), rim shadow `inset 0 -7px 0 rgba(0,0,0,.18)` + soft drop shadow.

**Chunky card** (`.card-chunky`, pre-existing, still used for panels): white/dark card, `2px` border, flat offset shadow `0 3px 0 <border-dark>` (no blur — Duolingo-style, not the candy gradient style).

Both visual languages ("candy" for path nodes/banner/nav, "chunky flat-shadow" for containers/panels) currently coexist on this screen by design.

---

## 3. What's real data vs. deliberately not built

Everything currently shown is backed by real user data. Two elements from the original mockup were **deliberately omitted** and should stay that way unless a real feature is scoped for them:
- A "savings goal" vignette (luggage icon + star rating, e.g. "1 of 3 goals hit") — no goals feature exists in the data model.
- A fixed miles-redemption milestone pill (e.g. "45K = Taipei ✈") — the app has a full real redemption browser elsewhere (Miles tab), but no single "next milestone" concept to surface here without fabricating a number.

If new visual concepts need a "reward" or "goal" slot, they should be scoped as real features (what data backs it, where it's configured) rather than restyled as decoration.

---

## 4. Dynamic node layout (`src/lib/pathLayout.ts`)

Nodes are **not** at fixed pixel positions — the count varies with however many expense categories the user actually has spend in this cycle (1 to N). `layoutPathNodes(n)` returns `{ xPct, y }` pairs:
- First node centered (`xPct: 50`)
- Then alternating left/right (`50 ± 30%`)
- `y` increases by 116px per node

Capped at **5 total nodes** (`MAX_PATH_NODES`); beyond that, falls back to a plain list (§6 above). This threshold, and the zig-zag amplitude/spacing, are the two numbers most likely worth design iteration if the path ever feels cramped or too sparse.

## 5. Path node colors (`src/lib/nodeColors.ts`)

Each node gets a **distinct** color assigned by its **position** in the path (not a hash of its name) — a 6-color palette (teal, coral, blue, gold, lilac, pink) cycling in order: Cards is always color 0, then each category node increments. This was a deliberate change from an earlier version where every node shared the single budget-status hue (looked "boring" with >1 node) and from a label-hash approach (risked two nodes coincidentally landing on the same color).

Trade-off to know about: because color is positional, a category's color can shift if its spend ranking changes relative to others (nodes re-sort by amount each render). This is intentional/accepted, not a bug.

## 6. Compact fallback list

When node count would exceed 5, the path section doesn't render at all. Instead: a slim "Cards" row (candy-circle icon + name + total) followed by a `card-chunky` "Spending by category" panel — `CategoryChip` avatars (colored by name-hash, existing component) + a thin progress bar per category, tinted with the same budget-status hue.

## 7. Animation inventory (all respect `prefers-reduced-motion`)

- Path node entrance: spring/overshoot scale-in, staggered ~90ms per node
- Connector line: fade-in on mount (only replays if node *count* changes, not on reorder)
- Node position changes (reorder due to ranking shift): `left`/`top` transition, 0.5s
- Node hue changes (color reassignment on reorder): 0.4s color transition via the typed custom properties
- "You are here" caption: bounce-in whenever it lands on a (possibly new) node
- Cards node checkmark: pop-in, plays once ever (first card added)
- Banner/stat-strip numbers: count-up on load/change
- Budget-status hue flips (teal↔coral): smooth color transition across banner + nav + fallback list simultaneously
- Milo: idle bob only (no horizontal swim — this was explicitly changed back from an earlier swimming version)

**Known rough edge:** if several nodes reorder in the same update (e.g. one category jumps past two others), the ones swapping sides can briefly visually overlap mid-transition before settling. Not fixed yet — worth a look if it reads as glitchy in practice.

## 8. Bottom nav (`src/components/layout/BottomNav.tsx`)

Floating glass pill (mobile) / sidebar (desktop ≥768px). Four tabs (Home, Transactions, Miles, More) + a separate center "+" add-entry button (not a 5th tab). Inactive tab icons each get a **fixed distinct color** (blue `#5fb2f2`, coral `#f4845f`, lilac `#b689ec`, gold `#f0b429`) instead of uniform gray. The **active** tab (and the "+" button) get the candy-gradient treatment in the current budget-status hue.

Glass pill background is intentionally near-invisible (`rgba(255,255,255,.02)` light / `rgba(28,28,30,.02)` dark, `blur(14px) saturate(1.4)`) — this was tuned through many rounds of "more transparent" feedback earlier in the project; don't casually increase its opacity.

## 9. Explicitly out of scope for this doc

Every other screen (Transactions, Miles, More/Settings/Changelog/Feedback, the Add Entry sheet) still uses the **older** "chunky flat-shadow" visual language and has **not** been migrated to the candy/Baloo2 system yet — that's planned as a later phase, not started. Don't assume consistency with Home exists elsewhere yet.
