"use client";

import React, { useEffect, useRef } from "react";
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useTransform,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Reveal, Eyebrow, Icon, type IconName } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/* ============================================================================
   Why Quilit — deliberately almost wordless.

   This is a marketing page, not documentation: the previous version put a
   paragraph on every card and nobody would read six of them. Everything here
   is a figure or a phrase of three to five words.
   ========================================================================== */

const EASE = [0.16, 1, 0.3, 1] as const;

const FIGURES: { value: number; suffix?: string; label: string }[] = [
  { value: 38, label: "Capabilities" },
  { value: 431, label: "Tests passing" },
  { value: 14, label: "Trades served" },
  { value: 0, label: "Per-seat fees" },
];

const PILLARS: { icon: IconName; text: string }[] = [
  { icon: "globe", text: "Offline or cloud" },
  { icon: "layers", text: "Licensed per module" },
  { icon: "wrench", text: "Built to order" },
  { icon: "book", text: "Always balances" },
  { icon: "target", text: "Arabic, fully mirrored" },
  { icon: "sliders", text: "Configured, not coded" },
];

export function WhyQuilit() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  /* Slow counter-drift on the two glows — the only thing moving behind the
     type, which is what gives the section its depth without noise. */
  const glowA = useTransform(scrollYProgress, [0, 1], [-70, 70]);
  const glowB = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section
      ref={ref}
      id="why"
      className="relative overflow-hidden bg-obsidian-900 px-6 py-20 text-white lg:px-10 lg:py-26"
    >
      <div className="film-grain" aria-hidden />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[12%] top-[6%] h-[440px] w-[440px] rounded-full"
        style={{
          y: reduced ? 0 : glowA,
          willChange: "transform",
          background:
            "radial-gradient(closest-side, rgba(163,127,156,0.26), transparent 70%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[4%] right-[8%] h-[380px] w-[380px] rounded-full"
        style={{
          y: reduced ? 0 : glowB,
          willChange: "transform",
          background:
            "radial-gradient(closest-side, rgba(108,77,105,0.34), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[76rem]">
        {/* ---- headline ---- */}
        <div className="text-center">
          <Reveal>
            <Eyebrow tone="dark">Why Quilit</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-8 font-display text-[clamp(2.6rem,7.5vw,6rem)] font-bold leading-[0.94] tracking-[-0.042em]">
              <span className="text-card-matte block">Enterprise power.</span>
              <span className="mt-1 block font-serif italic text-plum-300">
                Zero enterprise drag.
              </span>
            </h2>
          </Reveal>
        </div>

        {/* ---- figures ---- */}
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 lg:mt-20 lg:grid-cols-4">
          {FIGURES.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.09} className="text-center">
              <div className="font-mono text-[clamp(2.8rem,6vw,4.6rem)] font-bold leading-none tracking-[-0.04em] text-white">
                <Counter to={f.value} />
                {f.suffix}
              </div>
              <div className="mt-4 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-plum-300/50">
                {f.label}
              </div>
            </Reveal>
          ))}
        </div>

        {/* ---- pillars: phrases only ---- */}
        {/* Capped width so six pills wrap three-and-three rather than stranding
            a single one on its own line. */}
        <div className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-3 lg:mt-24">
          {PILLARS.map((p, i) => (
            <Reveal key={p.text} delay={i * 0.06}>
              <motion.span
                whileHover={{ y: -4 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(
                  "group flex items-center gap-3 rounded-full border border-white/10 py-3.5 pl-4 pr-6",
                  "bg-gradient-to-b from-white/[0.07] to-white/[0.015]",
                  "shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-400/12 text-plum-300 transition-colors duration-300 group-hover:bg-plum-400/22 group-hover:text-plum-200">
                  <Icon name={p.icon} className="h-4 w-4" />
                </span>
                <span className="whitespace-nowrap text-[0.98rem] font-semibold tracking-[-0.014em] text-white/90">
                  {p.text}
                </span>
              </motion.span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Counts up once, the first time it is seen. */
function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  const reduced = useReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => Math.round(v).toString());

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration: 1.5, ease: EASE });
    return () => controls.stop();
  }, [inView, to, value, reduced]);

  return <motion.span ref={ref}>{text}</motion.span>;
}
