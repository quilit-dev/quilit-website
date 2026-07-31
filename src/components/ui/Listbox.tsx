"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

/* ============================================================================
   Listbox.

   A native <select> cannot be styled below the trigger — the popup is drawn by
   the operating system, so on a dark glass panel you get a system-white menu
   with a system chevron and nothing about it belongs to the page.

   This is the WAI-ARIA button + listbox pattern rather than a div with a click
   handler: a select is a control people drive from the keyboard, and losing
   type-ahead, Home/End and Escape to buy some styling is a bad trade.

     Space / Enter / ↓ / ↑   open (↑/↓ also move once open)
     Home / End              first / last
     a-z                     type-ahead, resets after 600ms of silence
     Enter / Space           commit the highlighted option
     Escape / Tab            close, returning focus to the trigger
   ========================================================================== */

export function Listbox({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  labelledBy,
  className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
  labelledBy?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [drop, setDrop] = useState<"down" | "up">("down");
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const reduced = useReducedMotion();
  const uid = useId();

  const close = useCallback((refocus = true) => {
    setOpen(false);
    setActive(-1);
    if (refocus) btn.current?.focus();
  }, []);

  const openList = useCallback(() => {
    /* Flip upward when the trigger sits low in the window, so the options are
       never drawn off the bottom of the screen. */
    const r = btn.current?.getBoundingClientRect();
    if (r) {
      const needed = Math.min(options.length, 6) * 40 + 16;
      setDrop(window.innerHeight - r.bottom < needed && r.top > needed ? "up" : "down");
    }
    setActive(Math.max(0, options.indexOf(value)));
    setOpen(true);
  }, [options, value]);

  /* Pointer-down rather than click: a click listener fires after the browser
     has already moved focus, which makes the closing feel a frame late. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!btn.current?.contains(t) && !list.current?.contains(t)) close(false);
    };
    const onScroll = () => close(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("resize", onScroll);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, close]);

  useEffect(() => {
    if (open) list.current?.focus();
  }, [open]);

  function onKey(e: React.KeyboardEvent) {
    const last = options.length - 1;

    if (!open) {
      if ([" ", "Enter", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        close();
        return;
      case "Tab":
        close(false);
        return;
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (i >= last ? 0 : i + 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (i <= 0 ? last : i - 1));
        return;
      case "Home":
        e.preventDefault();
        setActive(0);
        return;
      case "End":
        e.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        if (active >= 0) {
          onChange(options[active]);
          close();
        }
        return;
    }

    if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      typed.current.text = now - typed.current.at > 600 ? e.key : typed.current.text + e.key;
      typed.current.at = now;
      const q = typed.current.text.toLowerCase();
      const hit = options.findIndex((o) => o.toLowerCase().startsWith(q));
      if (hit >= 0) setActive(hit);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        ref={btn}
        id={id}
        type="button"
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy ? `${labelledBy} ${id}` : undefined}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left",
          "text-[0.95rem] outline-none transition-colors duration-200",
          "bg-white/[0.04] hover:bg-white/[0.07] focus-visible:border-plum-300/60",
          open ? "border-plum-300/60 bg-white/[0.07]" : "border-white/12",
          value ? "text-white" : "text-plum-300/45",
        )}
      >
        <span className="truncate">{value || placeholder}</span>
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 shrink-0 text-plum-300/70"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={list}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={active >= 0 ? `${uid}-${active}` : undefined}
            onKeyDown={onKey}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: drop === "down" ? -6 : 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: drop === "down" ? -4 : 4, scale: 0.99 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: "transform, opacity" }}
            className={cn(
              "absolute z-50 max-h-[15rem] w-full overflow-auto rounded-xl border border-white/12 p-1.5",
              "bg-obsidian-800/95 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.75)] outline-none backdrop-blur-xl",
              drop === "down" ? "top-[calc(100%+0.35rem)]" : "bottom-[calc(100%+0.35rem)]",
            )}
          >
            {options.map((o, i) => {
              const selected = o === value;
              return (
                <li
                  key={o}
                  id={`${uid}-${i}`}
                  role="option"
                  aria-selected={selected}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => {
                    onChange(o);
                    close();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2",
                    "text-[0.92rem] transition-colors duration-150",
                    i === active ? "bg-plum-500/30 text-white" : "text-plum-100/75",
                  )}
                >
                  <span className="truncate">{o}</span>
                  {selected && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0 text-plum-200" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
