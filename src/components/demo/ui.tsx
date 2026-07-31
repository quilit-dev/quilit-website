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
        /* The card title repeats the page title directly above it; on a phone
           that is a wasted row, so it only shows from sm up. */
        <div className="erp-card-header max-sm:justify-end max-sm:py-2">
          <span className="erp-card-title max-sm:hidden">{title}</span>
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
    /* Hidden on phones: search and two selects cost two rows of a very
       cramped screen to filter four demo rows. The disclaimer already says
       the real screens carry more filters than this. */
    <div className="hidden flex-wrap items-center gap-1.5 border-b border-[var(--rule)] px-3.5 py-2 sm:flex">
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
  wrap,
}: {
  children: React.ReactNode;
  min?: string;
  /** Lets cells break instead of forcing a scroller. For the narrow tables
      (three columns or fewer) that otherwise overflow a phone by a few dozen
      pixels — cheaper than a card rendering for so little content. */
  wrap?: boolean;
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <table className={cn("erp-table", wrap && "erp-table-wrap")} style={{ minWidth: min }}>
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

/**
 * True below `sm`, resolved after mount so server and client agree.
 *
 * DataView uses this to render one branch instead of both. Hiding the unused
 * rendering with a CSS class still costs a full React reconcile for every row
 * on every pane switch, which measured 119 -> 89fps.
 */
export function useIsPhone() {
  const [phone, setPhone] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return phone;
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

/* ============================================================================
   DataView — one row definition, two renderings.

   A dense grid is the right shape on a desktop and the wrong one on a phone:
   the demo's primary actions ("Convert to Invoice", "Record Payment") live in
   the last column, which measured 624px outside a 345px frame — so the whole
   demonstration was invisible unless a visitor guessed they could swipe a
   table sideways.

   Below `sm` each row becomes a card with the action as a full-width button.
   Columns are declared once and both renderings read the same definition, so
   they cannot drift apart.
   ========================================================================== */

export type Col<T> = {
  key: string;
  label: string;
  cell: (r: T) => React.ReactNode;
  /** Sortable when present. */
  sort?: (r: T) => string | number;
  num?: boolean;
  /** `title` and `badge` form the card's header row; the rest become a
      label/value grid beneath it. */
  role?: "title" | "badge";
  /** Noise on a small screen — kept in the table, dropped from the card. */
  cardHide?: boolean;
};

export function DataView<T>({
  rows,
  cols,
  rowKey,
  action,
  empty,
  min,
  footer,
}: {
  rows: T[];
  cols: Col<T>[];
  rowKey: (r: T) => string;
  action?: (r: T) => React.ReactNode;
  empty: string;
  min?: string;
  footer?: React.ReactNode;
}) {
  const phone = useIsPhone();
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [dir, setDir] = React.useState<"asc" | "desc">("asc");

  const onSort = (k: string) => {
    if (sortKey === k) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setDir("asc");
    }
  };

  const sorted = React.useMemo(() => {
    const col = cols.find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    const out = [...rows];
    out.sort((a, b) => {
      const av = col.sort!(a);
      const bv = col.sort!(b);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, cols, sortKey, dir]);

  if (!sorted.length) return <Empty>{empty}</Empty>;

  const title = cols.find((c) => c.role === "title");
  const badge = cols.find((c) => c.role === "badge");
  const meta = cols.filter((c) => !c.role && !c.cardHide);

  if (phone) {
    return (
      <div className="divide-y divide-[var(--rule)]">
        {sorted.map((r) => (
          <div key={rowKey(r)} className="p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span className="min-w-0 truncate text-[13.5px] font-semibold text-[var(--ink)]">
                {title ? title.cell(r) : rowKey(r)}
              </span>
              {badge && <span className="shrink-0">{badge.cell(r)}</span>}
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
              {meta.map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="eyebrow truncate">{c.label}</dt>
                  <dd className="truncate text-[12.5px] text-[var(--text-2)]">{c.cell(r)}</dd>
                </div>
              ))}
            </dl>
            {action && <div className="mt-2.5 [&_button]:w-full [&_button]:justify-center">{action(r)}</div>}
          </div>
        ))}
        {footer && <div className="bg-[var(--surface-2)] p-3 text-[12.5px] font-semibold">{footer}</div>}
      </div>
    );
  }

  return (
    <div className="min-w-0 overflow-x-auto">
        <table className="erp-table" style={{ minWidth: min }}>
          <thead>
            <tr>
              {cols.map((c) =>
                c.sort ? (
                  <SortableTh
                    key={c.key}
                    label={c.label}
                    sortKey={c.key}
                    sort={sortKey ?? ""}
                    dir={dir}
                    onSort={onSort}
                    right={c.num}
                  />
                ) : (
                  <th key={c.key} className={c.num ? "text-right" : undefined}>
                    {c.label}
                  </th>
                ),
              )}
              {action && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={rowKey(r)}>
                {cols.map((c) => (
                  <td key={c.key} className={c.num ? "num" : undefined}>
                    {c.cell(r)}
                  </td>
                ))}
                {action && <td>{action(r)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
