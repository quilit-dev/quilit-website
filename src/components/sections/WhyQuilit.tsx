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
  useAnimationFrame,
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

        {/* ---- pillars: an endless ticker ---- */}
        <div className="mt-16 lg:mt-24">
          <PillTicker />
        </div>

      </div>
    </section>
  );
}

/**
 * Endless right-to-left ticker of the pillar phrases.
 *
 * One composited `x` carries the whole row, and two copies of the set are
 * rendered so the offset can wrap by exactly one set width — the seam never
 * arrives. Hovering eases the speed down rather than stopping dead.
 */
function PillTicker() {
  const x = useMotionValue(0);
  const setRef = useRef<HTMLDivElement>(null);
  const speed = useRef(0);
  const slow = useRef(false);
  const reduced = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const w = setRef.current?.offsetWidth ?? 0;
    if (!w || delta > 100) return;
    const target = slow.current ? -6 : -42;      // px/s, leftward
    speed.current += (target - speed.current) * 0.05;
    let next = x.get() + speed.current * (delta / 1000);
    if (next <= -w) next += w;
    if (next >= 0) next -= w;
    x.set(next);
  });

  if (reduced) {
    return (
      <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-3">
        {PILLARS.map((p) => (
          <Pill key={p.text} pillar={p} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="marquee-mask overflow-hidden"
      onMouseEnter={() => (slow.current = true)}
      onMouseLeave={() => (slow.current = false)}
    >
      <motion.div className="flex w-max gap-3" style={{ x, willChange: "transform" }}>
        <div ref={setRef} className="flex gap-3 pr-3">
          {PILLARS.map((p) => (
            <Pill key={p.text} pillar={p} />
          ))}
        </div>
        <div className="flex gap-3 pr-3" aria-hidden>
          {PILLARS.map((p) => (
            <Pill key={p.text + "-2"} pillar={p} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Pill({ pillar }: { pillar: { icon: IconName; text: string } }) {
  return (
    <span
      className={cn(
        "group flex shrink-0 items-center gap-3 rounded-full border border-white/10 py-3.5 pl-4 pr-6",
        "bg-gradient-to-b from-white/[0.07] to-white/[0.015]",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
        "transition-colors duration-300 hover:border-plum-300/30",
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-400/12 text-plum-300 transition-colors duration-300 group-hover:bg-plum-400/25 group-hover:text-plum-200">
        <Icon name={pillar.icon} className="h-4 w-4" />
      </span>
      <span className="whitespace-nowrap text-[0.98rem] font-semibold tracking-[-0.014em] text-white/90">
        {pillar.text}
      </span>
    </span>
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
