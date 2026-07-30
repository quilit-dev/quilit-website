"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Counter, Icon, type IconName } from "@/components/ui/primitives";

/* ============================================================================
   Trust strip — the first thing after the hero.

   Facts, not adjectives. Every figure here is verifiable from the product:
   capability count, the test suite, languages shipped, deployment modes. No
   customer claims, because there are none to make yet.

   It also does structural work: a slim band between the hero's obsidian close
   and the first light section, so the page does not slam from black to bone.
   ========================================================================== */

const FACTS: { icon: IconName; value?: number; text: string; label: string }[] = [
  { icon: "layers", value: 38, text: "", label: "Capabilities, one login" },
  { icon: "globe", text: "EN · AR", label: "Bilingual, full RTL" },
  { icon: "shield", text: "RBAC", label: "Roles on every module" },
  { icon: "database", text: "Daily", label: "Backups, restore-tested" },
  { icon: "clock", value: 0, text: "", label: "Per-seat fees, ever" },
];

export function TrustBar() {
  const reduced = useReducedMotion();

  return (
    <section
      aria-label="Quilit at a glance"
      className="relative overflow-hidden border-b border-plum-900/6 bg-bone-100 px-6 py-10 lg:px-10 lg:py-12"
    >
      {/* bridge out of the hero's obsidian close */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "linear-gradient(to bottom, rgba(14,9,14,0.10), transparent)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[76rem] grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {FACTS.map((f, i) => (
          <motion.div
            key={f.label}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
            className="flex items-center gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] border border-plum-900/8 bg-white text-plum-600 shadow-[0_1px_2px_rgba(42,29,41,0.05)]">
              <Icon name={f.icon} className="h-[17px] w-[17px]" />
            </span>
            <div className="min-w-0">
              <div className="font-mono text-[1.15rem] font-bold leading-none tracking-tight text-plum-950">
                {f.value !== undefined ? <Counter to={f.value} /> : f.text}
              </div>
              <div className="mt-1.5 truncate font-mono text-[0.58rem] uppercase tracking-[0.13em] text-plum-900/40">
                {f.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
