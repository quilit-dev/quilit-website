"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Reveal, Eyebrow, Icon } from "@/components/ui/primitives";
import { DemoForm } from "./DemoForm";

const ASSURANCES = [
  { icon: "clock" as const, text: "Forty minutes, with an engineer" },
  { icon: "database" as const, text: "Loaded with your chart of accounts" },
  { icon: "lock" as const, text: "Offline or cloud, your choice" },
];

export function FinalCta() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* The closing frame was the last still surface on the page — these two
     washes now counter-drift so it lands with the same weight as the hero. */
  const glowA = useTransform(scrollYProgress, [0, 1], [-120, 120]);
  const glowB = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const lift = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={ref}
      id="demo"
      className="relative overflow-hidden bg-obsidian-900 px-6 py-24 lg:px-10 lg:py-32"
    >
      <div className="film-grain" aria-hidden />

      {/* two static washes — no animated filters on a full-bleed surface */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[620px] w-[760px] -translate-x-1/2 rounded-full"
        style={{
          y: reduced ? 0 : glowA,
          willChange: "transform",
          background:
            "radial-gradient(closest-side, rgba(163,127,156,0.26), transparent 68%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[-6%] right-[10%] h-[480px] w-[520px] rounded-full"
        style={{
          y: reduced ? 0 : glowB,
          willChange: "transform",
          background:
            "radial-gradient(closest-side, rgba(108,77,105,0.28), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-plum-300/30 to-transparent"
      />

      <motion.div
        style={{ y: reduced ? 0 : lift, willChange: "transform" }}
        className="relative mx-auto grid w-full max-w-[72rem] items-center gap-10 lg:grid-cols-[1fr_28rem] lg:gap-14"
      >
        {/* ---- the pitch ---- */}
        <div className="text-center lg:text-left">
          <Reveal>
            <Eyebrow tone="dark">Ready when you are</Eyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="text-card-matte mt-7 text-balance font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-bold leading-[1.03] tracking-[-0.036em]">
              See it running
              <br />
              <span className="font-serif italic">your actual numbers.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mx-auto mt-6 max-w-xl text-balance text-[1.04rem] leading-relaxed text-plum-200/60 lg:mx-0">
              Bring a month of real invoices and a product list. We will set them
              up live and show you the ledger entries the system writes for them.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
              {ASSURANCES.map((a) => (
                <li
                  key={a.text}
                  className="flex items-center gap-2.5 font-mono text-[0.68rem] uppercase tracking-[0.13em] text-plum-300/45"
                >
                  <Icon name={a.icon} className="h-3.5 w-3.5 text-plum-300/60" />
                  {a.text}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* ---- the form ----
             This section previously closed with a button pointing at #demo —
             its own id — so the one call to action on the page scrolled to
             where you already were. There was no contact route on the site at
             all; this is it. */}
        <Reveal delay={0.12} className="min-w-0">
          <DemoForm />
        </Reveal>
      </motion.div>
    </section>
  );
}
