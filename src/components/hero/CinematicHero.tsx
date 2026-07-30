"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  AnimatePresence,
  type MotionValue,
} from "motion/react";
import { cn } from "@/lib/utils";

/* ============================================================================
   Scroll choreography map  (p = scroll progress through the pinned runway)

   0.00 ─ 0.09   headline recedes (scale + fade) · obsidian stage rises
   0.07 ─ 0.16   stage scales up to full bleed
   0.06 ─ 0.26   monitor flies in from depth (rotateX/Y + z)
   0.18 ─ 0.35   ring fills · revenue counter runs · badges pop
   0.24 ─ 0.39   flanking copy slides in · wordmark settles
   0.39 ─ 0.58   HOLD — the composition simply sits and is read
   0.58 ─ 0.68   contents recede
   0.66 ─ 0.80   stage pulls back to a card · closing CTA resolves
   0.90 ─ 1.00   stage lifts away, revealing what follows

   Everything here is transform/opacity only. Layout- or paint-triggering
   properties (width, height, filter, background-position) are deliberately
   avoided — see the notes at each ramp.
   ========================================================================== */

const SCREENS = [
  { src: "/screens/dashboard.png", label: "Dashboard" },
  { src: "/screens/pos.png", label: "Point of Sale" },
  { src: "/screens/accounting.png", label: "Accounting" },
  { src: "/screens/reports.png", label: "Reports" },
] as const;

const TRUST = [
  { value: "28", label: "Modules" },
  { value: "431", label: "Automated tests" },
  { value: "EN·AR", label: "Bilingual, RTL" },
] as const;

/* Direction-aware screen change. Transform + opacity only, so a slide costs
   the compositor the same as the crossfade it replaces. */
const SLIDE = {
  enter: (d: number) => ({ opacity: 0, x: `${d * 26}%` }),
  center: { opacity: 1, x: "0%" },
  exit: (d: number) => ({ opacity: 0, x: `${d * -26}%` }),
};

/**
 * Scroll ramp with a pinned tail.
 *
 * A two-point `useTransform` whose output range descends (e.g. [1, 0]) stops
 * clamping once progress passes the end of its input range and begins tracking
 * progress again — so a faded-out element creeps back into view later in the
 * timeline. Appending an explicit terminal keyframe holds the end value for the
 * remainder of the scroll and sidesteps it entirely.
 */
function useRamp(
  p: MotionValue<number>,
  input: [number, number],
  output: [number, number],
) {
  const [i0, i1] = input;
  const [o0, o1] = output;
  const pinned = i1 < 1;
  return useTransform(
    p,
    pinned ? [i0, i1, 1] : [i0, i1],
    pinned ? [o0, o1, o1] : [o0, o1],
  );
}

export function CinematicHero({ className }: { className?: string }) {
  const runwayRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress: p } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  /* ---- cursor: specular sheen on the stage + parallax tilt on the monitor -- */
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tiltX = useSpring(useMotionValue(0), { stiffness: 90, damping: 22, mass: 0.6 });
  const tiltY = useSpring(useMotionValue(0), { stiffness: 90, damping: 22, mass: 0.6 });

  /* Park the sheen at the centre until the pointer first moves — seeded at
     0.5px it would otherwise sit as a stray glow in the top-left corner. */
  useEffect(() => {
    mx.set(window.innerWidth / 2);
    my.set(window.innerHeight / 2);
  }, [mx, my]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = stageRef.current;
        if (el) {
          const r = el.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        tiltY.set(nx * 16);
        tiltX.set(-ny * 12);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [mx, my, tiltX, tiltY, reduced]);

  /* Smoothed so the disc trails the cursor rather than snapping to it. */
  const sheenX = useSpring(mx, { stiffness: 110, damping: 26, mass: 0.5 });
  const sheenY = useSpring(my, { stiffness: 110, damping: 26, mass: 0.5 });

  /* ---- opening act: headline + stage -------------------------------------
     Scale and opacity only. An animated `filter: blur()` over a full-screen
     element repaints it at a new blur radius every frame and was one of the
     two things stalling this scene; scale + fade reads the same. */
  const openScale = useRamp(p, [0, 0.09], [1, 1.14]);
  const openOpacity = useRamp(p, [0, 0.08], [1, 0]);

  /* One `y` across the whole timeline. `y` and `translateY` are the same
     transform in Framer — declaring both silently drops one of them. */
  const stageY = useTransform(
    p,
    [0, 0.09, 0.9, 1],
    ["112vh", "0vh", "0vh", "-118vh"],
  );

  /* The stage is permanently 100vw × 100vh and *scales* between card and
     full-bleed. Animating width/height instead re-runs layout on the entire
     composition every frame — the dominant cost in the first profile.
     Radius is pre-divided by the scale so the corner reads the same size. */
  const stageScale = useTransform(p, [0.07, 0.16, 0.66, 0.78], [0.86, 1, 1, 0.84]);

  /* border-radius is a paint property: animating it continuously repaints the
     full-screen gradient surface (and its shadows) on every frame, which was
     what actually pinned p 0.66-0.80. Quantising to 6px steps drops that from
     ~60 repaints/second to about eight in total, and is indistinguishable. */
  const stageRRaw = useTransform(p, [0.07, 0.16, 0.66, 0.78], [46, 0, 0, 48]);
  const stageR = useTransform(stageRRaw, (v) => `${Math.round(v / 6) * 6}px`);

  /* ---- second act: the product -------------------------------------------
     The monitor begins arriving while the stage is still rising, so the card
     is never on screen as an empty black rectangle. */
  /* Group opacity is fine here *because the subtree is static by now* — the
     monitor's transforms all finish at 0.26, so the browser rasterises it
     once and only composites it at a varying alpha. It was expensive in the
     first profile because the subtree was still moving while it faded, which
     forced a fresh offscreen render every frame. A full-screen veil was the
     other option, but it covers the bone background too and would erase the
     card pull-back. */
  const contentOut = useRamp(p, [0.58, 0.68], [1, 0]);

  const monOpacity = useRamp(p, [0.06, 0.18], [0, 1]);
  const monScale = useRamp(p, [0.06, 0.26], [0.62, 1]);
  const monZ = useRamp(p, [0.06, 0.26], [-520, 0]);
  const monRotX = useRamp(p, [0.06, 0.26], [46, 0]);
  const monRotY = useRamp(p, [0.06, 0.26], [-26, 0]);
  const monY = useRamp(p, [0.06, 0.26], [260, 0]);

  const ringOffset = useRamp(p, [0.2, 0.34], [402, 118]);
  const revenue = useRamp(p, [0.18, 0.34], [0, 23341]);
  const revenueText = useTransform(revenue, (v) =>
    Math.round(v).toLocaleString("en-US"),
  );

  const copyX = useRamp(p, [0.24, 0.36], [-56, 0]);
  const copyOpacity = useRamp(p, [0.24, 0.36], [0, 1]);
  const statsX = useRamp(p, [0.27, 0.39], [56, 0]);
  const statsOpacity = useRamp(p, [0.27, 0.39], [0, 1]);

  const markScale = useRamp(p, [0.1, 0.28], [1.35, 1]);
  /* Ceiling is the final opacity, not 1 — an inline style would override a
     Tailwind opacity class, so the backdrop must be dialled in right here. */
  const markOpacity = useRamp(p, [0.1, 0.28], [0, 0.11]);

  /* ---- closing act: CTA --------------------------------------------------- */
  /* Rising into place rather than scaling up: the heading uses gradient-clipped
     text with two drop-shadow filters, and re-rendering that at a new scale
     each frame is far more expensive than translating a finished raster. */
  const ctaOpacity = useRamp(p, [0.66, 0.76], [0, 1]);
  const ctaY = useRamp(p, [0.66, 0.8], [56, 0]);

  /* A layer at opacity 0 still swallows clicks, so hit-testing follows
     visibility — otherwise the invisible CTA blocks the screen controls
     underneath it for most of the timeline, and vice versa. */
  const compHits = useTransform(p, (v) => (v > 0.18 && v < 0.62 ? "auto" : "none"));
  const ctaHits = useTransform(ctaOpacity, (v) => (v > 0.5 ? "auto" : "none"));

  /* ---- nav fades as the stage takes over ---------------------------------- */
  const navOpacity = useRamp(p, [0, 0.06], [1, 0]);

  /* Reduced motion: skip the cinema, present the composition at rest. */
  if (reduced) {
    return <StaticHero className={className} />;
  }

  return (
    <div id="hero-runway" ref={runwayRef} className={cn("relative h-[640vh]", className)}>
      <div
        className="sticky top-0 h-screen w-full overflow-hidden bg-bone-100"
        style={{ perspective: 1600 }}
      >
        {/* ── environment ─────────────────────────────────────────────── */}
        {/* Opacity only — this layer carries a radial mask, and re-rasterising
            a masked full-screen surface at a new scale each frame is costly
            for an effect nobody perceives on a 68px grid. */}
        <motion.div
          aria-hidden
          className="bg-grid pointer-events-none absolute inset-0 z-0"
          style={{ opacity: openOpacity }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(1100px 620px at 50% -8%, rgba(108,77,105,0.10), transparent 68%)",
          }}
        />

        {/* ── nav ──────────────────────────────────────────────────────── */}
        <motion.div
          role="banner"
          className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 py-6 lg:px-12"
          style={{ opacity: navOpacity }}
        >
          <div className="flex items-center gap-3">
            <Wordmark />
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {["Modules", "Industries", "Deployment"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="rounded-full px-4 py-2 text-[0.9rem] font-medium text-plum-900/65 transition-colors hover:bg-plum-900/5 hover:text-plum-900"
              >
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#demo"
            className="btn-tactile-dark rounded-full px-5 py-2.5 text-[0.88rem] font-semibold"
          >
            Book a demo
          </a>
        </motion.div>

        {/* ── act I: the headline ──────────────────────────────────────── */}
        <motion.div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
          style={{ scale: openScale, opacity: openOpacity, willChange: "transform, opacity" }}
        >
          <Eyebrow>Enterprise resource planning · Offline or cloud</Eyebrow>

          <h1 className="mt-7 max-w-5xl text-balance font-display text-[clamp(2.6rem,6.4vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            <motion.span
              className="text-emboss block"
              initial={{ opacity: 0, y: 54, rotateX: -22, filter: "blur(18px)" }}
              animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            >
              Everything your business
            </motion.span>
            <motion.span
              className="block overflow-hidden pb-[0.12em]"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{ duration: 1.3, ease: [0.83, 0, 0.17, 1], delay: 0.75 }}
            >
              <span className="text-plum-matte">runs on. One system.</span>
            </motion.span>
          </h1>

          <motion.p
            className="mt-8 max-w-xl text-balance text-[1.06rem] leading-relaxed text-plum-900/60"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.1 }}
          >
            Quotations, point of sale, stock, production, the general ledger and
            payroll — connected end to end, on your hardware or in the cloud.
          </motion.p>

          <motion.div
            className="mt-11 flex flex-wrap items-center justify-center gap-3.5"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.28 }}
          >
            <MagneticButton href="#demo" variant="dark">
              Book a live demo
              <ArrowIcon />
            </MagneticButton>
            <MagneticButton href="#modules" variant="light">
              Explore the platform
            </MagneticButton>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 1.5 }}
          >
            {[
              "Double-entry general ledger",
              "Batch & lot traceability",
              "English & العربية",
              "Offline or cloud",
            ].map((t) => (
              <span
                key={t}
                className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-plum-900/40"
              >
                <span className="h-1 w-1 rounded-full bg-plum-600/50" />
                {t}
              </span>
            ))}
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <ScrollCue />
          </motion.div>
        </motion.div>

        {/* ── act II + III: the obsidian stage ─────────────────────────── */}
        <div
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          style={{ perspective: 1600 }}
        >
          <motion.div
            ref={stageRef}
            className="pointer-events-auto relative flex h-screen w-screen items-center justify-center"
            style={{ y: stageY, willChange: "transform" }}
          >
            {/* Surface: the only thing that scales. Clips the sheen + grain. */}
            <motion.div
              aria-hidden
              className="card-obsidian absolute inset-0 overflow-hidden"
              style={{ scale: stageScale, borderRadius: stageR, willChange: "transform" }}
            >
              <motion.div
                aria-hidden
                className="card-sheen"
                style={{ x: sheenX, y: sheenY }}
              />
              <div className="film-grain" aria-hidden />
            </motion.div>

            {/* — the product composition —
                 Back to the original free layout: the monitor is sized off the
                 viewport so the ERP screen stays big and legible. Clearance
                 from the caption is bought by dropping the caption paragraph
                 on short viewports, not by shrinking the hardware. */}
            <motion.div
              className="absolute inset-0"
              style={{ opacity: contentOut, pointerEvents: compHits, willChange: "opacity" }}
            >
              {/* giant wordmark, sitting behind the hardware */}
              <motion.span
                aria-hidden
                className="text-card-matte pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[clamp(5rem,17vw,17rem)] font-bold uppercase leading-none tracking-[-0.06em]"
                style={{ scale: markScale, opacity: markOpacity, y: "-26%" }}
              >
                Quilit
              </motion.span>

              <div className="absolute inset-0 flex items-center justify-center">
                <Monitor
                  opacity={monOpacity}
                  scale={monScale}
                  z={monZ}
                  rotX={monRotX}
                  rotY={monRotY}
                  y={monY}
                  tiltX={tiltX}
                  tiltY={tiltY}
                  p={p}
                  ringOffset={ringOffset}
                  revenueText={revenueText}
                />
              </div>

              {/* caption row: copy left, trust figures right.
                  pointer-events-none is load-bearing — the row is full-width
                  and sits at z-30 over the middle of the stage, so with hit
                  testing on it silently swallowed every click aimed at the
                  screen controls below the monitor. It holds no interactive
                  elements of its own. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-10 px-6 pb-8 lg:px-16 lg:pb-12">
                <motion.div
                  className="max-w-[19rem] lg:max-w-sm"
                  style={{ x: copyX, opacity: copyOpacity }}
                >
                  <h2 className="font-display text-[1.6rem] font-bold leading-tight tracking-[-0.028em] text-white lg:text-[2rem]">
                    The whole operation,
                    <br />
                    <span className="font-serif italic text-plum-300">on one screen.</span>
                  </h2>
                  {/* Height-gated, not width-gated: on a short laptop this
                      paragraph is exactly what the monitor would collide with,
                      and losing it is cheaper than shrinking the screenshot. */}
                  <p className="mt-4 hidden text-[0.95rem] leading-relaxed text-plum-200/60 [@media(min-width:768px)_and_(min-height:940px)]:block">
                    A quotation becomes an invoice, the invoice becomes a payment,
                    the payment posts itself to the ledger. Nothing is typed twice.
                  </p>
                </motion.div>

                <motion.div
                  className="hidden shrink-0 gap-9 lg:flex"
                  style={{ x: statsX, opacity: statsOpacity }}
                >
                  {TRUST.map((s) => (
                    <div key={s.label} className="text-right">
                      <div className="font-mono text-[1.5rem] font-bold leading-none tracking-tight text-white">
                        {s.value}
                      </div>
                      <div className="mt-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-plum-300/50">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>

            {/* — closing CTA — */}
            <motion.div
              className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
              style={{
                opacity: ctaOpacity,
                y: ctaY,
                pointerEvents: ctaHits,
                willChange: "transform, opacity",
              }}
            >
              <Eyebrow tone="dark">Ready when you are</Eyebrow>
              <h2 className="text-card-matte mt-6 max-w-3xl text-balance font-display text-[clamp(2.1rem,5.2vw,4.2rem)] font-bold leading-[1.02] tracking-[-0.035em]">
                See Quilit running your
                <span className="font-serif italic"> actual </span>
                numbers.
              </h2>
              <p className="mt-6 max-w-lg text-balance text-[1.02rem] leading-relaxed text-plum-200/60">
                A forty-minute walkthrough with an engineer, using your own
                chart of accounts and product catalogue.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
                <MagneticButton href="#demo" variant="light">
                  Book a live demo
                  <ArrowIcon />
                </MagneticButton>
                <MagneticButton href="#deployment" variant="glass">
                  See how it deploys
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Monitor — the desktop hardware, with a live screen
   ========================================================================== */

function Monitor({
  opacity,
  scale,
  z,
  rotX,
  rotY,
  y,
  tiltX,
  tiltY,
  p,
  ringOffset,
  revenueText,
}: {
  opacity: MotionValue<number>;
  scale: MotionValue<number>;
  z: MotionValue<number>;
  rotX: MotionValue<number>;
  rotY: MotionValue<number>;
  y: MotionValue<number>;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
  p: MotionValue<number>;
  ringOffset: MotionValue<number>;
  revenueText: MotionValue<string>;
}) {
  /* `dir` drives which way a slide enters/leaves. Auto-advance runs until the
     visitor takes control, then stops for good rather than fighting them. */
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [manual, setManual] = useState(false);

  const go = useCallback((delta: number) => {
    setDir(delta);
    setI((v) => (v + delta + SCREENS.length) % SCREENS.length);
  }, []);

  const take = useCallback(
    (delta: number) => {
      setManual(true);
      go(delta);
    },
    [go],
  );

  useEffect(() => {
    if (manual) return;
    const t = setInterval(() => go(1), 3600);
    return () => clearInterval(t);
  }, [manual, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") take(1);
      else if (e.key === "ArrowLeft") take(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [take]);

  /* Horizontal swipe. Only claims the gesture once movement is clearly
     sideways, so vertical page scrolling is never hijacked on touch. */
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) take(dx < 0 ? 1 : -1);
  };

  const badgeA = useRamp(p, [0.2, 0.29], [0, 1]);
  const badgeAy = useRamp(p, [0.2, 0.29], [70, 0]);
  const badgeB = useRamp(p, [0.23, 0.32], [0, 1]);
  const badgeBy = useRamp(p, [0.23, 0.32], [70, 0]);
  const badgeC = useRamp(p, [0.26, 0.35], [0, 1]);
  const badgeCy = useRamp(p, [0.26, 0.35], [70, 0]);

  return (
    <motion.div
      className="relative z-20 flex items-center justify-center"
      style={{
        opacity,
        scale,
        z,
        rotateX: rotX,
        rotateY: rotY,
        y,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
      }}
    >
      {/* independent cursor parallax, layered on top of the scroll transform */}
      <motion.div
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className="relative"
      >
        {/* screen glow spilling onto the stage */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-24 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(closest-side, rgba(163,127,156,0.28), transparent 72%)",
          }}
        />

        {/* bezel */}
        {/* Wide on phones (a 54vw screenshot is unreadable), settling to a
            true desktop proportion once there is room for the side badges.
            The vh term is a *ceiling*, not the driver: width decides the size
            on any normal window, and the cap only engages on genuinely short
            ones. Driving the size from height instead made the screenshot
            far too small to read. */}
        <div className="monitor-bezel relative w-[92vw] rounded-[18px] p-[8px] pb-[22px] md:w-[min(78vw,calc((100vh-250px)*1.6))] md:p-[10px] md:pb-[26px] xl:w-[min(58vw,860px,calc((100vh-300px)*1.6))]">
          <div
            className="monitor-screen relative aspect-[16/10] w-full touch-pan-y overflow-hidden rounded-[10px]"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <AnimatePresence mode="sync" custom={dir}>
              <motion.div
                key={SCREENS[i].src}
                className="absolute inset-0"
                custom={dir}
                variants={SLIDE}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
              >
                <Image
                  src={SCREENS[i].src}
                  alt={`Quilit ERP — ${SCREENS[i].label}`}
                  fill
                  sizes="(max-width: 1024px) 90vw, 860px"
                  className="object-cover object-top"
                  priority={i === 0}
                />
              </motion.div>
            </AnimatePresence>

            <div className="screen-glare pointer-events-none absolute inset-0 z-20" aria-hidden />

            {/* which module is on screen */}
            <div className="absolute bottom-2 left-2 z-30 flex items-center gap-1.5 rounded-full bg-obsidian-950/70 px-2 py-1 backdrop-blur-md md:bottom-3 md:left-3 md:gap-2 md:px-3 md:py-1.5">
              <span className="h-1 w-1 animate-pulse rounded-full bg-jade-400 shadow-[0_0_8px_rgba(79,185,138,0.9)] md:h-1.5 md:w-1.5" />
              <span className="font-mono text-[0.45rem] uppercase tracking-[0.14em] text-white/70 md:text-[0.6rem] md:tracking-[0.16em]">
                {SCREENS[i].label}
              </span>
            </div>
          </div>

          {/* chin */}
          <div className="absolute inset-x-0 bottom-0 flex h-[26px] items-center justify-center">
            <span className="font-mono text-[0.52rem] uppercase tracking-[0.34em] text-white/25">
              Quilit
            </span>
          </div>
        </div>

        {/* stand */}
        <div className="relative mx-auto -mt-px flex flex-col items-center" aria-hidden>
          <div className="monitor-stand h-[26px] w-[86px] rounded-b-[6px]" />
          <div className="monitor-stand h-[9px] w-[210px] rounded-[5px] shadow-[0_26px_40px_-18px_rgba(0,0,0,0.9)]" />
        </div>

        {/* ── floating glass instrumentation ──
             `z` (translateZ) rather than z-index: inside a preserve-3d
             context the browser sorts by depth, so a z-index alone leaves
             these painted behind the bezel. Lifting them in 3D also gives
             the parallax a genuine sense of layering. */}
        <motion.div
          className="glass-badge absolute right-full top-10 mr-7 hidden w-max items-center gap-3 rounded-2xl p-3.5 xl:flex"
          style={{ opacity: badgeA, y: badgeAy, z: 80 }}
        >
          <IconTile tone="jade">
            <path d="M20 6 9 17l-5-5" />
          </IconTile>
          <div className="pr-1">
            <p className="text-[0.8rem] font-semibold leading-tight text-white">
              Payment posted to ledger
            </p>
            <p className="font-mono text-[0.65rem] text-plum-200/50">
              JE-2026-00382 · balanced
            </p>
          </div>
        </motion.div>

        <motion.div
          className="glass-badge absolute left-full top-6 ml-7 hidden w-max rounded-2xl p-4 xl:block"
          style={{ opacity: badgeC, y: badgeCy, z: 80 }}
        >
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0">
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 144 144" aria-hidden>
                <circle cx="72" cy="72" r="64" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="13" />
                <motion.circle
                  className="progress-ring"
                  cx="72"
                  cy="72"
                  r="64"
                  fill="none"
                  stroke="#A37F9C"
                  strokeWidth="13"
                  strokeDasharray={402}
                  style={{ strokeDashoffset: ringOffset }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[0.78rem] font-bold text-white">71%</span>
              </div>
            </div>
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-plum-300/50">
                Revenue · July
              </p>
              <p className="mt-1 font-mono text-[1.35rem] font-bold leading-none text-white">
                $<motion.span>{revenueText}</motion.span>
              </p>
              <p className="mt-1.5 font-mono text-[0.65rem] text-jade-400">▲ 12.4% vs June</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="glass-badge absolute bottom-4 left-full ml-7 hidden w-max items-center gap-3 rounded-2xl p-3.5 xl:flex"
          style={{ opacity: badgeB, y: badgeBy, z: 80 }}
        >
          <IconTile tone="gold">
            <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </IconTile>
          <div className="pr-1">
            <p className="text-[0.8rem] font-semibold leading-tight text-white">
              4 items below minimum
            </p>
            <p className="font-mono text-[0.65rem] text-plum-200/50">
              Reorder suggested · MAIN
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* ── screen navigation ──
           Outside the tilt wrapper so the controls stay flat and readable
           while the hardware itself parallaxes with the cursor. */}
      <div className="absolute left-1/2 top-full mt-7 flex -translate-x-1/2 items-center gap-4">
        <NavArrow label="Previous screen" onClick={() => take(-1)}>
          <path d="M15 18l-6-6 6-6" />
        </NavArrow>

        <div className="flex items-center gap-2.5">
          {SCREENS.map((s, n) => (
            <button
              key={s.src}
              type="button"
              onClick={() => {
                setManual(true);
                setDir(n > i ? 1 : -1);
                setI(n);
              }}
              aria-label={s.label}
              aria-current={n === i}
              className="group relative h-6 w-6 cursor-pointer"
            >
              <span
                className={cn(
                  "absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300",
                  n === i
                    ? "h-2 w-7 bg-plum-200"
                    : "h-2 w-2 bg-white/25 group-hover:bg-white/50",
                )}
              />
            </button>
          ))}
        </div>

        <NavArrow label="Next screen" onClick={() => take(1)}>
          <path d="M9 18l6-6-6-6" />
        </NavArrow>
      </div>
    </motion.div>
  );
}

function NavArrow({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/12 bg-white/6 text-plum-100/70 transition-colors duration-200 hover:border-white/25 hover:bg-white/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-300"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}

/* ==========================================================================
   Pieces
   ========================================================================== */

function IconTile({
  tone,
  children,
}: {
  tone: "jade" | "gold" | "plum";
  children: React.ReactNode;
}) {
  const tones = {
    jade: "from-jade-400/25 to-jade-400/5 border-jade-400/30 text-jade-400",
    gold: "from-gold-400/25 to-gold-400/5 border-gold-400/30 text-gold-400",
    plum: "from-plum-400/25 to-plum-400/5 border-plum-400/30 text-plum-300",
  }[tone];

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-b shadow-inner",
        tones,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden
      >
        {children}
      </svg>
    </span>
  );
}

function Eyebrow({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 font-mono text-[0.63rem] uppercase tracking-[0.18em] backdrop-blur-sm",
        tone === "light"
          ? "border-plum-900/10 bg-white/60 text-plum-800/70"
          : "border-white/10 bg-white/5 text-plum-200/70",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-jade-400 shadow-[0_0_8px_rgba(79,185,138,0.8)]" />
      {children}
    </motion.span>
  );
}

/** Button that leans toward the cursor, then springs back on exit. */
function MagneticButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "dark" | "light" | "glass";
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const reduced = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.28);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.42);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold tracking-[-0.01em]",
        variant === "dark" && "btn-tactile-dark",
        variant === "light" && "btn-tactile-light",
        variant === "glass" &&
          "glass-badge text-white transition-colors hover:bg-white/10",
      )}
    >
      {children}
    </motion.a>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-plum-500 to-plum-800 text-[0.78rem] font-bold text-white shadow-[0_6px_16px_-4px_rgba(42,29,41,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)]">
        Q
      </span>
      <span className="font-display text-[1.05rem] font-bold tracking-[-0.03em] text-plum-900">
        Quilit
      </span>
    </span>
  );
}

function ScrollCue() {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-plum-900/35">
        Scroll
      </span>
      <span className="relative flex h-9 w-[22px] items-start justify-center rounded-full border border-plum-900/15 p-1.5">
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-plum-600/60"
          animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </div>
  );
}

/* ==========================================================================
   Reduced-motion fallback — same composition, no cinema
   ========================================================================== */

function StaticHero({ className }: { className?: string }) {
  return (
    <div className={cn("relative bg-bone-100 px-6 py-24", className)}>
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-5xl text-center">
        <Eyebrow>Enterprise resource planning · Offline or cloud</Eyebrow>
        <h1 className="mt-7 text-balance font-display text-[clamp(2.4rem,6vw,4.6rem)] font-bold leading-[1] tracking-[-0.035em]">
          <span className="text-emboss block">Everything your business</span>
          <span className="text-plum-matte block">runs on. One system.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-balance text-[1.05rem] leading-relaxed text-plum-900/60">
          Quotations, point of sale, stock, production, the general ledger and
          payroll — connected end to end, on your hardware or in the cloud.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5">
          <a href="#demo" className="btn-tactile-dark rounded-full px-7 py-3.5 text-[0.95rem] font-semibold">
            Book a live demo
          </a>
          <a href="#modules" className="btn-tactile-light rounded-full px-7 py-3.5 text-[0.95rem] font-semibold">
            Explore the platform
          </a>
        </div>
      </div>
      <div className="card-obsidian relative mx-auto mt-16 max-w-6xl overflow-hidden rounded-[32px] p-8 lg:p-14">
        <div className="monitor-bezel relative mx-auto w-full max-w-3xl rounded-[18px] p-[10px]">
          <div className="monitor-screen relative aspect-[16/10] overflow-hidden rounded-[10px]">
            <Image
              src="/screens/dashboard.png"
              alt="Quilit ERP dashboard"
              fill
              sizes="768px"
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
