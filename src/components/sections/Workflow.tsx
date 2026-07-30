"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValueEvent,
  type MotionValue,
} from "motion/react";
import { Eyebrow, Icon, type IconName } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/* ============================================================================
   The one interaction that demonstrates the product instead of describing it.

   A single sale is followed end to end — quotation, invoice, payment, ledger —
   with the side effects it triggers on the way. Everything on screen is the
   same figure travelling forward, because that is precisely the claim: the
   number is entered once and never retyped.

   Scroll-driven over a short sticky runway. Transform and opacity only.
   ========================================================================== */

type Stage = {
  key: string;
  ref: string;
  label: string;
  icon: IconName;
  headline: string;
  rows: [string, string][];
  effect: string;
};

const STAGES: Stage[] = [
  {
    key: "quote",
    ref: "QTN-2026-0031",
    label: "Quotation",
    icon: "file",
    headline: "A price goes out.",
    rows: [
      ["Material Gamma × 120", "$2,100.00"],
      ["Product Alpha × 9", "$1,980.00"],
      ["VAT 11%", "$255.75"],
    ],
    effect: "Sent to Client Theta",
  },
  {
    key: "invoice",
    ref: "INV-2026-0104",
    label: "Invoice",
    icon: "card",
    headline: "The client accepts.",
    rows: [
      ["Same lines, carried across", "—"],
      ["Due in 30 days", "Aug 28"],
      ["Amount", "$4,335.75"],
    ],
    effect: "Nothing retyped",
  },
  {
    key: "payment",
    ref: "PAY-2026-0217",
    label: "Payment",
    icon: "wallet",
    headline: "The money lands.",
    rows: [
      ["Bank transfer", "$4,335.75"],
      ["Balance remaining", "$0.00"],
      ["Idempotency key", "held"],
    ],
    effect: "Cannot double-charge",
  },
  {
    key: "ledger",
    ref: "JE-2026-00382",
    label: "Journal entry",
    icon: "book",
    headline: "The books close themselves.",
    rows: [
      ["1000 · Cash & Bank", "Dr 4,335.75"],
      ["4000 · Sales Revenue", "Cr 4,335.75"],
      ["Trial balance", "ties out"],
    ],
    effect: "Posted automatically",
  },
];

/* Side effects that fire alongside the chain — the parts a spreadsheet forgets. */
const EFFECTS = [
  { at: 0.30, icon: "package" as IconName, text: "Stock drawn FEFO · 129 units" },
  { at: 0.52, icon: "percent" as IconName, text: "Output VAT recorded · $255.75" },
  { at: 0.74, icon: "chart" as IconName, text: "Revenue report updated" },
];

export function Workflow() {
  const runway = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: p } = useScroll({
    target: runway,
    offset: ["start start", "end end"],
  });

  /* Declared before the reduced-motion return: a hook called after a
     conditional return runs in a different order between renders. */
  const railScale = useTransform(p, [0.06, 0.88], [0, 1]);

  /* Four cards need 1470px; a phone viewport is ~830px, so the desktop grid
     was cut off top and bottom and the sequence could not be followed.
     Mobile advances one stage at a time instead — which also reads better,
     because "watch it travel" is a sequence, not a wall. */
  const [step, setStep] = useState(0);
  useMotionValueEvent(p, "change", (v) => {
    /* Same slice boundaries the desktop cards use (0.06 + i * 0.2), so
       both layouts advance at identical scroll positions. */
    const idx = Math.max(0, Math.min(STAGES.length - 1, Math.floor((v - 0.06) / 0.2)));
    setStep(idx);
  });

  if (reduced) return <StaticWorkflow />;

  return (
    <div ref={runway} id="workflow" className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-obsidian-950 px-6 lg:px-10">
        <div className="film-grain" aria-hidden />

        {/* signature wash — cooler and lower than the other dark sections */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 520px at 50% 118%, rgba(108,77,105,0.34), transparent 70%), radial-gradient(620px 380px at 12% -10%, rgba(163,127,156,0.16), transparent 72%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[76rem]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow tone="dark">One sale, end to end</Eyebrow>
              <h2 className="text-card-matte mt-5 max-w-xl font-display text-[clamp(1.9rem,3.8vw,3rem)] font-bold leading-[1.05] tracking-[-0.032em]">
                Type it once.
                <br />
                <span className="font-serif italic">Watch it travel.</span>
              </h2>
            </div>
            <Progress p={p} />
          </div>

          {/* ---- the chain: full grid from lg up ---- */}
          <div className="relative mt-12 hidden lg:mt-16 lg:block">
            {/* rail the stages sit on */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-[42px] hidden h-px bg-white/10 lg:block"
            />
            <motion.div
              aria-hidden
              className="absolute left-0 top-[42px] hidden h-px origin-left bg-gradient-to-r from-plum-400 to-plum-300 lg:block"
              style={{ right: 0, scaleX: railScale, willChange: "transform" }}
            />

            <div className="grid gap-4 lg:grid-cols-4 lg:gap-5">
              {STAGES.map((s, i) => (
                <StageCard key={s.key} stage={s} index={i} p={p} />
              ))}
            </div>
          </div>

          {/* ---- the chain: one stage at a time on small screens ---- */}
          <div className="mt-8 lg:hidden">
            <div className="mb-5 flex items-center gap-2">
              {STAGES.map((st, n) => (
                <div
                  key={st.key}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-500",
                    n <= step ? "bg-plum-300" : "bg-white/12",
                  )}
                />
              ))}
            </div>
            <div className="mb-4 flex items-baseline justify-between">
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-plum-300/50">
                Step {step + 1} of {STAGES.length}
              </span>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-plum-300/40">
                {STAGES[step].ref}
              </span>
            </div>

            <div className="relative min-h-[262px]">
              {STAGES.map((st, n) => (
                <motion.div
                  key={st.key}
                  className="absolute inset-x-0 top-0"
                  initial={false}
                  animate={{
                    opacity: n === step ? 1 : 0,
                    y: n === step ? 0 : n < step ? -16 : 16,
                  }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{ willChange: "transform, opacity" }}
                  aria-hidden={n !== step}
                >
                  <StageBody stage={st} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ---- side effects ---- */}
          <div className="mt-10 flex flex-wrap gap-2.5 lg:mt-12">
            {EFFECTS.map((e) => (
              <EffectChip key={e.text} effect={e} p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Progress({ p }: { p: MotionValue<number> }) {
  const pct = useTransform(p, [0.06, 0.88], [0, 100]);
  const width = useTransform(pct, (v) => `${Math.max(0, Math.min(100, v))}%`);
  return (
    <div className="w-full max-w-[13rem] shrink-0">
      <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-plum-300/45">
        Sale progress
      </div>
      <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-plum-400 to-plum-200"
          style={{ width, willChange: "width" }}
        />
      </div>
    </div>
  );
}

function StageCard({
  stage,
  index,
  p,
}: {
  stage: Stage;
  index: number;
  p: MotionValue<number>;
}) {
  /* Each stage owns a slice of the runway and activates within it.
     Every input range is clamped into [0,1]: Motion hands scroll-linked
     transforms to a WAAPI ScrollTimeline, where the input range becomes
     keyframe offsets — and an offset above 1 throws at mount, taking the
     whole page down. The last stage's fade-back used to land at 1.04. */
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const start = clamp(0.06 + index * 0.2);
  const on = clamp(start + 0.1);
  const settle = clamp(on + 0.28);

  const opacity = useTransform(p, [clamp(start - 0.06), start], [0.32, 1]);
  const y = useTransform(p, [clamp(start - 0.06), start], [26, 0]);
  const glow = useTransform(
    p,
    settle > on ? [start, on, settle] : [start, on],
    settle > on ? [0, 1, 0.45] : [0, 1],
  );
  const dot = useTransform(p, [clamp(start - 0.03), start], [0.4, 1]);

  return (
    <motion.article
      style={{ opacity, y, willChange: "transform, opacity" }}
      className="relative"
    >
      {/* node on the rail */}
      <div className="mb-5 hidden items-center gap-3 lg:flex">
        <motion.span
          style={{ scale: dot }}
          className="relative flex h-[18px] w-[18px] items-center justify-center rounded-full border border-plum-300/40 bg-obsidian-900"
        >
          <motion.span
            style={{ opacity: glow }}
            className="h-[7px] w-[7px] rounded-full bg-plum-200 shadow-[0_0_12px_rgba(194,166,188,0.9)]"
          />
        </motion.span>
        <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-plum-300/50">
          Step {index + 1}
        </span>
      </div>

      <StageBody stage={stage} glow={glow} />
    </motion.article>
  );
}

/** The card itself — shared by the desktop grid and the mobile single stage. */
function StageBody({
  stage,
  glow,
}: {
  stage: Stage;
  glow?: MotionValue<number>;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-white/10 p-5",
        "bg-gradient-to-b from-white/[0.07] to-white/[0.015]",
        "shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]",
      )}
    >
      <motion.span
        aria-hidden
        style={glow ? { opacity: glow } : { opacity: 1 }}
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-plum-300/70 to-transparent"
      />

      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-plum-300">
          <Icon name={stage.icon} className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[0.82rem] font-semibold text-white">{stage.label}</div>
          <div className="truncate font-mono text-[0.6rem] text-plum-300/45">{stage.ref}</div>
        </div>
      </div>

      <p className="mt-4 font-display text-[1.05rem] font-bold leading-snug tracking-[-0.02em] text-white">
        {stage.headline}
      </p>

      <dl className="mt-4 space-y-2 border-t border-white/8 pt-4">
        {stage.rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-3">
            <dt className="truncate text-[0.76rem] text-plum-200/55">{k}</dt>
            <dd className="shrink-0 font-mono text-[0.76rem] font-semibold text-white/90">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-jade-400/25 bg-jade-400/8 px-2.5 py-1">
        <span className="h-1 w-1 rounded-full bg-jade-400" />
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.12em] text-jade-400">
          {stage.effect}
        </span>
      </div>
    </div>
  );
}

function EffectChip({
  effect,
  p,
}: {
  effect: { at: number; icon: IconName; text: string };
  p: MotionValue<number>;
}) {
  const from = Math.max(0, effect.at - 0.05);
  const opacity = useTransform(p, [from, effect.at], [0, 1]);
  const x = useTransform(p, [from, effect.at], [-14, 0]);
  return (
    <motion.span
      style={{ opacity, x, willChange: "transform, opacity" }}
      className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2"
    >
      <Icon name={effect.icon} className="h-3.5 w-3.5 text-plum-300" />
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-plum-200/60">
        {effect.text}
      </span>
    </motion.span>
  );
}

/** Reduced motion: the same chain, simply laid out. */
function StaticWorkflow() {
  return (
    <section id="workflow" className="relative overflow-hidden bg-obsidian-950 px-6 py-20 lg:px-10 lg:py-26">
      <div className="film-grain" aria-hidden />
      <div className="relative mx-auto w-full max-w-[76rem]">
        <Eyebrow tone="dark">One sale, end to end</Eyebrow>
        <h2 className="text-card-matte mt-5 font-display text-[clamp(1.9rem,3.8vw,3rem)] font-bold leading-[1.05] tracking-[-0.032em]">
          Type it once. Watch it travel.
        </h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {STAGES.map((s) => (
            <div key={s.key} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[0.82rem] font-semibold text-white">{s.label}</div>
              <p className="mt-3 font-display text-[1.05rem] font-bold text-white">{s.headline}</p>
              <dl className="mt-4 space-y-2 border-t border-white/8 pt-4">
                {s.rows.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-[0.76rem] text-plum-200/55">{k}</dt>
                    <dd className="font-mono text-[0.76rem] text-white/90">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
