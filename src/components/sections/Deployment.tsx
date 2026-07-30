"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Section,
  SectionHeading,
  Reveal,
  Cta,
  ArrowRight,
  Icon,
  type IconName,
} from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/* No figures anywhere in this section: pricing is quoted per customer because
   the module set, deployment and any custom work all move it. The page's job
   is to explain the shape of the arrangement and open a conversation. */

const MODES: {
  key: string;
  label: string;
  tag: string;
  icon: IconName;
  title: string;
  body: string;
  points: string[];
}[] = [
  {
    key: "onprem",
    label: "On your premises",
    tag: "Fully offline",
    icon: "warehouse",
    title: "Runs with the internet unplugged",
    body: "One machine serves the whole office. Nothing leaves your network.",
    points: [
      "Windows installer or your own Docker host",
      "LAN access across the office",
      "Backups automatic and restore-tested",
      "Keeps working through an outage",
    ],
  },
  {
    key: "cloud",
    label: "Hosted in the cloud",
    tag: "Managed for you",
    icon: "globe",
    title: "Reach it from anywhere, we keep it running",
    body: "One instance for every branch. No server for you to administer.",
    points: [
      "Updates and backups handled for you",
      "Any branch, any device",
      "Module set per instance",
      "PostgreSQL for larger rollouts",
    ],
  },
];

const TERMS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "layers",
    title: "Pay per module",
    body: "Take what you use. Add the rest when you need it.",
  },
  {
    icon: "wrench",
    title: "Built to order",
    body: "No module fits your process? We build the one that does.",
  },
  {
    icon: "sliders",
    title: "Configured, not coded",
    body: "Attributes, categories, tax, roles and approvals — all yours to set.",
  },
];

export function Deployment() {
  const [mode, setMode] = useState(MODES[0].key);
  const active = MODES.find((m) => m.key === mode) ?? MODES[0];

  return (
    <Section id="deployment" tone="bone-deep">
      <SectionHeading
        align="split"
        eyebrow="Deployment & licensing"
        title={
          <>
            Run it your way.
            <br />
            <span className="font-serif italic text-plum-600">Own it outright.</span>
          </>
        }
        lead="Offline or cloud. The whole platform or a handful of modules. Standard, or built for how you actually work."
      />

      {/* ---- deployment switch ---- */}
      <Reveal delay={0.1}>
        <div className="mt-10 flex justify-center">
          <div className="inline-flex gap-1 rounded-full border border-plum-900/8 bg-white/70 p-1.5">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                aria-pressed={mode === m.key}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.9rem] font-medium transition-colors duration-200",
                  mode === m.key ? "text-white" : "text-plum-900/55 hover:text-plum-950",
                )}
              >
                {mode === m.key && (
                  <motion.span
                    layoutId="deploy-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-b from-plum-600 to-plum-800 shadow-[0_8px_20px_-8px_rgba(42,29,41,0.6),inset_0_1px_1px_rgba(255,255,255,0.22)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon name={m.icon} className="h-[17px] w-[17px]" />
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.16}>
        <div className="relative mt-8 overflow-hidden rounded-[26px] border border-plum-900/8 bg-white p-8 shadow-[0_1px_2px_rgba(42,29,41,0.04),0_28px_60px_-40px_rgba(42,29,41,0.4)] lg:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center"
            >
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-plum-600/18 bg-plum-600/6 px-3 py-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-plum-700">
                  {active.tag}
                </span>
                <h3 className="mt-5 font-display text-[1.7rem] font-bold leading-snug tracking-[-0.028em] text-plum-950 lg:text-[2rem]">
                  {active.title}
                </h3>
                <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-plum-900/58">
                  {active.body}
                </p>
              </div>

              <ul className="grid gap-3.5">
                {active.points.map((pt) => (
                  <li
                    key={pt}
                    className="flex gap-3 rounded-2xl border border-plum-900/6 bg-bone-100 px-5 py-4 text-[0.92rem] leading-relaxed text-plum-900/62"
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

          <p className="mt-10 border-t border-plum-900/6 pt-6 text-[0.88rem] text-plum-900/45">
            Identical product either way. Switching later moves one database.
          </p>
        </div>
      </Reveal>

      {/* ---- licensing & customisation ---- */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {TERMS.map((t, i) => (
          <Reveal key={t.title} delay={i * 0.07}>
            <motion.article
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="group relative h-full overflow-hidden rounded-[22px] border border-plum-900/8 bg-white p-8 shadow-[0_1px_2px_rgba(42,29,41,0.04)] transition-shadow duration-300 hover:shadow-[0_24px_48px_-30px_rgba(42,29,41,0.34)]"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-plum-500/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
              <span className="flex h-11 w-11 items-center justify-center rounded-[13px] border border-plum-900/8 bg-gradient-to-b from-plum-100 to-plum-50 text-plum-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                <Icon name={t.icon} />
              </span>
              <h3 className="mt-6 font-display text-[1.15rem] font-bold leading-snug tracking-[-0.022em] text-plum-950">
                {t.title}
              </h3>
              <p className="mt-3.5 text-[0.92rem] leading-relaxed text-plum-900/55">
                {t.body}
              </p>
            </motion.article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-10 flex flex-col items-center gap-5 rounded-[24px] border border-plum-900/8 bg-white px-8 py-10 text-center">
          <h3 className="max-w-xl text-balance font-display text-[1.6rem] font-bold leading-snug tracking-[-0.026em] text-plum-950">
Tell us how you work. We will show you what fits.
          </h3>
          <div className="mt-1 flex flex-wrap justify-center gap-3">
            <Cta href="#demo" variant="dark">
              Book a demo
              <ArrowRight />
            </Cta>
            <Cta href="#modules" variant="quiet">
              Browse the modules
            </Cta>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
