"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Section,
  SectionHeading,
  Reveal,
  Counter,
  Icon,
  type IconName,
} from "@/components/ui/primitives";

const PROBLEMS: {
  icon: IconName;
  before: string;
  after: string;
  detail: string;
  metric: { value: number; label: string };
}[] = [
  {
    icon: "file",
    before: "The same order typed four times",
    after: "Typed once, carried through",
    detail:
      "A quotation becomes an invoice, the invoice becomes a payment, the payment becomes a ledger entry. Each step inherits the last one's lines.",
    metric: { value: 0, label: "Re-entry points" },
  },
  {
    icon: "package",
    before: "Stock figures nobody trusts",
    after: "Every movement accounted for",
    detail:
      "Purchase, adjustment, deduction, return — each one logged against the item, with lot numbers and expiry where it matters.",
    metric: { value: 4, label: "Movement types" },
  },
  {
    icon: "book",
    before: "Books closed weeks after month end",
    after: "The ledger keeps itself",
    detail:
      "Payments, expenses, payroll, depreciation and purchases post their own journal entries. The trial balance ties out because it cannot do otherwise.",
    metric: { value: 5, label: "Auto-posted events" },
  },
  {
    icon: "shield",
    before: "Everyone can see everything",
    after: "Permission enforced at the API",
    detail:
      "Five actions across every module, per role, checked on the server. A module a customer never bought answers 403, not a hidden menu item.",
    metric: { value: 403, label: "On unlicensed access" },
  },
];

export function Solutions() {
  return (
    <Section id="solutions" tone="bone">
      <SectionHeading
        eyebrow="The problem with most systems"
        title={
          <>
            Software should remove work,
            <br />
            <span className="font-serif italic text-plum-600">not relocate it.</span>
          </>
        }
        lead="Four things quietly cost a growing business its afternoons. Quilit is built to close each of them."
      />

      <div className="mt-20 grid gap-5 lg:grid-cols-2">
        {PROBLEMS.map((p, i) => (
          <Reveal key={p.before} delay={(i % 2) * 0.08}>
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="group relative h-full overflow-hidden rounded-[22px] border border-plum-900/8 bg-white p-8 shadow-[0_1px_2px_rgba(42,29,41,0.04),0_14px_36px_-24px_rgba(42,29,41,0.22)] transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(42,29,41,0.05),0_28px_56px_-28px_rgba(42,29,41,0.32)]"
            >
              {/* plum edge that lights up on hover */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-plum-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />

              <div className="flex items-start justify-between gap-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-plum-900/8 bg-gradient-to-b from-plum-100 to-plum-50 text-plum-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                  <Icon name={p.icon} />
                </span>
                <div className="text-right">
                  <div className="font-mono text-[1.6rem] font-bold leading-none tracking-tight text-plum-600">
                    <Counter to={p.metric.value} />
                  </div>
                  <div className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-plum-900/35">
                    {p.metric.label}
                  </div>
                </div>
              </div>

              <p className="mt-7 flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-plum-900/30 line-through decoration-plum-900/25">
                {p.before}
              </p>

              <h3 className="mt-3 font-display text-[1.4rem] font-bold leading-snug tracking-[-0.024em] text-plum-950">
                {p.after}
              </h3>

              <p className="mt-4 text-[0.95rem] leading-relaxed text-plum-900/55">
                {p.detail}
              </p>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
