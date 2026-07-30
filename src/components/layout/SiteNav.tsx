"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Modules", href: "#modules" },
  { label: "How it works", href: "#workflow" },
  { label: "Product", href: "#showcase" },
  { label: "Industries", href: "#industries" },
  { label: "Deployment", href: "#deployment" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Appears only once the hero's pinned runway is behind you — the hero carries
 * its own nav for that stretch, and two of them on screen at once reads as a
 * bug. Threshold is measured off the hero element rather than hard-coded so it
 * survives changes to the runway length.
 */
export function SiteNav() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => {
    const hero = document.getElementById("hero-runway");
    const threshold = hero
      ? hero.offsetTop + hero.offsetHeight - window.innerHeight * 1.2
      : window.innerHeight * 5;
    setShow(v > threshold);
    if (v <= threshold) setOpen(false);
  });

  return (
    <AnimatePresence>
      {show && (
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
        >
          <nav className="mx-auto flex max-w-[76rem] items-center gap-4 rounded-full border border-plum-900/8 bg-bone-50/95 px-4 py-2.5 shadow-[0_16px_40px_-18px_rgba(42,29,41,0.28)] backdrop-blur-xl">
            <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="Quilit ERP, back to top">
              <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-gradient-to-br from-plum-500 to-plum-800 text-[0.72rem] font-bold text-white shadow-[0_5px_14px_-4px_rgba(42,29,41,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)]">
                Q
              </span>
              <span className="font-display text-[1rem] font-bold tracking-[-0.03em] text-plum-950">
                Quilit
              </span>
            </a>

            <div className="mx-auto hidden items-center gap-0.5 md:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-[0.88rem] font-medium text-plum-900/60 transition-colors hover:bg-plum-900/5 hover:text-plum-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-500"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2 md:ml-0">
              <a
                href="#demo"
                className="btn-tactile-dark rounded-full px-5 py-2.5 text-[0.86rem] font-semibold"
              >
                Book a demo
              </a>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-plum-900/10 text-plum-900/70 transition-colors hover:bg-plum-900/5 md:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className="h-4 w-4" aria-hidden>
                  {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
                </svg>
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24 }}
                className="mx-auto mt-2 max-w-[76rem] overflow-hidden rounded-3xl border border-plum-900/8 bg-bone-50/98 p-2 shadow-[0_20px_50px_-20px_rgba(42,29,41,0.3)] backdrop-blur-xl md:hidden"
              >
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-2xl px-4 py-3 text-[0.95rem] font-medium text-plum-900/75",
                      "transition-colors hover:bg-plum-900/5 hover:text-plum-950",
                    )}
                  >
                    {l.label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
