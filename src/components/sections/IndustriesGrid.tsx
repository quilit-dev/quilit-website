"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimationFrame,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import { Icon, type IconName } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/* ============================================================================
   IMAGE MANIFEST

   Drop photographs into  public/industries/  using these filenames. Any
   extension the server component lists works (.jpg .jpeg .png .webp .avif) —
   the real filename found on disk is what gets requested.

     grocery.jpg         supermarket aisle or checkout, shelves stocked
     pharmacy.jpg        dispensary counter or medicine shelving
     clothing.jpg        boutique rail, fitting area or folded display
     electronics.jpg     device display wall or service counter
     hospitality.jpg     café or restaurant service, warm light
     manufacturing.jpg   production floor, machinery or assembly
     construction.jpg    site in progress, materials or crew
     distribution.jpg    loading bay, pallets, delivery vehicles
     warehousing.jpg     racking and aisles, forklift optional
     services.jpg        office or studio, people at desks
     education.jpg       campus, classroom or admin office
     automotive.jpg      workshop bay, parts counter
     finance.jpg         advisor desk, ledgers or a meeting over figures
     real-estate.jpg     property exterior, keys or a handover

   Portrait 3:4, at least 900x1200, JPG, under ~350 KB each. The card is a tall
   portrait tile, so landscape photography crops hard — keep the subject in the
   upper two thirds, because the lower third carries the caption behind a dark
   scrim. Anything missing renders a plum plate with the industry's icon.
   ========================================================================== */

type Industry = {
  key: string;
  name: string;
  note: string;
  icon: IconName;
  modules: string[];
};

const INDUSTRIES: Industry[] = [
  { key: "grocery", name: "Grocery & supermarkets", note: "Barcode checkout with expiry-aware stock", icon: "cart", modules: ["POS", "Lots", "Cash"] },
  { key: "pharmacy", name: "Pharmacy", note: "Batch and expiry traceable to the sale", icon: "heart", modules: ["Lots", "POS", "Audit"] },
  { key: "clothing", name: "Clothing & fashion", note: "Size and colour variants from one product", icon: "layers", modules: ["Variants", "POS"] },
  { key: "electronics", name: "Electronics", note: "Serial-tracked stock and parts counters", icon: "cpu", modules: ["Inventory", "POS"] },
  { key: "hospitality", name: "Cafés & restaurants", note: "Fast checkout with consumables behind it", icon: "book2", modules: ["POS", "Inventory"] },
  { key: "manufacturing", name: "Manufacturing", note: "Recipes, quality control and batch cost", icon: "factory", modules: ["Manufacturing", "Lots"] },
  { key: "construction", name: "Construction", note: "Job costing that reconciles to the ledger", icon: "cone", modules: ["Projects", "Purchases"] },
  { key: "distribution", name: "Distribution", note: "Multi-warehouse stock with landed cost", icon: "truck", modules: ["Warehouses", "Suppliers"] },
  { key: "warehousing", name: "Warehousing", note: "FEFO picking and per-branch reporting", icon: "warehouse", modules: ["Warehouses", "Reports"] },
  { key: "services", name: "Professional services", note: "Billable projects against quoted budgets", icon: "briefcase", modules: ["Projects", "Quotations"] },
  { key: "education", name: "Education", note: "Fee invoicing, payroll and asset registers", icon: "book", modules: ["Invoices", "HR"] },
  { key: "automotive", name: "Workshops & parts", note: "Parts stock against job cards and invoices", icon: "wrench", modules: ["Inventory", "POS"] },
  { key: "finance", name: "Finance & accounting", note: "Double-entry books that close on time", icon: "landmark", modules: ["Accounting", "Reports"] },
  { key: "real-estate", name: "Real estate", note: "Units, tenants and recurring rent", icon: "building", modules: ["Invoices", "Recurring", "Assets"] },
];

const ROW_A = INDUSTRIES.slice(0, 7);
const ROW_B = INDUSTRIES.slice(7);
const EASE = [0.16, 1, 0.3, 1] as const;

/* Card geometry has to be known in JS, not just CSS, because each card's
   rotation is derived from where its centre sits relative to the viewport. */
const CARD = { w: 272, gap: 20, wSm: 220, gapSm: 16 };

export function IndustriesGrid({ images }: { images: Record<string, string> }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="mt-16 space-y-4">
        {[ROW_A, ROW_B].map((row, i) => (
          <div key={i} className="flex gap-4 overflow-x-auto pb-2">
            {row.map((ind) => (
              <Card key={ind.key} industry={ind} imageSrc={images[ind.key]} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-5 lg:space-y-6">
      <Row items={ROW_A} images={images} direction={-1} speed={26} />
      <Row items={ROW_B} images={images} direction={1} speed={22} />
    </div>
  );
}

/**
 * A drifting 3D coverflow rail.
 *
 * The track carries one composited `x` for every card at once. Each card then
 * derives its own rotateY and depth from that single value, so turning the
 * cards costs arithmetic rather than layout.
 *
 * Mouse: drag scrolls it directly and throws it on release; horizontal wheel
 * nudges it. Vertical wheel is deliberately left alone — hijacking it would
 * trap the visitor in the section.
 */
function Row({
  items,
  images,
  direction,
  speed,
}: {
  items: Industry[];
  images: Record<string, string>;
  direction: 1 | -1;
  speed: number;
}) {
  const x = useMotionValue(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState(0);       // viewport width, for centring
  const [step, setStep] = useState(CARD.w + CARD.gap);
  const velocity = useRef(0);                  // px/s, eased toward the target
  const slow = useRef(false);
  const dragging = useRef(false);
  const last = useRef({ x: 0, t: 0 });

  useEffect(() => {
    const measure = () => {
      const el = viewportRef.current;
      if (!el) return;
      setWidth(el.offsetWidth);
      const small = window.innerWidth < 640;
      setStep(small ? CARD.wSm + CARD.gapSm : CARD.w + CARD.gap);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useAnimationFrame((_, delta) => {
    if (dragging.current) return;                 // the pointer owns x
    const setWidthPx = setRef.current?.offsetWidth ?? 0;
    if (!setWidthPx || delta > 100) return;       // ignore the backgrounded-tab jump

    const target = (slow.current ? speed * 0.12 : speed) * direction;
    velocity.current += (target - velocity.current) * 0.045;

    let next = x.get() + velocity.current * (delta / 1000);
    if (next <= -setWidthPx) next += setWidthPx;
    if (next >= 0) next -= setWidthPx;
    x.set(next);
  });

  /* ---- pointer drag ---- */
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    last.current = { x: e.clientX, t: performance.now() };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - last.current.x;
    const now = performance.now();
    const dt = Math.max(1, now - last.current.t);
    velocity.current = (dx / dt) * 1000;          // carried into the throw
    last.current = { x: e.clientX, t: now };

    const setWidthPx = setRef.current?.offsetWidth ?? 0;
    let next = x.get() + dx;
    if (setWidthPx) {
      if (next <= -setWidthPx) next += setWidthPx;
      if (next >= 0) next -= setWidthPx;
    }
    x.set(next);
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    // clamp the throw so a hard flick cannot fling it out of control
    velocity.current = Math.max(-1800, Math.min(1800, velocity.current));
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  /* ---- horizontal wheel only ---- */
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // let the page scroll
    const setWidthPx = setRef.current?.offsetWidth ?? 0;
    let next = x.get() - e.deltaX;
    if (setWidthPx) {
      if (next <= -setWidthPx) next += setWidthPx;
      if (next >= 0) next -= setWidthPx;
    }
    x.set(next);
  };

  return (
    <div
      ref={viewportRef}
      className="marquee-mask cursor-grab overflow-hidden active:cursor-grabbing"
      onMouseEnter={() => (slow.current = true)}
      onMouseLeave={() => (slow.current = false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
    >
      {/* Perspective sits here, not on the clipping element: an element that
          both clips and declares preserve-3d flattens its children. */}
      <div style={{ perspective: 1500 }} className="py-8">
        <motion.div
          className="flex w-max gap-4 lg:gap-5"
          style={{ x, transformStyle: "preserve-3d" }}
        >
          {/* first set is measured for the wrap distance */}
          <div ref={setRef} className="flex gap-4 pr-4 lg:gap-5 lg:pr-5" style={{ transformStyle: "preserve-3d" }}>
            {items.map((ind, i) => (
              <Card3D
                key={ind.key}
                industry={ind}
                imageSrc={images[ind.key]}
                index={i}
                x={x}
                step={step}
                viewport={width}
                float={i % 4}
              />
            ))}
          </div>
          <div className="flex gap-4 pr-4 lg:gap-5 lg:pr-5" aria-hidden style={{ transformStyle: "preserve-3d" }}>
            {items.map((ind, i) => (
              <Card3D
                key={ind.key + "-2"}
                industry={ind}
                imageSrc={images[ind.key]}
                index={i + items.length}
                x={x}
                step={step}
                viewport={width}
                float={i % 4}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Wraps a card in the depth transform derived from its position on screen. */
function Card3D({
  industry,
  imageSrc,
  index,
  x,
  step,
  viewport,
  float,
}: {
  industry: Industry;
  imageSrc?: string;
  index: number;
  x: MotionValue<number>;
  step: number;
  viewport: number;
  float: number;
}) {
  /** Signed distance of this card's centre from the middle of the viewport. */
  const offset = useTransform(x, (v) => {
    if (!viewport) return 0;
    return index * step + step / 2 + v - viewport / 2;
  });

  const rotateY = useTransform(offset, (d) =>
    viewport ? Math.max(-38, Math.min(38, (-d / viewport) * 78)) : 0,
  );
  const z = useTransform(offset, (d) =>
    viewport ? -Math.min(200, Math.abs(d) * 0.26) : 0,
  );
  /* The float and the 3D transform must live on separate elements. A CSS
     animation on `transform` outranks an inline style in the cascade, so
     putting `.floaty` on the same node silently erased rotateY and translateZ
     — the cards sat perfectly flat with the depth maths running underneath. */
  return (
    <div
      className={cn(
        "floaty shrink-0",
        float === 1 && "floaty-1",
        float === 2 && "floaty-2",
        float === 3 && "floaty-3",
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        style={{ rotateY, z, transformStyle: "preserve-3d", willChange: "transform" }}
      >
        <Card industry={industry} imageSrc={imageSrc} />
      </motion.div>
    </div>
  );
}

function Card({ industry, imageSrc }: { industry: Industry; imageSrc?: string }) {
  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.04, y: -8 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative isolate h-[292px] w-[220px] select-none overflow-hidden rounded-[22px] border border-white/10 bg-obsidian-800 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.95)] sm:h-[360px] sm:w-[272px]"
    >
      <div className="absolute inset-0 -z-10">
        {imageSrc ? (
          <motion.div
            className="absolute inset-0"
            variants={{ rest: { scale: 1 }, hover: { scale: 1.09 } }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <Image
              src={imageSrc}
              alt=""
              fill
              sizes="272px"
              className="object-cover"
              draggable={false}
            />
          </motion.div>
        ) : (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 25% 0%, #43303F 0%, transparent 60%), linear-gradient(160deg, #241A23 0%, #120C11 100%)",
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-plum-300/12">
              <Icon name={industry.icon} className="h-20 w-20" />
            </span>
          </div>
        )}
      </div>

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-obsidian-950/95 via-obsidian-950/40 to-transparent"
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-tr from-plum-800/50 to-transparent"
        variants={{ rest: { opacity: 0.55 }, hover: { opacity: 0.9 } }}
        transition={{ duration: 0.45, ease: EASE }}
      />

      <div className="relative flex h-full flex-col justify-end p-5">
        <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/14 bg-white/10 text-white">
          <Icon name={industry.icon} className="h-[17px] w-[17px]" />
        </span>
        <h3 className="font-display text-[1rem] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[1.12rem]">
          {industry.name}
        </h3>
        <p className="mt-1.5 text-[0.78rem] leading-relaxed text-white/60 sm:text-[0.8rem]">
          {industry.note}
        </p>
        <motion.div
          className="mt-3.5 flex flex-wrap gap-1.5"
          variants={{ rest: { opacity: 0.5, y: 6 }, hover: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {industry.modules.map((m) => (
            <span
              key={m}
              className="rounded-md border border-white/12 bg-white/12 px-2 py-0.5 font-mono text-[0.53rem] uppercase tracking-[0.1em] text-white/80"
            >
              {m}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.article>
  );
}
