"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Icon } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { NAV, PAGE, TABS, type ModuleKey } from "./data";
import { useErp } from "./store";
import { PANES, PANE_HINTS } from "./panes";

/* ============================================================================
   The application shell, following the ERP's own sidebar grammar:
   236px white rail, 60px logo block on surface-2 with a plum monogram, items
   grouped into workflow directories, and a solid plum fill on the active item
   (no rail — that is explicitly the pattern the design system moved away from).
   ========================================================================== */

export function ErpDemo() {
  const { state, act } = useErp();
  const [module, setModule] = useState<ModuleKey>("dashboard");
  const [tab, setTab] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const reduced = useReducedMotion();
  const Pane = PANES[module];
  const tabs = TABS[module];
  const ALL = NAV.flatMap((g) => g.items);
  const MODULE_COUNT = ALL.length;
  const current = ALL.find((i) => i.key === module) ?? ALL[0];

  const go = (k: ModuleKey) => {
    setModule(k);
    setTab(0);
    setNavOpen(false);
  };

  /* A write-through toast names the document just created and offers to jump
     to the module it landed in — which is the whole demonstration. */
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
    <div className="erp overflow-hidden rounded-[10px] border border-[var(--rule-strong)] bg-[var(--bg)] shadow-[0_2px_4px_rgba(31,31,46,0.05),0_40px_80px_-46px_rgba(31,31,46,0.45)]">
      {/* ── browser chrome ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-[var(--rule)] bg-[var(--surface-3)] px-3 py-2">
        <span className="flex shrink-0 gap-1.5" aria-hidden>
          {["#E5675E", "#E0B049", "#4FB98A"].map((c) => (
            <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
        </span>
        <span className="mono mx-auto flex min-w-0 items-center gap-1.5 truncate rounded-[4px] bg-[var(--surface)] px-2.5 py-[3px] text-[10.5px] text-[var(--text-3)]">
          <Icon name="lock" className="h-2.5 w-2.5 shrink-0" />
          quilit.app/{module}
        </span>
        {/* Rides in the chrome so it is on screen for every module, not just
            for whoever read the paragraph above the frame. */}
        <span className="erp-badge erp-badge-yellow shrink-0">Demo</span>
      </div>

      {/* On a phone the status bar sits under a 1000px-tall frame, so the one
          line telling you what to try was measured 305px in and effectively
          never read. It belongs above the application on small screens —
          it is demo guidance, not part of the product's chrome. */}
      <div className="flex items-start gap-2 border-b border-[var(--rule)] bg-[color-mix(in_srgb,var(--accent)_7%,transparent)] px-3.5 py-2 sm:hidden">
        <span className="mt-[1px] shrink-0 text-[var(--accent)]">→</span>
        <span className="text-[12px] leading-snug text-[var(--text-2)]">{PANE_HINTS[module]}</span>
      </div>

      <div className="flex min-h-[33rem] flex-col lg:flex-row">
        {/* ── sidebar ─────────────────────────────────────────────────── */}
        <aside className="shrink-0 border-b border-[var(--rule)] bg-[var(--surface)] lg:w-[236px] lg:border-b-0 lg:border-r">
          {/* logo block: 60px, surface-2, hairline bottom rule */}
          <div className="flex h-[60px] items-center gap-2.5 border-b border-[var(--rule)] bg-[var(--surface-2)] px-3.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] text-[11px] font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              QE
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
                Quilit ERP
              </span>
              <span className="mono block text-[10px] uppercase tracking-[0.1em] text-[var(--text-3)]">
                ERP Platform
              </span>
            </span>
          </div>

          {/* Phones get a labelled picker instead of the icon-only disclosure
              this used to be: a bare "+" next to the logo read as "add
              something", not "here are the nine modules", so the rail was
              effectively undiscoverable and the demo looked like one screen. */}
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-label="Choose module"
            className="flex w-full cursor-pointer items-center gap-2 border-b border-[var(--rule)] px-3.5 py-2.5 text-left lg:hidden"
          >
            <Icon name={current.icon} className="h-4 w-4 shrink-0 text-[var(--accent)]" />
            <span className="min-w-0 flex-1">
              <span className="eyebrow block">Module</span>
              <span className="block truncate text-[13.5px] font-semibold text-[var(--ink)]">
                {current.label}
              </span>
            </span>
            <span className="erp-badge erp-badge-purple shrink-0">
              {navOpen ? "Close" : `${MODULE_COUNT} modules`}
            </span>
            <motion.span
              animate={{ rotate: navOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 text-[var(--text-3)]"
            >
              ▾
            </motion.span>
          </button>

          <nav className={cn("p-2 lg:block", navOpen ? "block" : "hidden")}>
            {NAV.map((g) => (
              <div key={g.group || "root"} className="mb-1">
                {g.group && (
                  <div className="eyebrow px-2 pb-1 pt-2">{g.group}</div>
                )}
                {g.items.map((it) => (
                  <button
                    key={it.key}
                    type="button"
                    onClick={() => go(it.key)}
                    aria-current={it.key === module}
                    className={cn("erp-nav-link", it.key === module && "active")}
                  >
                    <Icon name={it.icon} className="h-[15px] w-[15px] shrink-0" />
                    {it.label}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* ── main ────────────────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* topbar */}
          <div className="flex h-[46px] shrink-0 items-center gap-2 border-b border-[var(--rule)] bg-[var(--surface)] px-3.5">
            {/* Redundant on a phone — the module picker directly above already
                names where you are. */}
            <span className="hidden min-w-0 items-center gap-1.5 text-[12.5px] sm:flex">
              <span className="text-[var(--text-3)]">›</span>
              <span className="truncate font-semibold text-[var(--ink)]">{PAGE[module].title}</span>
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              <span className="erp-badge erp-badge-green hidden sm:inline-block">● Live</span>
              <span className="inline-flex overflow-hidden rounded-[6px] border border-[var(--rule-strong)]">
                {(["USD", "LBP"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => act({ type: "currency", value: c })}
                    aria-pressed={state.currency === c}
                    className="cursor-pointer px-2 py-[3px] text-[11.5px] font-semibold transition-colors"
                    style={
                      state.currency === c
                        ? { background: "var(--accent)", color: "#fff" }
                        : { color: "var(--text-3)" }
                    }
                  >
                    {c}
                  </button>
                ))}
              </span>
            </span>
          </div>

          {/* page header + tabs */}
          <div className="shrink-0 border-b border-[var(--rule)] bg-[var(--surface)] px-3.5 pt-3">
            <h3 className="text-[19px] font-bold leading-tight tracking-[-0.022em] text-[var(--ink)]">
              {PAGE[module].title}
            </h3>
            <p className={cn("mt-0.5 text-[12px] text-[var(--text-3)]", tabs.length < 2 ? "pb-3" : "mb-2")}>
              {PAGE[module].sub}
            </p>
            {/* A tab bar of one conveys nothing — several modules have a
                single view, and on a phone that row is pure cost. Rendered
                conditionally rather than hidden with a class: `.erp-tabs`
                sets display:flex and is defined after Tailwind's utilities,
                so at equal specificity it beats `hidden`. */}
            {tabs.length > 1 && (
              <div className="erp-tabs -mx-3.5 overflow-x-auto px-3.5">
                {tabs.map((tb, i) => (
                  <button
                    key={tb.label}
                    type="button"
                    onClick={() => tb.live && setTab(i)}
                    disabled={!tb.live}
                    title={tb.live ? undefined : "Not part of the demo"}
                    className={cn("erp-tab", i === tab && "active", !tb.live && "cursor-not-allowed opacity-40")}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* pane */}
          <div className="min-h-0 flex-1 bg-[var(--bg)] p-3">
            {/* Keyed remount with an enter animation only. `mode="wait"` held
                the outgoing pane on screen for its exit before the new one
                began, putting ~280ms of dead time on every click. */}
            <motion.div
              key={`${module}-${tab}`}
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "transform, opacity" }}
            >
              <Pane s={state} act={act} tab={tab} />
            </motion.div>
          </div>

          {/* status bar + write-through toast */}
          <div className="relative flex shrink-0 items-center gap-2 border-t border-[var(--rule)] bg-[var(--surface-2)] px-3.5 py-2">
            <span className="hidden min-w-0 flex-1 truncate text-[11.5px] text-[var(--text-3)] sm:block">
              {PANE_HINTS[module]}
            </span>
            <span className="flex-1 sm:hidden" />
            <button
              type="button"
              onClick={() => act({ type: "reset" })}
              className="erp-btn erp-btn-ghost shrink-0"
            >
              Reset demo
            </button>

            <AnimatePresence>
              {state.toast && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ willChange: "transform, opacity" }}
                  className="absolute bottom-[calc(100%+0.5rem)] right-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-[8px] px-3 py-2 text-white shadow-[0_16px_36px_-16px_rgba(31,31,46,0.6)]"
                >
                  <span className="absolute inset-0 -z-10 rounded-[8px]" style={{ background: "#1F1F2E" }} />
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] text-[10px]"
                    style={{ background: "var(--affirm)" }}
                  >
                    ✓
                  </span>
                  <span className="min-w-0 text-[12px] leading-snug">{state.toast.text}</span>
                  {state.toast.go && state.toast.go !== module && (
                    <button
                      type="button"
                      onClick={() => {
                        go(state.toast!.go as ModuleKey);
                        act({ type: "dismissToast" });
                      }}
                      className="shrink-0 cursor-pointer rounded-[4px] bg-white/15 px-2 py-[3px] text-[11.5px] font-semibold hover:bg-white/25"
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
