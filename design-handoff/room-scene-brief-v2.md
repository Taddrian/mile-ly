# Handoff round 2: "Milo's Room" HUD + dock chrome

## Context — what changed since round 1
Round 1 delivered the room scene itself (`image.png`) — isometric wall, window, shelf, bed, rug, plant. **That's accepted as the base and doesn't need redesigning.** One note from that round: the sample used a placeholder flat sprite for Milo with a call-out to swap in the real shipped box-shadow sprite — noted, we'll port that ourselves on our end, not something you need to redo.

Since round 1, the plan changed: this room scene is no longer a separate tab — **it's becoming Mile-ly's main Home screen**, full-bleed edge-to-edge like the "Mini Cozy Room: Lo-Fi" reference (`IMG_6141`) — its own integrated top HUD sitting directly on the art, its own bottom icon dock, no outer card border around the scene. Round 2 is scoped to **just that chrome** — the HUD bar and the icon dock — not the room/furniture again.

## What to design

### 1. Top HUD — overlaid directly on the room art
Two rows, translucent/blurred pill or bar treatment (not a solid white header) so the room art shows through behind it:
- **Row 1** (existing data, same as round 1's ask): a Level badge + XP progress bar on one side, a Sparks currency counter (coin icon + number) on the other — same shape as the reference's `LV 7` badge / `✦ 240` pill.
- **Row 2** (new): a compact row of 3 small financial stats, each as an icon-in-a-tinted-circle + a number, sitting side by side — "amount saved this cycle," "% saved," and "days left in cycle." Think small icon-badge chips, like a slim stat strip, not full cards — should read as secondary to row 1, not competing with it.
- Both rows need to stay legible over a busy pixel-art background — dark text needs a light-enough backing (frosted-glass pill, soft drop shadow, or a subtle scrim gradient at the top of the scene) to not disappear against light wall colors.

### 2. Bottom icon dock — overlaid near the bottom of the scene
4 icons in a row, matching the reference's dock: **Decor · Wardrobe · Pet · Budget** (our "Budget" stands in for the reference's "Activity" slot — same position/shape, different label). Floating bar treatment: translucent/blurred background, rounded ends, subtle border or shadow so it separates from the art without a hard opaque box. We already have the icon glyphs and labels on our end — what we need from you is the **container/bar styling** for this dock so it visually matches the top HUD's material (same glass/blur language, not two different treatments).

## Hard constraints (same as round 1, restated since this is additive)
- **Portable to real code**: give us HTML/CSS (or SVG), not a static image — we're porting it directly into React components, same as everything else so far.
- **Mobile-first, ~390px wide**, sits on top of a scene that's now full-bleed/full-height rather than a bounded card.
- **Light + dark page background safe**: the HUD/dock materials need to hold up whether the room card itself sits on a light or dark app background around it (Mile-ly supports both) — avoid relying on browser-default colors.
- **Lightweight, inline-only** — no external image hosting, consistent with everything else in this feature.

## What "good" looks like
Compare against the reference's HUD: it reads as *part of the scene*, not a UI bar bolted on top of it — soft, semi-transparent, blends with the warm room palette rather than a stark white/gray system bar. The bottom dock should feel like the same object as the top HUD (same material/blur/border language), just positioned at the opposite edge.
