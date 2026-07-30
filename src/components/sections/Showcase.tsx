"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "motion/react";
import {
  Section,
  SectionHeading,
  Reveal,
  Icon,
  type IconName,
} from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Shot = {
  key: string;
  label: string;
  icon: IconName;
  src: string;
  title: string;
  body: string;
  points: string[];
};

const SHOTS: Shot[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: "grid",
    src: "/screens/dashboard.png",
    title: "The morning read",
    body: "Revenue, expenses and profit for the month, plus everything demanding attention today.",
    points: [
      "Overdue invoices, low stock and pending leave surfaced together",
      "Financial health scored out of 100",
      "Flip the whole page between USD and LBP",
    ],
  },
  {
    key: "pos",
    label: "Point of Sale",
    icon: "cart",
    src: "/screens/pos.png",
    title: "A register wired to the ledger",
    body: "Checkout decrements stock, writes the invoice and captures the cash in one transaction.",
    points: [
      "Shift sessions open with a float and close with a count",
      "Shelf prices are tax-inclusive; VAT is extracted",
      "Refunds void the invoice and restock the item",
    ],
  },
  {
    key: "accounting",
    label: "Accounting",
    icon: "book",
    src: "/screens/accounting.png",
    title: "A ledger that ties out",
    body: "A seeded chart of accounts from 1000 to 6900, with entries posted automatically from business events.",
    points: [
      "Trial balance, income statement, balance sheet, general ledger",
      "Corrections post a reversing entry — nothing is deleted",
      "Year-end close moves the result to retained earnings",
    ],
  },
  {
    key: "inventory",
    label: "Inventory",
    icon: "package",
    src: "/screens/inventory.png",
    title: "Know what it actually cost",
    body: "Weighted average, FIFO or LIFO, applied to every stock-out across POS, projects and production.",
    points: [
      "Lot tracking with expiry and first-expired-first-out draw",
      "Owner-defined variant axes fan a product into SKUs",
      "Full forward and backward traceability per lot",
    ],
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    icon: "factory",
    src: "/screens/manufacturing.png",
    title: "Recipes, runs and real cost",
    body: "Versioned bills of materials with scrap allowance, sub-assemblies and per-hour resource costing.",
    points: [
      "Overhead priced from actual production hours",
      "QC quarantine holds output until inspected",
      "Standard-versus-actual variance on every order",
    ],
  },
  {
    key: "reports",
    label: "Reports",
    icon: "chart",
    src: "/screens/reports.png",
    title: "Answers, not exports of exports",
    body: "Seven reports covering money, projects, clients and pipeline — each date-filtered and exportable.",
    points: [
      "VAT output versus input with a per-rate breakdown",
      "Invoice aging in 30-day buckets with at-risk totals",
      "Project margin and weighted sales pipeline",
    ],
  },
];

export function Showcase() {
  const [active, setActive] = useState(SHOTS[0].key);
  const shot = SHOTS.find((s) => s.key === active) ?? SHOTS[0];

  /* The screen drifts and tilts a little as it crosses the viewport, so the
     centrepiece of this section is never a still photograph on a still page. */
  const frameRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const frameY = useTransform(scrollYProgress, [0, 1], [46, -46]);

  return (
    <Section id="showcase" tone="bone">
      <SectionHeading
        align="split"
        eyebrow="Inside the product"
        title={
          <>
            Not a mockup.
            <br />
            <span className="font-serif italic text-plum-600">The actual screens.</span>
          </>
        }
        lead="Every image is captured from a running instance. Pick a module and look around."
        aside={
          <span className="hidden items-center gap-2.5 rounded-full border border-plum-900/10 bg-white px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-plum-900/45 lg:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade-400" />
            Live product · not a render
          </span>
        }
      />

      {/* Rail narrowed, screen widened: the screenshot is the strongest trust
          signal on the page and should dominate its section. */}
      <div className="mt-10 grid gap-7 lg:grid-cols-[16rem_1fr] lg:items-start">
        {/* module rail — min-w-0 is load-bearing. A grid child defaults to
            min-width:auto, so on mobile the single column stretched to this
            rail's min-content width (all six buttons in a row, ~950px) and
            took the screenshot with it, rendering it far wider than the
            viewport and clipping it. */}
        <Reveal className="min-w-0 lg:sticky lg:top-28">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {SHOTS.map((s) => {
              const on = s.key === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  aria-current={on}
                  className={cn(
                    "group relative flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors duration-250 lg:w-full",
                    on
                      ? "border-plum-600/25 bg-white shadow-[0_14px_32px_-20px_rgba(42,29,41,0.4)]"
                      : "border-transparent hover:border-plum-900/8 hover:bg-white/60",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="showcase-rail"
                      className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-plum-600"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors",
                      on
                        ? "border-plum-600/15 bg-plum-100 text-plum-600"
                        : "border-plum-900/8 bg-white/70 text-plum-900/40 group-hover:text-plum-600",
                    )}
                  >
                    <Icon name={s.icon} className="h-[17px] w-[17px]" />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-[0.94rem] font-semibold tracking-[-0.012em] transition-colors lg:whitespace-normal",
                      on ? "text-plum-950" : "text-plum-900/55",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* screen + copy */}
        <Reveal delay={0.1} className="min-w-0">
          <motion.div
            ref={frameRef}
            style={
              reduced
                ? undefined
                : { y: frameY, willChange: "transform" }
            }
            className="overflow-hidden rounded-[26px] border border-plum-900/8 bg-white shadow-[0_2px_4px_rgba(42,29,41,0.04),0_48px_90px_-50px_rgba(42,29,41,0.55)] 2xl:-mr-16"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-obsidian-900">
              <AnimatePresence mode="sync">
                <motion.div
                  key={shot.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.015 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={shot.src}
                    alt={`Quilit ERP — ${shot.label}`}
                    fill
                    sizes="(max-width: 1024px) 92vw, 860px"
                    className="object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="screen-glare pointer-events-none absolute inset-0" aria-hidden />
            </div>

            <div className="border-t border-plum-900/6 bg-bone-50 p-6 sm:p-8 lg:p-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={shot.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <h3 className="font-display text-[1.5rem] font-bold tracking-[-0.026em] text-plum-950">
                    {shot.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-[1rem] leading-relaxed text-plum-900/58">
                    {shot.body}
                  </p>
                  <ul className="mt-7 grid gap-3 sm:grid-cols-3">
                    {shot.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex gap-2.5 text-[0.88rem] leading-relaxed text-plum-900/60"
                      >
                        <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] bg-plum-100 text-plum-600">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" aria-hidden>
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </Section>
  );
}
