"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LBP_RATE, type InvoiceStatus, type QuoteStatus } from "./data";

/* ============================================================================
   The small vocabulary every pane is built from — matched to the real
   application's chrome rather than to this site's marketing style, because
   the point of the demo is that it looks like the product.
   ========================================================================== */

export function Money({
  value,
  currency,
  className,
}: {
  value: number;
  currency: "USD" | "LBP";
  className?: string;
}) {
  const text =
    currency === "USD"
      ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `LL ${Math.round(value * LBP_RATE).toLocaleString("en-US")}`;
  return <span className={cn("font-mono tabular-nums", className)}>{text}</span>;
}

const STATUS_TONES: Record<string, string> = {
  Paid: "border-jade-500/25 bg-jade-500/10 text-jade-700",
  Unpaid: "border-red-500/25 bg-red-500/8 text-red-600",
  Void: "border-plum-900/12 bg-plum-900/5 text-plum-900/45",
  Sent: "border-plum-600/25 bg-plum-600/8 text-plum-700",
  Draft: "border-plum-900/12 bg-plum-900/5 text-plum-900/50",
  Converted: "border-jade-500/25 bg-jade-500/10 text-jade-700",
  "In progress": "border-plum-600/25 bg-plum-600/8 text-plum-700",
  Queued: "border-plum-900/12 bg-plum-900/5 text-plum-900/50",
  "QC hold": "border-gold-500/30 bg-gold-500/10 text-gold-700",
  Low: "border-gold-500/30 bg-gold-500/10 text-gold-700",
  "In stock": "border-jade-500/25 bg-jade-500/10 text-jade-700",
  Out: "border-red-500/25 bg-red-500/8 text-red-600",
};

export function Pill({
  children,
  status,
}: {
  children?: React.ReactNode;
  status: InvoiceStatus | QuoteStatus | string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md border px-2 py-[3px] text-[0.7rem] font-semibold",
        STATUS_TONES[status] ?? STATUS_TONES.Draft,
      )}
    >
      {children ?? status}
    </span>
  );
}

/** Page title block, mirroring the application's header. */
export function PaneHead({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-[1.35rem] font-bold tracking-[-0.026em] text-plum-950">
          {title}
        </h3>
        {sub && <p className="mt-0.5 text-[0.78rem] text-plum-900/45">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Every table lives in one of these: it scrolls inside itself so a dense
    grid can never widen the page on a phone. */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-plum-900/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left">{children}</table>
      </div>
    </div>
  );
}

export function Th({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-plum-900/8 bg-bone-50 px-3 py-2.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-plum-900/40",
        right && "text-right",
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  right,
  className,
}: {
  children: React.ReactNode;
  right?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "whitespace-nowrap border-b border-plum-900/5 px-3 py-2.5 text-[0.82rem] text-plum-900/75",
        right && "text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-plum-900/8 bg-white p-4 shadow-[0_1px_2px_rgba(42,29,41,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Kpi({
  label,
  children,
  note,
  tone = "plum",
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
  tone?: "plum" | "jade" | "red" | "gold";
}) {
  const tones = {
    plum: "text-plum-700",
    jade: "text-jade-600",
    red: "text-red-600",
    gold: "text-gold-600",
  }[tone];
  return (
    <Card>
      <div className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
        {label}
      </div>
      <div className={cn("mt-2 text-[1.3rem] font-bold leading-none", tones)}>{children}</div>
      {note && <div className="mt-1.5 text-[0.72rem] text-plum-900/40">{note}</div>}
    </Card>
  );
}

/** The demo's only button. `primary` is the plum action the app uses for the
    one thing worth doing on a screen. */
export function Btn({
  children,
  onClick,
  variant = "ghost",
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "jade";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(
        "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-600",
        disabled && "cursor-not-allowed opacity-40",
        variant === "primary" &&
          "bg-gradient-to-b from-plum-600 to-plum-800 text-white shadow-[0_6px_14px_-6px_rgba(42,29,41,0.6),inset_0_1px_1px_rgba(255,255,255,0.22)] hover:from-plum-500 hover:to-plum-700",
        variant === "jade" &&
          "bg-jade-600 text-white shadow-[0_6px_14px_-6px_rgba(16,90,62,0.6)] hover:bg-jade-500",
        variant === "ghost" &&
          "border border-plum-900/12 bg-white text-plum-900/70 hover:border-plum-600/30 hover:text-plum-800",
      )}
    >
      {children}
    </motion.button>
  );
}

/** Segmented control — the USD/LBP switch and the status filters. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  idPrefix,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  idPrefix: string;
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-plum-900/10 bg-bone-50 p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={o === value}
          className={cn(
            "relative cursor-pointer rounded-[6px] px-2.5 py-1 text-[0.74rem] font-semibold transition-colors duration-200",
            o === value ? "text-white" : "text-plum-900/50 hover:text-plum-800",
          )}
        >
          {o === value && (
            <motion.span
              layoutId={`${idPrefix}-seg`}
              className="absolute inset-0 rounded-[6px] bg-gradient-to-b from-plum-600 to-plum-800"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            />
          )}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

/** Thin progress bar. scaleX only — width would relayout each frame. */
export function Bar({ pct, tone = "plum" }: { pct: number; tone?: "plum" | "jade" | "gold" }) {
  const tones = { plum: "bg-plum-600", jade: "bg-jade-500", gold: "bg-gold-500" }[tone];
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-plum-900/8">
      <motion.span
        className={cn("block h-full origin-left rounded-full", tones)}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0, Math.min(1, pct / 100)) }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ willChange: "transform" }}
      />
    </span>
  );
}
