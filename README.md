# Quilit ERP — marketing site

The public-facing site for **Quilit ERP**: a business platform covering sales,
point of sale, inventory, manufacturing, double-entry accounting, HR and
payroll — deployed offline on your own hardware or hosted in the cloud, and
licensed per module.

This repository contains the **website only**. The ERP application itself is a
separate codebase.

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`) |
| Motion | Motion (Framer Motion) 12 |
| Fonts | Instrument Sans · Instrument Serif · JetBrains Mono |

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

---

## Brand

| Token | Value |
|---|---|
| Obsidian Plum (primary) | `#6C4D69` |
| Soft Off-White (secondary) | `#F9F7F4` |

Both ramps, the obsidian scale and every material (film grain, glass, tactile
buttons, monitor hardware) are defined in `src/app/globals.css`.

## Structure

```
src/
├── app/
│   ├── globals.css              design tokens + physical materials
│   ├── layout.tsx               fonts, metadata
│   └── page.tsx                 section composition
├── components/
│   ├── hero/CinematicHero.tsx   pinned scroll-driven hero
│   ├── layout/                  sticky nav, footer
│   ├── sections/                one file per page section
│   └── ui/primitives.tsx        Section, Reveal, Counter, Icon, Cta
└── lib/utils.ts
```

## Motion rules

The whole page animates on scroll. Two rules keep it at 100+fps, and both were
established by profiling rather than guesswork — breaking either one is
immediately visible:

1. **Transform and opacity only.** Never animate `width`, `height`,
   `border-radius`, `filter` or `background-position`. Each triggers layout or
   paint on every frame. Where a radius must change it is quantised to discrete
   steps; where a card must resize it is scaled, not re-laid-out.
2. **Promote anything that moves** with `will-change: transform`, especially
   large gradient washes and elements containing gradient-clipped text.

A CSS animation on `transform` outranks an inline style, so a decorative float
and a Framer transform must never share an element — put them on nested nodes.

`prefers-reduced-motion` is honoured throughout: the hero falls back to a static
composition and the carousel becomes a plain scrollable rail.

## Images

**Product screenshots** — `public/screens/` — captured from a running instance
against seeded demo data, at 1600×1000 @2x.

**Industry photography** — `public/industries/` — one file per industry key,
portrait 3:4, at least 900×1200. Which files exist is resolved server-side at
build time, so a missing photo costs no failed request and falls back to a plum
plate bearing the industry icon. New images are picked up on the next build.

---

© Quilit. All rights reserved.
