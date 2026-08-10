# Handoff round 3: "Budget" panel — finance-monitoring visual redesign

## Context
Mile-ly's Home tab is being replaced by "Milo's Room" (the cozy idle-game screen from rounds 1–2 — accepted, not changing). All of the app's real financial monitoring — income, saved amount, % saved, days left in the billing cycle, the "left to spend" headline, and a path of spend-by-category nodes (Cards, plus one node per active expense category) — still needs to live somewhere inside this same screen. It's tucked behind a "Budget" icon on the room's bottom dock, opening as its own panel/sheet.

Right now that panel is a straight port of the *old* dashboard's visual style — chunky candy cards, thick borders, flat pastel circles. **This round asks you to redesign that panel's look** so it feels like part of the same idle-game world as the room, instead of a leftover fintech-app dashboard bolted on behind it.

## Reference — what we're going for
Attached/described reference: a dark, starfield/dot-grid background; a top stat strip of small pill badges (icon + number, e.g. a coin icon + total income, a wallet icon + amount saved, a piggy-bank icon + % saved, a calendar icon + days left); below that a teal "quest banner" card showing "Week X of this cycle," a date-range picker with prev/next arrows, and a large "$X left to spend" headline, with a small edit/notes icon in the corner; below that, "Your path this cycle" — a set of glossy 3D sphere/orb nodes (radial-gradient shaded, like a glass marble), one per category (Cards, Credit Card, Savings, Loan, Sinking Fund, etc. — real category names, not fixed), each labeled with its name + amount, connected by soft dotted lines, with a small progress ring around whichever node currently has the most spend, a "✓" badge on the Cards node when the user has cards set up, a "YOU ARE HERE" pill next to whichever node most recently changed, and our mascot Milo (a small pixel-sprite fairy, hooded, ~35×18 pixel grid — keep as pixel-art, don't smooth him out) floating near the current node.

## What to design
1. **Stat strip** — 4 small icon+number pill badges in a row, dark/glass-friendly styling.
2. **Quest banner** — the "week indicator + date picker + left-to-spend headline" card, restyled to fit the new dark/cosmic palette instead of the current flat teal.
3. **Path nodes** — the glossy 3D orb treatment per node: a base sphere shape (single shape, swappable fill color per category so we can reuse one asset across any number of categories — categories are dynamic, not a fixed list), a subtle progress ring, a checkmark badge state, a "you are here" pill state, and the connecting dotted line between nodes.
4. **Background** — the dark starfield/dot-grid texture the whole panel sits on.
5. Milo (the mascot) stays exactly as he is today — a small pixel-art sprite — just needs a slot/position within this new layout where he can float near a node. Don't redesign him.

## Hard constraints
- **Portable to real code** — HTML/CSS (or SVG), not just a static image, same as every round so far.
- **Mobile-first, ~390px wide.** This is a scrollable panel inside a sheet/modal, not the full-bleed hero (that's the room scene, unaffected by this round).
- **Node count varies at runtime** — could be 2 nodes or 8+, one per active spending category plus a fixed "Cards" node. The orb + connector system needs to work as a repeatable pattern, not a fixed layout for a specific number of nodes.
- **Recolor-friendly** — one orb "shape," with an easy way to swap its base color per category (same principle as furniture/wardrobe recoloring in earlier rounds).
- Numbers/text shown in the mockup are illustrative — real data (amounts, category names, dates) will vary per user.
- Lightweight, inline-only, no external image hosting.

## What "good" looks like
The panel should feel like a "stats/quest log" screen inside the same idle game as the room — dark, a little cosmic/mystical, glossy — rather than reading as a separate finance-app dashboard the user has to leave the game world to visit. Functionally it's unchanged (same numbers, same behavior); this round is purely the reskin.
