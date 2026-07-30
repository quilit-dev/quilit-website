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
      { name: "CRM", desc: "Leads, deals, contacts and a weighted pipeline", icon: "target" },
      { name: "Clients", desc: "One record per customer, every document attached", icon: "users" },
      { name: "Quotations", desc: "Quote once, convert to invoice or project", icon: "file" },
      { name: "Invoices", desc: "Partial and dual-currency payments, idempotent", icon: "card" },
      { name: "Point of Sale", desc: "Drawer sessions, tax-inclusive pricing, refunds", icon: "cart" },
      { name: "Promotions", desc: "Time- and quantity-bound automatic discounts", icon: "percent" },
    ],
  },
  {
    key: "operations",
    label: "Operations",
    modules: [
      { name: "Inventory", desc: "Variants, lots, expiry, FIFO / LIFO / average", icon: "package" },
      { name: "Manufacturing", desc: "Versioned BOMs, QC quarantine, cost variance", icon: "factory" },
      { name: "Purchases", desc: "PO lifecycle that posts stock and expense", icon: "truck" },
      { name: "Suppliers", desc: "Vendors, terms and full purchase history", icon: "building" },
      { name: "Warehouses", desc: "Per-branch stock scoping and comparison", icon: "warehouse" },
      { name: "Projects", desc: "Budget versus actual, computed from real cost", icon: "briefcase" },
      { name: "Planning", desc: "Gantt, kanban, list and calendar of one plan", icon: "calendar" },
    ],
  },
  {
    key: "finance",
    label: "Finance",
    modules: [
      { name: "Accounting", desc: "Double-entry ledger that always ties out", icon: "book" },
      { name: "Finance", desc: "Cash-basis summary, ranges, reconciliation", icon: "trend" },
      { name: "Expenses", desc: "Approval chains and recurring templates", icon: "receipt" },
      { name: "Cash", desc: "Daily till counts, USD and LBP variance apart", icon: "wallet" },
      { name: "Fixed Assets", desc: "Register with straight-line depreciation", icon: "landmark" },
      { name: "Tax", desc: "Named rates, frozen per line, VAT reporting", icon: "percent" },
      { name: "Reports", desc: "Seven reports, date-filtered, Excel export", icon: "chart" },
    ],
  },
  {
    key: "people",
    label: "People",
    modules: [
      { name: "HR", desc: "Directory, leave, append-only salary timeline", icon: "userCheck" },
      { name: "Payroll", desc: "Monthly runs with NSSF and tax breakdown", icon: "wallet" },
      { name: "Contracts", desc: "Structured, printable employment contracts", icon: "file" },
      { name: "Recruitment", desc: "Positions to applicants to onboarding", icon: "briefcase" },
      { name: "Activities", desc: "Personal HR queue with built-in reminders", icon: "bell" },
      { name: "Approvals", desc: "Rule-based multi-step decision chains", icon: "check" },
    ],
  },
  {
    key: "platform",
    label: "Platform",
    modules: [
      { name: "Users & Roles", desc: "RBAC across every module and action", icon: "shield" },
      { name: "Audit Log", desc: "Every mutation, user-stamped, permanent", icon: "book2" },
      { name: "Archives & Bin", desc: "Soft-delete with restore, 30-day purge", icon: "database" },
      { name: "Backups", desc: "Automatic, checksummed, restore-tested", icon: "layers" },
      { name: "Settings", desc: "Company, finance, categories, currency", icon: "sliders" },
      { name: "AI Assistant", desc: "Natural-language insight over your data", icon: "spark", soon: true },
    ],
  },
];

export function Modules() {
  const [active, setActive] = useState(GROUPS[0].key);
  const group = GROUPS.find((g) => g.key === active) ?? GROUPS[0];

  return (
    <Section id="modules" tone="bone-deep">
      <SectionHeading
        eyebrow="Thirty-eight capabilities, one login"
        title={
          <>
            Every department,
            <br />
            <span className="font-serif italic text-plum-600">already connected.</span>
          </>
        }
        lead="License the whole platform or only the modules you need. Anything you did not buy is blocked at its endpoint, not merely hidden."
      />

      {/* group switcher */}
      <Reveal delay={0.1}>
        <div className="mt-14 flex flex-wrap justify-center gap-2">
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
      <div className="mt-10 min-h-[26rem]">
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
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-[20px] border border-plum-900/8 bg-white p-6 shadow-[0_1px_2px_rgba(42,29,41,0.04)] transition-shadow duration-300 hover:shadow-[0_22px_44px_-26px_rgba(42,29,41,0.34)]"
              >
                <span
                  aria-hidden
                  className="absolute -right-14 -top-14 h-28 w-28 rounded-full bg-plum-500/8 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div className="relative flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-plum-900/8 bg-gradient-to-b from-plum-100 to-plum-50 text-plum-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                    <Icon name={m.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 font-display text-[1.02rem] font-bold tracking-[-0.018em] text-plum-950">
                      {m.name}
                      {m.soon && (
                        <span className="rounded-full border border-plum-600/20 bg-plum-600/8 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-plum-600">
                          Coming soon
                        </span>
                      )}
                    </h3>
                    <p className="mt-1.5 text-[0.88rem] leading-relaxed text-plum-900/55">
                      {m.desc}
                    </p>
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
