"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  AGING,
  BOM,
  ORDERS,
  REVENUE_BY_MONTH,
  STAGES,
  VAT_RATE,
  round2,
  splitVat,
  type ModuleKey,
} from "./data";
import { revenueOf, trialBalance, vatOf, type Action, type State } from "./store";
import {
  Badge,
  Bar,
  Btn,
  Card,
  Empty,
  FilterBar,
  Input,
  Money,
  Select,
  SortableTh,
  Stat,
  TableWrap,
  useSort,
} from "./ui";

/* ============================================================================
   The nine module screens.

   Column sets, filter controls, badge vocabulary and empty-state wording are
   taken from the application's own page components (pages/Invoices.jsx,
   accounting/TrialBalance.jsx, pos/RegisterView.jsx and so on) rather than
   invented — see the comment in each pane for its source.
   ========================================================================== */

type PaneProps = { s: State; act: (a: Action) => void; tab: number };

const EASE = [0.16, 1, 0.3, 1] as const;

/* ==========================================================================
   Dashboard
   ========================================================================== */

function Dashboard({ s }: PaneProps) {
  const revenue = revenueOf(s.journal);
  const expenses = 17724.6;
  const profit = round2(revenue - expenses);
  const low = s.products.filter((p) => p.stock <= p.reorder);
  const unpaid = s.invoices.filter((i) => i.status === "Unpaid");
  const owed = round2(unpaid.reduce((t, i) => t + i.total - i.paid, 0));
  const stockValue = round2(s.products.reduce((t, p) => t + p.cost * p.stock, 0));

  return (
    <>
      {/* "Needs attention" strip — the application's own dashboard opener. */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="eyebrow mr-1">Needs attention</span>
        {[
          { t: `${unpaid.length} unpaid — action needed`, b: "Unpaid" },
          { t: `${low.length} items low on stock`, b: "Low" },
          { t: "1 leave request pending", b: "Pending Approval" },
          { t: "1 production order due within 7 days", b: "In Progress" },
        ].map((c) => (
          <Badge key={c.t} status={c.b}>
            {c.t}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="Monthly revenue" tone="affirm" note="Posted to 4000 · Sales" trend={{ dir: "up", pct: "12.4%" }}>
          <Money value={revenue} currency={s.currency} />
        </Stat>
        <Stat label="Monthly expenses" tone="negate" note="Operating costs" trend={{ dir: "down", pct: "3.1%" }}>
          <Money value={expenses} currency={s.currency} />
        </Stat>
        <Stat label="Net profit" tone={profit >= 0 ? "affirm" : "negate"} note={`Margin ${revenue ? Math.round((profit / revenue) * 100) : 0}%`}>
          <Money value={profit} currency={s.currency} />
        </Stat>
        <Stat label="Outstanding" tone="caution" note={`${unpaid.length} open invoices`}>
          <Money value={owed} currency={s.currency} />
        </Stat>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-[1.5fr_1fr]">
        <Card title="Income vs Expenses" actions={<span className="text-[11.5px] text-[var(--text-3)]">Last 6 months</span>}>
          <div className="p-3">
            <MiniChart />
          </div>
        </Card>
        <Card title="Operations today">
          <div className="p-3">
            <ul className="space-y-1.5">
              {[
                ["POS sales today", String(s.invoices.filter((i) => i.ref.startsWith("POS")).length)],
                ["Cash drawers open", "2"],
                ["In production", "3"],
                ["Stock value", ""],
              ].map(([k, v]) => (
                <li key={k} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-[var(--text-2)]">{k}</span>
                  {v ? (
                    <span className="mono font-semibold text-[var(--ink)]">{v}</span>
                  ) : (
                    <Money value={stockValue} currency={s.currency} className="font-semibold text-[var(--ink)]" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </>
  );
}

function MiniChart() {
  const max = Math.max(...REVENUE_BY_MONTH.map((r) => r.v));
  return (
    <div className="flex h-[104px] items-end gap-2">
      {REVENUE_BY_MONTH.map((r, i) => (
        <div key={r.m} className="flex flex-1 flex-col items-center gap-1">
          <motion.span
            className="w-full origin-bottom rounded-t-[2px]"
            style={{ height: `${(r.v / max) * 88}px`, background: "var(--accent)", willChange: "transform" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.55, ease: EASE, delay: i * 0.05 }}
          />
          <span className="mono text-[10px] text-[var(--text-3)]">{r.m}</span>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   CRM — the Deals pipeline tab
   ========================================================================== */

function Crm({ s, act }: PaneProps) {
  const open = s.deals.filter((d) => d.stage !== "Won").reduce((t, d) => t + d.value, 0);
  return (
    <Card
      title="Deals pipeline"
      actions={
        <span className="text-[11.5px] text-[var(--text-3)]">
          Weighted pipeline{" "}
          <Money value={open} currency={s.currency} className="font-semibold text-[var(--ink)]" />
        </span>
      }
    >
      <div className="grid gap-2 p-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const deals = s.deals.filter((d) => d.stage === stage);
          return (
            <div key={stage} className="min-w-0 rounded-[6px] bg-[var(--surface-2)] p-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="eyebrow">{stage}</span>
                <span className="mono text-[10.5px] text-[var(--text-3)]">{deals.length}</span>
              </div>
              <div className="space-y-1.5">
                {deals.map((d) => (
                  <motion.button
                    key={d.id}
                    type="button"
                    layout
                    layoutId={d.id}
                    onClick={() => act({ type: "advanceDeal", id: d.id })}
                    disabled={d.stage === "Won"}
                    whileHover={d.stage === "Won" ? undefined : { y: -2 }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className={cn(
                      "block w-full rounded-[6px] border border-[var(--rule)] bg-[var(--surface)] p-2 text-left",
                      d.stage === "Won" ? "cursor-default" : "cursor-pointer hover:border-[var(--accent)]",
                    )}
                  >
                    <div className="truncate text-[12.5px] font-semibold text-[var(--ink)]">{d.title}</div>
                    <div className="truncate text-[11.5px] text-[var(--text-3)]">{d.client}</div>
                    <Money value={d.value} currency={s.currency} className="mt-1 block text-[12px] font-semibold text-[var(--accent)]" />
                  </motion.button>
                ))}
                {!deals.length && (
                  <div className="py-3 text-center text-[11px] text-[var(--text-3)]">—</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ==========================================================================
   Quotations — columns from pages/Quotations.jsx
   ========================================================================== */

type QKey = "ref" | "client" | "project" | "status" | "total" | "date";

function Quotations({ s, act }: PaneProps) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(
    () =>
      s.quotes.filter(
        (x) =>
          (!status || x.status === status) &&
          (!q.trim() ||
            `${x.ref} ${x.client} ${x.project ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [s.quotes, q, status],
  );
  const { sorted, sort, dir, onSort } = useSort<(typeof rows)[number], QKey>(
    rows,
    "ref",
    (r, k) => (k === "total" ? r.total : (r[k] ?? "")),
  );

  return (
    <Card
      title="Quotations"
      actions={
        <>
          <span className="text-[11.5px] text-[var(--text-3)]">{s.quotes.length} total quotations</span>
          <Btn variant="primary">+ New Quotation</Btn>
        </>
      }
    >
      <FilterBar>
        <Input value={q} onChange={setQ} placeholder="Search quote #, client, project, notes…" width={230} />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: "All Statuses" },
            ...["Draft", "Sent", "Accepted", "Invoiced"].map((v) => ({ value: v, label: v })),
          ]}
          width={140}
        />
      </FilterBar>

      {!sorted.length ? (
        <Empty>No quotations found.</Empty>
      ) : (
        <TableWrap min="50rem">
          <thead>
            <tr>
              <SortableTh label="Quote #" sortKey="ref" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Client" sortKey="client" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Project" sortKey="project" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Status" sortKey="status" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Total (incl. VAT)" sortKey="total" sort={sort} dir={dir} onSort={onSort} right />
              <th>Invoice</th>
              <SortableTh label="Created" sortKey="date" sort={sort} dir={dir} onSort={onSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((x) => (
              <tr key={x.ref}>
                <td className="primary mono">{x.ref}</td>
                <td>{x.client}</td>
                <td>{x.project ?? "—"}</td>
                <td>
                  <Badge status={x.status} />
                </td>
                <td className="num">
                  <Money value={x.total} currency={s.currency} />
                </td>
                <td className="mono text-[11.5px]">
                  {x.invoice ? <span className="text-[var(--accent)]">→ {x.invoice}</span> : "—"}
                </td>
                <td className="text-[var(--text-3)]">{x.date}</td>
                <td>
                  {x.status === "Invoiced" ? (
                    <span className="text-[11.5px] text-[var(--text-3)]">Invoiced</span>
                  ) : (
                    <Btn variant="primary" onClick={() => act({ type: "convertQuote", ref: x.ref })}>
                      Convert to Invoice
                    </Btn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
      <div className="border-t border-[var(--rule)] bg-[var(--surface-2)] px-3.5 py-2 text-[11.5px] text-[var(--text-3)]">
        Workflow: Draft → Sent → Accepted → Convert to Invoice.
      </div>
    </Card>
  );
}

/* ==========================================================================
   Invoices — columns from pages/Invoices.jsx
   ========================================================================== */

type IKey = "ref" | "quote" | "client" | "project" | "total" | "paid" | "remaining" | "status" | "due";

function Invoices({ s, act }: PaneProps) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(
    () =>
      s.invoices.filter(
        (x) =>
          (!status || x.status === status) &&
          (!q.trim() ||
            `${x.ref} ${x.quote ?? ""} ${x.client} ${x.project ?? ""}`
              .toLowerCase()
              .includes(q.trim().toLowerCase())),
      ),
    [s.invoices, q, status],
  );
  const { sorted, sort, dir, onSort } = useSort<(typeof rows)[number], IKey>(rows, "ref", (r, k) =>
    k === "remaining" ? r.total - r.paid : k === "total" || k === "paid" ? r[k] : (r[k as "ref"] ?? ""),
  );

  return (
    <Card
      title="Invoices"
      actions={
        <>
          <span className="text-[11.5px] text-[var(--text-3)]">{s.invoices.length} total invoices</span>
          <Btn variant="primary">+ New Invoice</Btn>
        </>
      }
    >
      <FilterBar>
        <Input value={q} onChange={setQ} placeholder="Search invoice #, quote #, client, project…" width={240} />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            { value: "", label: "All Statuses" },
            ...["Unpaid", "Paid", "Void"].map((v) => ({ value: v, label: v })),
          ]}
          width={130}
        />
      </FilterBar>

      {!sorted.length ? (
        <Empty>No invoices found.</Empty>
      ) : (
        <TableWrap min="56rem">
          <thead>
            <tr>
              <SortableTh label="Invoice #" sortKey="ref" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Quote #" sortKey="quote" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Client" sortKey="client" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Project" sortKey="project" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Amount" sortKey="total" sort={sort} dir={dir} onSort={onSort} right />
              <SortableTh label="Paid" sortKey="paid" sort={sort} dir={dir} onSort={onSort} right />
              <SortableTh label="Remaining" sortKey="remaining" sort={sort} dir={dir} onSort={onSort} right />
              <SortableTh label="Status" sortKey="status" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Due Date" sortKey="due" sort={sort} dir={dir} onSort={onSort} />
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((inv) => {
              const remaining = round2(inv.total - inv.paid);
              return (
                <tr key={inv.ref}>
                  <td className="primary mono">{inv.ref}</td>
                  <td className="mono text-[11.5px] text-[var(--text-3)]">{inv.quote ?? "—"}</td>
                  <td>{inv.client}</td>
                  <td>{inv.project ?? "—"}</td>
                  <td className="num font-semibold text-[var(--ink)]">
                    <Money value={inv.total} currency={s.currency} />
                  </td>
                  <td className="num" style={{ color: "var(--affirm)" }}>
                    <Money value={inv.paid} currency={s.currency} />
                  </td>
                  <td
                    className="num font-semibold"
                    style={{ color: remaining > 0 ? "var(--negate)" : "var(--affirm)" }}
                  >
                    <Money value={remaining} currency={s.currency} />
                  </td>
                  <td>
                    <Badge status={inv.status} />
                  </td>
                  <td className="text-[var(--text-3)]">{inv.due}</td>
                  <td>
                    {inv.status === "Unpaid" ? (
                      <Btn variant="success" onClick={() => act({ type: "recordPayment", ref: inv.ref })}>
                        Record Payment
                      </Btn>
                    ) : (
                      <span className="text-[11.5px] text-[var(--text-3)]">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </Card>
  );
}

/* ==========================================================================
   Point of Sale — the Register view, from pages/pos/RegisterView.jsx
   ========================================================================== */

function Pos({ s, act }: PaneProps) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const categories = useMemo(() => {
    const c = new Map<string, number>();
    for (const p of s.products) c.set(p.category, (c.get(p.category) ?? 0) + 1);
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [s.products]);

  const visible = s.products.filter(
    (p) =>
      (!cat || p.category === cat) &&
      (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase()) || p.sku.toLowerCase().includes(q.trim().toLowerCase())),
  );

  const gross = round2(
    s.cart.reduce((t, c) => {
      const p = s.products.find((x) => x.sku === c.sku);
      return t + (p ? p.price * c.qty : 0);
    }, 0),
  );
  const { net, vat } = splitVat(gross);

  return (
    <div className="grid min-w-0 gap-2 lg:grid-cols-[1fr_16rem]">
      <Card
        title="Register"
        className="min-w-0"
        actions={
          <span className="text-[11.5px] text-[var(--text-3)]">
            Session open · Cashier: admin
          </span>
        }
      >
        <FilterBar>
          <Input value={q} onChange={setQ} placeholder="Scan barcode or search items…" width={220} />
          <button
            type="button"
            onClick={() => setCat("")}
            className={cn(
              "erp-badge cursor-pointer",
              !cat ? "erp-badge-purple" : "erp-badge-gray",
            )}
          >
            All
          </button>
          {categories.map(([c, n]) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "erp-badge cursor-pointer",
                cat === c ? "erp-badge-purple" : "erp-badge-gray",
              )}
            >
              {c} · {n}
            </button>
          ))}
        </FilterBar>

        {!visible.length ? (
          <Empty>No matching items.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 p-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((p) => {
              const out = p.stock === 0;
              return (
                <motion.button
                  key={p.sku}
                  type="button"
                  onClick={() => act({ type: "cartAdd", sku: p.sku })}
                  disabled={out}
                  whileHover={out ? undefined : { y: -2 }}
                  whileTap={out ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 460, damping: 30 }}
                  className={cn(
                    "min-w-0 rounded-[6px] border border-[var(--rule)] bg-[var(--surface)] p-2 text-left",
                    out ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:border-[var(--accent)]",
                  )}
                >
                  <div className="flex min-h-[17px] items-start justify-between gap-1">
                    <span className="mono truncate text-[10px] text-[var(--text-3)]">{p.sku}</span>
                    {p.stock <= p.reorder && <Badge status={out ? "Void" : "Low"}>{out ? "Out" : "Low"}</Badge>}
                  </div>
                  <div className="mt-0.5 truncate text-[12.5px] font-semibold text-[var(--ink)]">{p.name}</div>
                  <div className="mt-1 flex items-baseline justify-between gap-1">
                    <Money value={p.price} currency={s.currency} className="text-[12px] font-semibold text-[var(--accent)]" />
                    <span className="mono shrink-0 text-[10.5px] text-[var(--text-3)]">{p.stock} in stock</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </Card>

      <Card title="Cart" className="h-max min-w-0">
        <div className="p-2.5">
          {!s.cart.length ? (
            <p className="py-5 text-center text-[11.5px] text-[var(--text-3)]">
              Cart is empty. Scan or search to add items.
            </p>
          ) : (
            <ul className="space-y-1">
              {s.cart.map((c) => {
                const p = s.products.find((x) => x.sku === c.sku)!;
                return (
                  <motion.li
                    key={c.sku}
                    layout
                    initial={{ opacity: 0, x: 6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="flex items-center gap-1 text-[12px]"
                  >
                    <span className="min-w-0 flex-1 truncate text-[var(--text-2)]">{p.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove one ${p.name}`}
                      onClick={() => act({ type: "cartSub", sku: c.sku })}
                      className="flex h-[18px] w-[18px] shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[var(--rule-strong)] text-[var(--text-3)] hover:text-[var(--accent)]"
                    >
                      −
                    </button>
                    <span className="mono w-4 shrink-0 text-center font-semibold text-[var(--ink)]">{c.qty}</span>
                    <Money value={round2(p.price * c.qty)} currency={s.currency} className="w-[74px] shrink-0 text-right text-[11.5px] font-semibold text-[var(--ink)]" />
                  </motion.li>
                );
              })}
            </ul>
          )}

          {s.cart.length > 0 && (
            <>
              <div className="mt-2.5 space-y-1 border-t border-[var(--rule)] pt-2 text-[12px]">
                <Line label="Subtotal" value={net} currency={s.currency} />
                <Line label={`Tax (${Math.round(VAT_RATE * 100)}%)`} value={vat} currency={s.currency} />
                <div className="flex items-baseline justify-between pt-0.5 text-[14px] font-bold text-[var(--ink)]">
                  <span>Total</span>
                  <Money value={gross} currency={s.currency} />
                </div>
                <div className="pt-0.5 text-[10.5px] text-[var(--text-3)]">Prices include VAT</div>
              </div>
              <div className="mt-2.5 flex gap-1.5">
                <Btn variant="primary" onClick={() => act({ type: "checkout" })}>
                  Complete Sale
                </Btn>
                <Btn onClick={() => act({ type: "cartClear" })}>Clear</Btn>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function Line({ label, value, currency }: { label: string; value: number; currency: "USD" | "LBP" }) {
  return (
    <div className="flex items-baseline justify-between text-[var(--text-2)]">
      <span>{label}</span>
      <Money value={value} currency={currency} />
    </div>
  );
}

/* ==========================================================================
   Inventory — columns from pages/Inventory.jsx
   ========================================================================== */

type NKey = "name" | "category" | "type" | "stock" | "reorder" | "cost" | "supplier";

function Inventory({ s }: PaneProps) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const rows = useMemo(
    () =>
      s.products.filter(
        (p) =>
          (!cat || p.category === cat) &&
          (!q.trim() || `${p.name} ${p.supplier}`.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [s.products, q, cat],
  );
  const { sorted, sort, dir, onSort } = useSort<(typeof rows)[number], NKey>(rows, "name", (r, k) => r[k]);
  const total = round2(sorted.reduce((t, p) => t + p.cost * p.stock, 0));
  const cats = [...new Set(s.products.map((p) => p.category))];

  return (
    <Card
      title="Inventory"
      actions={
        <>
          <span className="text-[11.5px] text-[var(--text-3)]">{s.products.length} items</span>
          <Btn variant="primary">+ Add Item</Btn>
        </>
      }
    >
      <FilterBar>
        <Input value={q} onChange={setQ} placeholder="Search name or supplier…" width={200} />
        <Select
          value={cat}
          onChange={setCat}
          options={[{ value: "", label: "All Categories" }, ...cats.map((c) => ({ value: c, label: c }))]}
          width={160}
        />
      </FilterBar>

      {!sorted.length ? (
        <Empty>No items match your filters.</Empty>
      ) : (
        <TableWrap min="52rem">
          <thead>
            <tr>
              <SortableTh label="Item Name" sortKey="name" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Category" sortKey="category" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Type" sortKey="type" sort={sort} dir={dir} onSort={onSort} />
              <SortableTh label="Stock" sortKey="stock" sort={sort} dir={dir} onSort={onSort} right />
              <SortableTh label="Min Stock" sortKey="reorder" sort={sort} dir={dir} onSort={onSort} right />
              <SortableTh label="Unit Cost" sortKey="cost" sort={sort} dir={dir} onSort={onSort} right />
              <th className="text-right">Total Value</th>
              <SortableTh label="Supplier" sortKey="supplier" sort={sort} dir={dir} onSort={onSort} />
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const status = p.stock === 0 ? "Void" : p.stock <= p.reorder ? "Low" : "OK";
              return (
                <tr key={p.sku}>
                  <td className="primary">{p.name}</td>
                  <td className="text-[var(--text-3)]">{p.category}</td>
                  <td className="text-[var(--text-3)]">{p.type}</td>
                  <td className="num font-semibold text-[var(--ink)]">{p.stock}</td>
                  <td className="num text-[var(--text-3)]">{p.reorder}</td>
                  <td className="num">
                    <Money value={p.cost} currency={s.currency} />
                  </td>
                  <td className="num">
                    <Money value={round2(p.cost * p.stock)} currency={s.currency} />
                  </td>
                  <td className="text-[var(--text-3)]">{p.supplier}</td>
                  <td>
                    <Badge status={status}>{status === "Void" ? "Out of stock" : status}</Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} className="text-right">
                Stock value
              </td>
              <td className="num">
                <Money value={total} currency={s.currency} />
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </TableWrap>
      )}
    </Card>
  );
}

/* ==========================================================================
   Manufacturing — Production Orders + Bills of Materials tabs
   ========================================================================== */

function Manufacturing({ s, tab }: PaneProps) {
  const unit = round2(BOM.reduce((t, b) => t + b.cost, 0));

  if (tab === 1) {
    return (
      <Card title="Bills of Materials" actions={<Btn variant="primary">+ New BOM</Btn>}>
        <div className="p-3">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-[var(--ink)]">Product Alpha</span>
            <span className="flex items-center gap-1.5">
              <Badge status="Active">BOM v3</Badge>
              <span className="text-[11.5px] text-[var(--text-3)]">Batch yield 120 units</span>
            </span>
          </div>
          <TableWrap min="30rem">
            <thead>
              <tr>
                <th>Component</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              {BOM.map((b) => (
                <tr key={b.item}>
                  <td className="primary">{b.item}</td>
                  <td className="num text-[var(--text-3)]">{b.qty}</td>
                  <td className="num">
                    <Money value={b.cost} currency={s.currency} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} className="text-right">
                  Cost per unit
                </td>
                <td className="num">
                  <Money value={unit} currency={s.currency} />
                </td>
              </tr>
            </tfoot>
          </TableWrap>
          <p className="mt-2 text-[11.5px] text-[var(--text-3)]">
            Overhead = Σ(hourly rates) × actual production hours — not a standard rate.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Production Orders" actions={<Btn variant="primary">+ New Production Order</Btn>}>
      <TableWrap min="48rem">
        <thead>
          <tr>
            <th>Order #</th>
            <th>Product</th>
            <th className="text-right">Qty</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Progress</th>
            <th>Status</th>
            <th className="text-right">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          {ORDERS.map((o) => (
            <tr key={o.ref}>
              <td className="primary mono">{o.ref}</td>
              <td>{o.product}</td>
              <td className="num">{o.qty}</td>
              <td className="text-[var(--text-3)]">{o.priority}</td>
              <td className="text-[var(--text-3)]">{o.due}</td>
              <td className="w-24">
                <Bar pct={o.pct} tone={o.state === "On Hold" ? "caution" : o.state === "Completed" ? "affirm" : "accent"} />
              </td>
              <td>
                <Badge status={o.state} />
              </td>
              <td className="num">
                <Money value={o.cost} currency={s.currency} />
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </Card>
  );
}

/* ==========================================================================
   Accounting — Journal + Trial Balance, from pages/accounting/
   ========================================================================== */

function Accounting({ s, tab }: PaneProps) {
  const [source, setSource] = useState("");
  const [q, setQ] = useState("");
  const tb = trialBalance(s.journal);
  const balanced = Math.abs(tb.dr - tb.cr) < 0.005;

  if (tab === 1) {
    /* Trial Balance — the footer reports balanced/not balanced against the
       filtered rows, exactly as accounting/TrialBalance.jsx does. */
    return (
      <Card title="Trial Balance" actions={<span className="text-[11.5px] text-[var(--text-3)]">As of Jul 31, 2026</span>}>
        <TableWrap min="34rem">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {tb.rows.map((r) => {
              const [code, ...name] = r.account.split(" · ");
              return (
                <tr key={r.account}>
                  <td className="mono">{code}</td>
                  <td className="primary">{name.join(" · ")}</td>
                  <td className="num">
                    <Money value={r.dr} currency={s.currency} blankIfZero />
                  </td>
                  <td className="num">
                    <Money value={r.cr} currency={s.currency} blankIfZero />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="text-right" style={{ color: balanced ? "var(--affirm)" : "var(--negate)" }}>
                {balanced ? "✓ Balanced" : "⚠ Not balanced"}
              </td>
              <td className="num">
                <Money value={tb.dr} currency={s.currency} />
              </td>
              <td className="num">
                <Money value={tb.cr} currency={s.currency} />
              </td>
            </tr>
          </tfoot>
        </TableWrap>
      </Card>
    );
  }

  const rows = s.journal.filter(
    (j) =>
      (!source || j.source === source) &&
      (!q.trim() || `${j.ref} ${j.memo}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const sources = [...new Set(s.journal.map((j) => j.source))];

  /* Journal full width with the entry detail beneath it, rather than side by
     side: the real application opens a line detail as a modal over the
     full-width table, and squeezing an eight-column grid into a 1.55fr column
     clipped Debit, Credit and Status behind the scroller at 1600px. */
  return (
    <div className="min-w-0 space-y-2">
      <Card
        title="Journal"
        className="min-w-0"
        actions={<Btn variant="primary">＋ New Entry</Btn>}
      >
        <FilterBar>
          <Select
            value={source}
            onChange={setSource}
            options={[{ value: "", label: "All Sources" }, ...sources.map((x) => ({ value: x, label: x }))]}
            width={150}
          />
          <Input value={q} onChange={setQ} placeholder="Search entries…" width={180} />
        </FilterBar>

        {!rows.length ? (
          <Empty>No entries found.</Empty>
        ) : (
          <TableWrap min="40rem">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Memo</th>
                <th>Source</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => {
                const d = round2(j.lines.reduce((t, l) => t + l.dr, 0));
                const c = round2(j.lines.reduce((t, l) => t + l.cr, 0));
                return (
                  <motion.tr
                    key={j.ref}
                    initial={j.fresh ? { backgroundColor: "rgba(31,163,98,0.16)" } : false}
                    animate={{ backgroundColor: "rgba(31,163,98,0)" }}
                    transition={{ duration: 2.2, ease: "easeOut" }}
                  >
                    <td className="mono">{j.ref}</td>
                    <td className="text-[var(--text-3)]">{j.date}</td>
                    <td className="primary">{j.memo}</td>
                    <td>
                      <Badge status="Draft">{j.source}</Badge>
                    </td>
                    <td className="num font-semibold text-[var(--ink)]">
                      <Money value={d} currency={s.currency} />
                    </td>
                    <td className="num font-semibold text-[var(--ink)]">
                      <Money value={c} currency={s.currency} />
                    </td>
                    <td>
                      <Badge status="posted">posted</Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>

      {/* Entry detail — the lines behind whichever entry is newest. */}
      <Card title={`${s.journal[0]?.ref ?? ""} · lines`} className="h-max min-w-0 lg:max-w-2xl">
        <TableWrap min="0">
          <thead>
            <tr>
              <th>Account</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {(s.journal[0]?.lines ?? []).map((l, i) => {
              const [code, ...name] = l.account.split(" · ");
              return (
                <tr key={i}>
                  <td>
                    <span className="mono">{code}</span>{" "}
                    <span className="text-[var(--text-3)]">{name.join(" · ")}</span>
                  </td>
                  <td className="num">
                    <Money value={l.dr} currency={s.currency} blankIfZero />
                  </td>
                  <td className="num">
                    <Money value={l.cr} currency={s.currency} blankIfZero />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-right">Σ</td>
              <td className="num">
                <Money value={round2((s.journal[0]?.lines ?? []).reduce((t, l) => t + l.dr, 0))} currency={s.currency} />
              </td>
              <td className="num">
                <Money value={round2((s.journal[0]?.lines ?? []).reduce((t, l) => t + l.cr, 0))} currency={s.currency} />
              </td>
            </tr>
          </tfoot>
        </TableWrap>
        <div className="border-t border-[var(--rule)] bg-[var(--surface-2)] px-3.5 py-2 text-[11.5px] text-[var(--text-3)]">
          Corrections post a reversing entry — nothing is deleted.
        </div>
      </Card>
    </div>
  );
}

/* ==========================================================================
   Reports
   ========================================================================== */

function Reports({ s, tab }: PaneProps) {
  const revenue = revenueOf(s.journal);
  const vat = vatOf(s.journal);

  if (tab === 1) {
    const atRisk = AGING.filter((a) => a.tone !== "ok").reduce((t, a) => t + a.amount, 0);
    const total = AGING.reduce((t, a) => t + a.amount, 0);
    return (
      <Card title="Invoice Aging" actions={<Btn>Export Excel</Btn>}>
        <TableWrap min="30rem">
          <thead>
            <tr>
              <th>Bucket</th>
              <th className="text-right">Amount</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {AGING.map((a) => (
              <tr key={a.bucket}>
                <td className="primary">{a.bucket}</td>
                <td className="num">
                  <Money value={a.amount} currency={s.currency} />
                </td>
                <td className="w-32">
                  <Bar pct={(a.amount / total) * 100} tone={a.tone === "ok" ? "affirm" : a.tone === "warn" ? "caution" : "accent"} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="text-right" style={{ color: "var(--negate)" }}>
                At risk
              </td>
              <td className="num">
                <Money value={round2(atRisk)} currency={s.currency} />
              </td>
              <td />
            </tr>
          </tfoot>
        </TableWrap>
      </Card>
    );
  }

  return (
    <div className="grid min-w-0 gap-2 lg:grid-cols-2">
      <Card title="VAT Report" actions={<Btn>Export Excel</Btn>}>
        <TableWrap min="0">
          <tbody>
            <tr>
              <td className="primary">Net sales</td>
              <td className="num">
                <Money value={revenue} currency={s.currency} />
              </td>
            </tr>
            <tr>
              <td className="primary">Output VAT collected</td>
              <td className="num" style={{ color: "var(--accent)" }}>
                <Money value={vat} currency={s.currency} />
              </td>
            </tr>
            <tr>
              <td className="primary">Input VAT</td>
              <td className="num">
                <Money value={0} currency={s.currency} blankIfZero />
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="text-right">Payable to authority</td>
              <td className="num">
                <Money value={vat} currency={s.currency} />
              </td>
            </tr>
          </tfoot>
        </TableWrap>
        <div className="border-t border-[var(--rule)] bg-[var(--surface-2)] px-3.5 py-2 text-[11.5px] text-[var(--text-3)]">
          Extracted per line at {Math.round(VAT_RATE * 100)}% from tax-inclusive prices, as each sale posted.
        </div>
      </Card>

      <Card title="Monthly Breakdown">
        <TableWrap min="0">
          <thead>
            <tr>
              <th>Month</th>
              <th className="text-right">Income</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {REVENUE_BY_MONTH.map((r) => (
              <tr key={r.m}>
                <td className="primary">{r.m} 2026</td>
                <td className="num">
                  <Money value={r.v} currency={s.currency} />
                </td>
                <td className="w-24">
                  <Bar pct={(r.v / 23341) * 100} tone="accent" />
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      </Card>
    </div>
  );
}

/* ========================================================================== */

export const PANES: Record<string, (p: PaneProps) => React.ReactElement> = {
  dashboard: Dashboard,
  crm: Crm,
  quotations: Quotations,
  invoices: Invoices,
  pos: Pos,
  inventory: Inventory,
  manufacturing: Manufacturing,
  accounting: Accounting,
  reports: Reports,
};

export const PANE_HINTS: Record<ModuleKey, string> = {
  dashboard: "Every figure here is summed from entries the other modules posted.",
  crm: "Click a deal card to advance its stage.",
  quotations: "Convert a quotation — an invoice is raised and the entry posts itself.",
  invoices: "Record a payment, then open Accounting.",
  pos: "Ring up a sale. Stock falls and the ledger moves in the same transaction.",
  inventory: "Sell something in Point of Sale and watch these numbers drop.",
  manufacturing: "Overhead is costed from the hours a run actually took.",
  accounting: "Nothing here was typed. Both columns still agree.",
  reports: "Built from the ledger, so it cannot disagree with it.",
};
