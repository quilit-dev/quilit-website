"use client";

import React, { useEffect, useRef } from "react";
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

/* ============================================================================
   Shared primitives.

   Motion rule inherited from the hero: transform and opacity only. Nothing
   here animates width, height, filter, border-radius or background-position,
   because those trigger layout or paint on every frame.
   ========================================================================== */

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Cinematic arrival, used by every card on the page.
 *
 * Elements tilt up out of depth rather than simply fading — the same gesture
 * the hero and the industries carousel use. One-shot fades were what made the
 * quieter sections read as a different website.
 */
export function Reveal({
  children,
  delay = 0,
  y = 30,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "span";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const reduced = useReducedMotion();
  const M = motion[Tag] as typeof motion.div;

  return (
    <M
      ref={ref}
      className={className}
      initial={
        reduced
          ? false
          : { opacity: 0, y, rotateX: 9, scale: 0.985, transformPerspective: 1200 }
      }
      animate={
        inView || reduced ? { opacity: 1, y: 0, rotateX: 0, scale: 1 } : undefined
      }
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** Counts up once, the first time it is seen. */
export function Counter({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -18% 0px" });
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

  return (
    <motion.span ref={ref} className={className}>
      {text}
    </motion.span>
  );
}

/** Slow vertical drift as the section passes the viewport. */
export function Parallax({
  children,
  distance = 60,
  className,
}: {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y }}>{children}</motion.div>
    </div>
  );
}

export function Eyebrow({
  children,
  tone = "light",
  className,
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 font-mono text-[0.63rem] uppercase tracking-[0.18em]",
        tone === "light"
          ? "border-plum-900/10 bg-white/70 text-plum-800/70"
          : "border-white/10 bg-white/5 text-plum-200/70",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-jade-400 shadow-[0_0_8px_rgba(79,185,138,0.8)]" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "center",
  className,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "center" | "left" | "split";
  className?: string;
  /** Rendered opposite the heading in `split` — keeps the eye moving. */
  aside?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  /* Headings ride slightly against the scroll so the block has parallax
     against the cards beneath it. */
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <motion.div
      ref={ref}
      style={{ y: reduced ? 0 : y, willChange: "transform" }}
      className={cn(
        align === "split"
          ? "flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
          : "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <div className={cn(align === "split" && "max-w-xl")}>
      <Reveal>
        <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.08}>
        <h2
          className={cn(
            "mt-5 text-balance font-display text-[clamp(1.9rem,3.6vw,3.1rem)] font-bold leading-[1.06] tracking-[-0.032em]",
            tone === "light" ? "text-plum-950" : "text-card-matte",
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lead && (
        <Reveal delay={0.14}>
          <p
            className={cn(
              "mt-4 text-balance text-[1.04rem] leading-relaxed",
              tone === "light" ? "text-plum-900/60" : "text-plum-200/60",
            )}
          >
            {lead}
          </p>
        </Reveal>
      )}
      </div>
      {aside && <Reveal delay={0.18} className="shrink-0">{aside}</Reveal>}
    </motion.div>
  );
}

/**
 * Page section shell — vertical rhythm, background tone, and the ambient glow
 * pair every section now carries.
 *
 * The two washes drift in opposite directions against scroll. It is a small
 * effect on its own, but it is what stops a section reading as a flat slab
 * between the animated ones: there is always something alive behind the type.
 */
export function Section({
  id,
  tone = "bone",
  className,
  children,
}: {
  id?: string;
  tone?: "bone" | "bone-deep" | "obsidian" | "obsidian-lift";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const driftA = useTransform(scrollYProgress, [0, 1], [-90, 90]);
  const driftB = useTransform(scrollYProgress, [0, 1], [70, -70]);
  /* Two dark surfaces, not one: every obsidian section at the identical
     shade made them read as one long block. */
  const dark = tone === "obsidian" || tone === "obsidian-lift";

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "relative overflow-hidden px-6 py-20 lg:px-10 lg:py-26",
        tone === "bone" && "bg-bone-100 text-plum-950",
        tone === "bone-deep" && "bg-bone-200 text-plum-950",
        tone === "obsidian" && "bg-obsidian-900 text-white",
        tone === "obsidian-lift" && "bg-obsidian-800 text-white",
        className,
      )}
    >
      {dark && <div className="film-grain" aria-hidden />}

      {/* Edge bridges: a hard cut from bone to obsidian reads as two separate
          pages. These soften both boundaries without touching the palette. */}
      {dark && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-32"
            style={{ background: "linear-gradient(to bottom, rgba(249,247,244,0.07), transparent)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-32"
            style={{ background: "linear-gradient(to top, rgba(249,247,244,0.06), transparent)" }}
          />
        </>
      )}

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[4%] h-[460px] w-[460px] rounded-full"
        style={{
          y: reduced ? 0 : driftA,
          willChange: "transform",
          background: dark
            ? "radial-gradient(closest-side, rgba(163,127,156,0.20), transparent 72%)"
            : "radial-gradient(closest-side, rgba(108,77,105,0.09), transparent 72%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-[2%] right-[6%] h-[400px] w-[400px] rounded-full"
        style={{
          y: reduced ? 0 : driftB,
          willChange: "transform",
          background: dark
            ? "radial-gradient(closest-side, rgba(108,77,105,0.30), transparent 74%)"
            : "radial-gradient(closest-side, rgba(133,96,126,0.08), transparent 74%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[76rem]">{children}</div>
    </section>
  );
}

/** Magnetic, tactile call to action. */
export function Cta({
  href,
  variant = "dark",
  children,
  className,
}: {
  href: string;
  variant?: "dark" | "light" | "glass" | "quiet";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold tracking-[-0.01em]",
        "transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-500",
        variant === "dark" && "btn-tactile-dark",
        variant === "light" && "btn-tactile-light",
        variant === "glass" && "glass-badge text-white",
        variant === "quiet" &&
          "border border-plum-900/12 bg-white/60 text-plum-900 hover:border-plum-900/25 hover:bg-white",
        className,
      )}
    >
      {children}
    </a>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5", className)}
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   Icons — one stroke set, drawn at 24px, inheriting currentColor.
   ------------------------------------------------------------------------- */

export const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  file: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7zM14 2v6h6M16 13H8M16 17H8",
  card: "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 10h20",
  cart: "M8 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2M19 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2M2 2h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",
  package: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.29 7 12 12l8.71-5M12 22V12",
  factory: "M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V8L2 13zM7 18h1M12 18h1M17 18h1",
  truck: "M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11M14 9h4l4 4v4c0 .6-.4 1-1 1h-2M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4M17 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  building: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4",
  trend: "M22 7l-8.5 8.5-5-5L2 17M16 7h6v6",
  book: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
  wallet: "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
  chart: "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  calendar: "M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18",
  userCheck: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M16 11l2 2 4-4",
  briefcase: "M2 9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  receipt: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1zM16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11",
  landmark: "M3 22h18M6 18v-7M10 18v-7M14 18v-7M18 18v-7M12 2l8 5H4z",
  warehouse: "M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35a2 2 0 0 1 1.26-1.85l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35zM6 22V10h12v12",
  check: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  shield: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1zM9 12l2 2 4-4",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  percent: "M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20",
  database: "M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3",
  layers: "M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  zap: "M13 2 3 14h9l-1 8 10-12h-9z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20M12 6v6l4 2",
  spark: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  lock: "M5 11a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM8 9V6a4 4 0 0 1 8 0v3",
  wrench: "M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3z",
  heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z",
  book2: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2",
  cone: "m9.3 6.2 4.1 10.5M16.9 20H7.1a1 1 0 0 1-.9-1.4l5-15a1 1 0 0 1 1.6 0l5 15a1 1 0 0 1-.9 1.4",
  cpu: "M6 6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2zM10 9h4M10 13h4M2 9h2M2 15h2M20 9h2M20 15h2",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/** Small square icon plate used on cards throughout the page. */
export function IconPlate({
  name,
  tone = "plum",
  className,
}: {
  name: IconName;
  tone?: "plum" | "dark";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] border transition-colors duration-300",
        tone === "plum"
          ? "border-plum-900/8 bg-gradient-to-b from-plum-100 to-plum-50 text-plum-600 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]"
          : "border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02] text-plum-300",
        className,
      )}
    >
      <Icon name={name} />
    </span>
  );
}
