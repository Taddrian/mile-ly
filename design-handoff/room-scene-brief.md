# Handoff: "Milo's Room" — cozy idle-game scene

## Context
Mile-ly is a personal finance app with a playful "adventure path" visual identity: candy-gradient circles, a pixel-sprite fairy mascot named Milo, and a teal/coral mood system. We've just added a new tab, "Milo's Room" — a cozy-room idle game where good budgeting habits earn a currency ("Sparks") spent on furniture/outfits for Milo's room. Reference aesthetic: a "Mini Cozy Room: Lo-Fi"-style game — warm, hand-drawn-feeling pixel art, a room with visible wall + floor + window + shelf, character lounging inside it.

The functional screen already exists and works (level/XP bar, coin balance, a shop, equip flow, Milo roaming around). **What we need designed is purely the visual scene** — the room itself and the furniture that goes in it — because our own attempt (hand-typed pixel grids, done blind with no visual tool) reads as too crude/sparse next to the reference.

## Milo, for style reference (already shipped, don't redesign — match its vibe)
Milo is a pixel-sprite fairy built from a box-shadow pixel grid: white hood, pink skin, two-tone blue wings. Rendered as a single element with hundreds of `box-shadow` entries, one per pixel — small (~35×18 pixel grid), chunky, a little naive/hand-drawn looking, not smooth or anti-aliased. Whatever technique you use for the room should feel like it belongs in the same world as Milo, not a different, more polished art style bolted on next to him.

## What to design
1. **The room scene itself**: a wall (upper portion) and floor (lower portion) with a clear boundary between them, plus fixed wall dressing — a window and at least one piece of wall art/shelf. Warm, cozy, cream/tan/wood tones. Should read as "a room," not a flat card with objects on it.
2. **Three furniture types**, each needing a "free starter" look plus 2 nicer paid variants (recolors or redesigns) for a shop:
   - **Bed** — starter: plain wood frame + neutral blanket. Paid: a teal-blanket version, a "cloud" white/pastel version.
   - **Rug** — starter: plain neutral. Paid: a pink striped version, a gold round version.
   - **Plant** — starter: plain small plant. Paid: a fern, a cactus.
3. Bonus if you have room for it: 2–3 wardrobe outfit variants for Milo himself (recolors of his existing hood/wings), shown as small shop-list icons.

## Hard constraints
- **Mobile-first, ~390px wide.** The room sits inside a card roughly 390px wide × ~450px tall (portrait, aspect-ratio ~4:4.6).
- **Needs to be portable to real code** — please give it to us as real HTML/CSS/SVG (not just a static image), so we can port it directly, the same way we ported your earlier Home-screen and Milo designs.
- **Needs light + dark mode.** The room card itself can stay a fixed warm palette (it doesn't have to flip teal/coral or invert to dark — that's an intentional choice, this screen deliberately stays cozy/neutral regardless of app theme), but please don't rely on any browser-default colors that would break against a dark page background around it.
- **Furniture needs to support simple recoloring** — for us to reuse one shape across 2–3 shop variants (like Milo's wardrobe recolors do), so we're not hand-building a full new sprite per color. If each furniture piece is built from a small number of distinct color regions (not gradients/photos), we can swap those.
- Whatever rendering technique you use (box-shadow pixel grid like Milo, inline SVG, layered divs — your call), it needs to be lightweight — no external image hosting/downloads, everything inline.

## What "good" looks like
Compare against the reference cozy-room screenshot: a real sense of depth (wall vs. floor, a window letting in light, something on the wall), furniture that's dense/arranged rather than a few objects scattered on empty space, and a warm, considered color palette — while still staying small, chunky, and a little naive like Milo, not slick/polished isometric game art.
