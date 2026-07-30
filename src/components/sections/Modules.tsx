"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Section,
  SectionHeading,
  Reveal,
  Icon,
  type IconName,
} from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Module = { name: string; desc: string; icon: IconName; soon?: boolean };

const GROUPS: { key: string; label: string; modules: Module[] }[] = [
  {
    key: "sales",
    label: "Sales",
    modules: [
      { name: "CRM", desc: "Know every customer before they call", icon: "target" },
      { name: "Clients", desc: "Every document for a client in one place", icon: "users" },
      { name: "Quotations", desc: "Quote in minutes, convert in one click", icon: "file" },
      { name: "Invoices", desc: "Get paid without chasing paperwork", icon: "card" },
      { name: "Point of Sale", desc: "Sell at the counter, post to the books", icon: "cart" },
      { name: "Promotions", desc: "Run offers without briefing the cashier", icon: "percent" },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    modules: [
      { name: "Inventory", desc: "Never wonder where your stock went", icon: "package" },
      { name: "Manufacturing", desc: "Know what a batch really cost to make", icon: "factory" },
      { name: "Purchases", desc: "Receive goods, and the books already know", icon: "truck" },
      { name: "Suppliers", desc: "See what every supplier has cost you", icon: "building" },
      { name: "Warehouses", desc: "Track stock across every branch at once", icon: "warehouse" },
      { name: "Projects", desc: "See a job's profit before it finishes", icon: "briefcase" },
      { name: "Planning", desc: "See who is doing what, and by when", icon: "calendar" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    modules: [
      { name: "Accounting", desc: "Close your books with confidence", icon: "book" },
      { name: "Finance", desc: "Know what you actually earned this month", icon: "trend" },
      { name: "Expenses", desc: "No spend leaves without a sign-off", icon: "receipt" },
      { name: "Cash", desc: "Balance the drawer before you lock up", icon: "wallet" },
      { name: "Fixed Assets", desc: "Depreciation posts itself, every month", icon: "landmark" },
      { name: "Tax", desc: "File VAT without rebuilding the numbers", icon: "percent" },
      { name: "Reports", desc: "Answers, without exporting to a spreadsheet", icon: "chart" },
    ],
  },
  {
    key: "people",
    label: "People",
    modules: [
      { name: "HR", desc: "Every hire, raise and leave on record", icon: "userCheck" },
      { name: "Payroll", desc: "Run payroll without a second system", icon: "wallet" },
      { name: "Contracts", desc: "Issue a contract in minutes, not days", icon: "file" },
      { name: "Recruitment", desc: "Hire and onboard in one thread", icon: "briefcase" },
      { name: "Activities", desc: "Nothing about your people slips", icon: "bell" },
      { name: "Approvals", desc: "The right person approves, every time", icon: "check" },
    ],
  },
  {
    key: "platform",
    label: "Platform",
    modules: [
      { name: "Users & Roles", desc: "People see only what their role allows", icon: "shield" },
      { name: "Audit Log", desc: "Know who changed what, and when", icon: "book2" },
      { name: "Archives & Bin", desc: "Undo a mistake without calling support", icon: "database" },
      { name: "Backups", desc: "Backups that are proven to restore", icon: "layers" },
      { name: "Settings", desc: "Shape the system without a developer", icon: "sliders" },
      { name: "AI Assistant", desc: "Ask your data a question, in plain words", icon: "spark", soon: true },
    ],
  },
];

export function Modules() {
  const [active, setActive] = useState(GROUPS[0].key);
  const group = GROUPS.find((g) => g.key === active) ?? GROUPS[0];

  return (
    <Section id="modules" tone="bone-deep">
      <SectionHeading
        eyebrow="What Quilit replaces"
        title={
          <>
            Stop stitching together
            <br />
            <span className="font-serif italic text-plum-600">eight different tools.</span>
          </>
        }
        lead="Every department on one login, sharing one set of numbers. License the whole platform or only what you use."
      />

      {/* group switcher */}
      <Reveal delay={0.1}>
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => setActive(g.key)}
              className={cn(
                "relative rounded-full px-5 py-2.5 text-[0.9rem] font-medium transition-colors duration-200",
                active === g.key
                  ? "text-white"
                  : "text-plum-900/55 hover:text-plum-950",
              )}
            >
              {active === g.key && (
                <motion.span
                  layoutId="module-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-b from-plum-600 to-plum-800 shadow-[0_8px_20px_-8px_rgba(42,29,41,0.6),inset_0_1px_1px_rgba(255,255,255,0.22)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{g.label}</span>
            </button>
          ))}
        </div>
      </Reveal>

      {/* cards */}
      <div className="mt-8 min-h-[26rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {group.modules.map((m, i) => (
              <motion.article
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.035,
                }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-[20px] border border-plum-900/8 bg-white p-6 shadow-[0_1px_2px_rgba(42,29,41,0.04)] transition-[box-shadow,border-color] duration-300 hover:border-plum-600/20 hover:shadow-[0_28px_54px_-26px_rgba(42,29,41,0.42)]"
              >
                <span
                  aria-hidden
                  className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-plum-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-plum-500/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-plum-900/8 bg-gradient-to-b from-plum-100 to-plum-50 text-plum-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-plum-600/25 group-hover:from-plum-600 group-hover:to-plum-800 group-hover:text-white group-hover:shadow-[0_10px_20px_-8px_rgba(42,29,41,0.55)]">
                    <Icon name={m.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <div className="mb-1.5 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-plum-900/35">
                      {m.name}
                    </div>
                    <h3 className="flex flex-wrap items-center gap-2 font-display text-[1rem] font-bold leading-snug tracking-[-0.018em] text-plum-950">
                      {m.desc}
                      {m.soon && (
                        <span className="rounded-full border border-plum-600/20 bg-plum-600/8 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-plum-600">
                          Coming soon
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}
