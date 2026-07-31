"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { NAV, type ModuleKey } from "./data";
import { useErp } from "./store";
import { PANES, PANE_HINTS } from "./panes";
import { Segmented } from "./ui";

/* ============================================================================
   The application shell.

   Everything inside this frame is real: the sidebar switches panes, the panes
   read one store, and an action in one writes to the others. It is a replica
   of the product's chrome rather than of this site's styling, because a
   visitor is here to judge the software, not the marketing.
   ========================================================================== */

export function ErpDemo() {
  const { state, act } = useErp();
  const [module, setModule] = useState<ModuleKey>("dashboard");
  const [navOpen, setNavOpen] = useState(false);
  const reduced = useReducedMotion();
  const Pane = PANES[module];

  /* A write-through toast names the document that was just created and offers
     to jump to the module it landed in — which is the whole demonstration. */
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!state.toast) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => act({ type: "dismissToast" }), 6000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [state.toast, act]);

  return (
    <div className="overflow-hidden rounded-[20px] border border-plum-900/10 bg-bone-100 shadow-[0_2px_4px_rgba(42,29,41,0.04),0_48px_90px_-50px_rgba(42,29,41,0.55)]">
      {/* ── window chrome ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-plum-900/8 bg-bone-200/70 px-3.5 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          {["#E5675E", "#E0B049", "#4FB98A"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-white/70 px-3 py-1 font-mono text-[0.6rem] text-plum-900/40">
          <Icon name="lock" className="h-2.5 w-2.5" />
          quilit.app / {module}
        </span>
      </div>

      <div className="flex min-h-[34rem] flex-col lg:flex-row">
        {/* ── sidebar ─────────────────────────────────────────────────── */}
        <aside className="shrink-0 border-b border-plum-900/8 bg-white lg:w-[13.5rem] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-3.5 py-3">
            <span className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-plum-500 to-plum-800 text-[0.6rem] font-bold text-white">
                QE
              </span>
              <span>
                <span className="block font-display text-[0.86rem] font-bold leading-none text-plum-950">
                  Quilit ERP
                </span>
                <span className="mt-0.5 block font-mono text-[0.5rem] uppercase tracking-[0.14em] text-plum-900/35">
                  Erp platform
                </span>
              </span>
            </span>
            {/* The rail becomes a disclosure on phones — nine modules stacked
                would push the actual screen a screenful down the page. */}
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              aria-expanded={navOpen}
              aria-label="Toggle module list"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-plum-900/10 text-plum-900/50 lg:hidden"
            >
              <Icon name={navOpen ? "minus" : "plus"} className="h-3.5 w-3.5" />
            </button>
          </div>

          <nav
            className={cn(
              "px-2 pb-3 lg:block lg:max-h-none lg:overflow-visible",
              navOpen ? "block" : "hidden",
            )}
          >
            {NAV.map((g) => (
              <div key={g.group || "root"} className="mb-1.5">
                {g.group && (
                  <div className="px-2 pb-1 pt-2 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-plum-900/30">
                    {g.group}
                  </div>
                )}
                {g.items.map((it) => {
                  const on = it.key === module;
                  return (
                    <button
                      key={it.key}
                      type="button"
                      onClick={() => {
                        setModule(it.key);
                        setNavOpen(false);
                      }}
                      aria-current={on}
                      className={cn(
                        "relative flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[0.82rem] font-medium transition-colors duration-200",
                        on ? "text-white" : "text-plum-900/60 hover:bg-plum-900/4 hover:text-plum-900",
                      )}
                    >
                      {on && (
                        <motion.span
                          layoutId="erp-nav"
                          className="absolute inset-0 rounded-lg bg-gradient-to-b from-plum-600 to-plum-800"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <Icon name={it.icon} className="relative h-[15px] w-[15px] shrink-0" />
                      <span className="relative">{it.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── main ────────────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* topbar */}
          <div className="flex items-center gap-3 border-b border-plum-900/8 bg-white px-4 py-2.5">
            <span className="flex min-w-0 items-center gap-1.5 text-[0.8rem] text-plum-900/40">
              <Icon name="grid" className="h-3.5 w-3.5" />
              <span className="text-plum-900/25">/</span>
              <span className="truncate font-semibold text-plum-900">
                {NAV.flatMap((g) => g.items).find((i) => i.key === module)?.label}
              </span>
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-md border border-jade-500/25 bg-jade-500/10 px-2 py-1 text-[0.66rem] font-semibold text-jade-700 sm:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade-500" />
                Live
              </span>
              <Segmented
                options={["USD", "LBP"] as const}
                value={state.currency}
                onChange={(v) => act({ type: "currency", value: v })}
                idPrefix="cur"
              />
            </span>
          </div>

          {/* pane */}
          <div className="relative min-h-0 flex-1 bg-bone-100 p-4 lg:p-5">
            {/* Keyed remount with an enter animation only — no AnimatePresence.
                `mode="wait"` held the outgoing pane on screen for its exit
                before the new one began, putting ~280ms of dead time on every
                click and doubling the mounted DOM through the overlap. An
                application that answers instantly is the point being made. */}
            <motion.div
              key={module}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform, opacity" }}
            >
              <Pane s={state} act={act} />
            </motion.div>
          </div>

          {/* hint strip + write-through toast */}
          <div className="relative flex items-center gap-2 border-t border-plum-900/8 bg-white px-4 py-2.5">
            <span className="min-w-0 flex-1 truncate text-[0.74rem] text-plum-900/45">
              {PANE_HINTS[module]}
            </span>
            <button
              type="button"
              onClick={() => act({ type: "reset" })}
              className="shrink-0 cursor-pointer font-mono text-[0.64rem] uppercase tracking-[0.12em] text-plum-900/35 transition-colors hover:text-plum-700"
            >
              Reset demo
            </button>

            <AnimatePresence>
              {state.toast && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  style={{ willChange: "transform, opacity" }}
                  className="absolute bottom-[calc(100%+0.6rem)] right-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-2.5 rounded-xl border border-plum-900/10 bg-obsidian-900 px-3 py-2.5 text-white shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-jade-500/20 text-jade-400">
                    <Icon name="check" className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 text-[0.76rem] leading-snug">{state.toast.text}</span>
                  {state.toast.go && state.toast.go !== module && (
                    <button
                      type="button"
                      onClick={() => {
                        setModule(state.toast!.go as ModuleKey);
                        act({ type: "dismissToast" });
                      }}
                      className="shrink-0 cursor-pointer rounded-lg bg-white/10 px-2.5 py-1 text-[0.7rem] font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      Show me
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
