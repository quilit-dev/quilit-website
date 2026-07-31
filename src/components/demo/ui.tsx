"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { LBP_RATE } from "./data";

/* ============================================================================
   Workspace primitives.

   These mirror the ERP's own component classes (.card, .table-wrap, .badge,
   .btn, .tabs) rather than this site's styling — see the `.erp` block in
   globals.css, ported from the application's design system.
   ========================================================================== */

/** Figures are mono, tabular, and right-aligned in cells. */
export function Money({
  value,
  currency,
  className,
  blankIfZero,
}: {
  value: number;
  currency: "USD" | "LBP";
  className?: string;
  /** The application prints an empty cell rather than a zero in ledger
      columns, which is what makes a trial balance readable. */
  blankIfZero?: boolean;
}) {
  if (blankIfZero && !value) return <span className={className} />;
  const text =
    currency === "USD"
      ? `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `LL ${Math.round(value * LBP_RATE).toLocaleString("en-US")}`;
  return <span className={cn("mono", className)}>{text}</span>;
}

/* The application's six badge modifiers, mapped to its status vocabulary. */
const BADGE: Record<string, string> = {
  Paid: "green",
  Balanced: "green",
  Completed: "green",
  Accepted: "green",
  Received: "green",
  Active: "green",
  OK: "green",
  posted: "green",
  Unpaid: "red",
  Overdue: "red",
  reversed: "red",
  "At Risk": "red",
  Partial: "yellow",
  Low: "yellow",
  "On Hold": "yellow",
  "Pending Approval": "yellow",
  Fair: "yellow",
  Sent: "blue",
  "In Progress": "blue",
  Invoiced: "purple",
  Draft: "gray",
  Void: "gray",
  Voided: "gray",
  Cancelled: "gray",
};

export function Badge({ status, children }: { status: string; children?: React.ReactNode }) {
  return (
    <span className={`erp-badge erp-badge-${BADGE[status] ?? "gray"}`}>{children ?? status}</span>
  );
}

/* ---- page + card scaffolding -------------------------------------------- */

export function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-[19px] font-bold leading-tight tracking-[-0.022em] text-[var(--ink)]">
        {title}
      </h3>
      {sub && <p className="mt-0.5 text-[12.5px] text-[var(--text-3)]">{sub}</p>}
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  className,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("erp-card min-w-0", className)}>
      {(title || actions) && (
        <div className="erp-card-header">
          <span className="erp-card-title">{title}</span>
          {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/** Filter strip under a card header — the application's standard control row. */
export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--rule)] px-3.5 py-2">
      {children}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  width = 150,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: number;
}) {
  return (
    <input
      className="erp-input min-w-0"
      style={{ width }}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  width = 150,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  width?: number;
}) {
  return (
    <select
      className="erp-input cursor-pointer"
      style={{ width }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ---- table --------------------------------------------------------------- */

/** Scrolls inside itself so a dense grid can never widen the page. */
export function TableWrap({
  children,
  min = "44rem",
}: {
  children: React.ReactNode;
  min?: string;
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className="erp-table" style={{ minWidth: min }}>
        {children}
      </table>
    </div>
  );
}

/** Header cell that actually sorts, with the application's ▲/▼ indicator. */
export function SortableTh<K extends string>({
  label,
  sortKey,
  sort,
  dir,
  onSort,
  right,
}: {
  label: string;
  sortKey: K;
  sort: K;
  dir: "asc" | "desc";
  onSort: (k: K) => void;
  right?: boolean;
}) {
  const on = sort === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className={cn("cursor-pointer select-none hover:text-[var(--text-2)]", right && "text-right")}
      aria-sort={on ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      {label}
      <span className={cn("ml-1", on ? "text-[var(--accent)]" : "opacity-25")}>
        {on ? (dir === "asc" ? "▲" : "▼") : "▲"}
      </span>
    </th>
  );
}

/** Generic client-side sort, matching the application's comparator. */
export function useSort<T, K extends string>(rows: T[], initial: K, get: (r: T, k: K) => unknown) {
  const [sort, setSort] = React.useState<K>(initial);
  const [dir, setDir] = React.useState<"asc" | "desc">("asc");
  const onSort = React.useCallback(
    (k: K) => {
      setSort((prev) => {
        if (prev === k) {
          setDir((d) => (d === "asc" ? "desc" : "asc"));
          return prev;
        }
        setDir("asc");
        return k;
      });
    },
    [],
  );
  const sorted = React.useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av = get(a, sort) ?? "";
      const bv = get(b, sort) ?? "";
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, sort, dir, get]);
  return { sorted, sort, dir, onSort };
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-8 text-center text-[12.5px] text-[var(--text-3)]">{children}</div>
  );
}

/* ---- buttons ------------------------------------------------------------- */

export function Btn({
  children,
  onClick,
  variant = "secondary",
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "ghost";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`erp-btn erp-btn-${variant}`}
    >
      {children}
    </motion.button>
  );
}

/* ---- KPI tile ------------------------------------------------------------
   The dashboard's signature element: caps label, Inter 700 hero value,
   monospace trend pill with ▲/▼ glyphs. */

export function Stat({
  label,
  children,
  note,
  trend,
  tone = "ink",
}: {
  label: string;
  children: React.ReactNode;
  note?: string;
  trend?: { dir: "up" | "down"; pct: string };
  tone?: "ink" | "affirm" | "negate" | "caution" | "accent";
}) {
  const colour = {
    ink: "var(--ink)",
    affirm: "var(--affirm)",
    negate: "var(--negate)",
    caution: "var(--caution)",
    accent: "var(--accent)",
  }[tone];
  return (
    <div className="erp-card min-w-0 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow">{label}</span>
        {trend && (
          <span
            className="mono shrink-0 text-[10.5px] font-semibold"
            style={{ color: trend.dir === "up" ? "var(--affirm)" : "var(--negate)" }}
          >
            {trend.dir === "up" ? "▲" : "▼"} {trend.pct}
          </span>
        )}
      </div>
      <div
        className="mt-1.5 truncate text-[22px] font-bold leading-none tracking-[-0.028em]"
        style={{ color: colour }}
      >
        {children}
      </div>
      {note && <div className="mt-1 truncate text-[11.5px] text-[var(--text-3)]">{note}</div>}
    </div>
  );
}

/** Thin progress bar — scaleX only, never width. */
export function Bar({ pct, tone = "accent" }: { pct: number; tone?: "accent" | "affirm" | "caution" }) {
  const colour = {
    accent: "var(--accent)",
    affirm: "var(--affirm)",
    caution: "var(--caution)",
  }[tone];
  return (
    <span className="block h-1 w-full overflow-hidden rounded-full bg-[var(--surface-3)]">
      <motion.span
        className="block h-full origin-left rounded-full"
        style={{ background: colour, willChange: "transform" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.max(0, Math.min(1, pct / 100)) }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      />
    </span>
  );
}
