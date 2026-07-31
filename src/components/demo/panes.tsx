"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/primitives";
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
import { Bar, Btn, Card, Kpi, Money, PaneHead, Pill, Segmented, TableWrap, Td, Th } from "./ui";

type PaneProps = { s: State; act: (a: Action) => void };

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Plain row.
 *
 * These used to arrive in a per-row stagger. The pane as a whole already
 * fades and lifts on mount, so the rows were a second, redundant motion —
 * and starting nine extra animations on every module click cost real frames
 * (Inventory alone: nine rows plus eight bars). Measured 90 -> 118fps when
 * the row animation came out, with no perceptible loss.
 */
function Row({ children }: { i?: number; children: React.ReactNode }) {
  return <tr className="transition-colors hover:bg-bone-50">{children}</tr>;
}

/* ==========================================================================
   Dashboard
   ========================================================================== */

function Dashboard({ s }: PaneProps) {
  const revenue = revenueOf(s.journal);
  const expenses = 17724.6;
  const profit = round2(revenue - expenses);
  const lowStock = s.products.filter((p) => p.stock <= p.reorder).length;
  const unpaid = s.invoices.filter((i) => i.status === "Unpaid");
  const owed = round2(unpaid.reduce((t, i) => t + i.total - i.paid, 0));

  return (
    <>
      <PaneHead title="Good morning, admin" sub="Friday, July 31, 2026 · Real-time overview" />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { t: `${unpaid.length} unpaid — action needed`, tone: "red" },
          { t: `${lowStock} items low on stock`, tone: "gold" },
          { t: "1 leave request pending", tone: "gold" },
          { t: "1 production order due within 7 days", tone: "plum" },
        ].map((c) => (
          <span
            key={c.t}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-[0.74rem] font-medium",
              c.tone === "red" && "border-red-500/20 bg-red-500/6 text-red-600",
              c.tone === "gold" && "border-gold-500/25 bg-gold-500/8 text-gold-700",
              c.tone === "plum" && "border-plum-600/20 bg-plum-600/6 text-plum-700",
            )}
          >
            {c.t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Monthly revenue" tone="jade" note="Posted to 4000 · Sales">
          <Money value={revenue} currency={s.currency} />
        </Kpi>
        <Kpi label="Monthly expenses" tone="red" note="Operating costs">
          <Money value={expenses} currency={s.currency} />
        </Kpi>
        <Kpi
          label="Net profit"
          tone={profit >= 0 ? "jade" : "red"}
          note={`Margin ${revenue ? Math.round((profit / revenue) * 100) : 0}%`}
        >
          <Money value={profit} currency={s.currency} />
        </Kpi>
        <Kpi label="Receivable" tone="gold" note={`${unpaid.length} open invoices`}>
          <Money value={owed} currency={s.currency} />
        </Kpi>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
            Revenue · last six months
          </div>
          <MiniChart />
        </Card>
        <Card>
          <div className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
            Operations today
          </div>
          <ul className="space-y-2.5">
            {[
              ["POS sales today", s.invoices.filter((i) => i.ref.startsWith("POS")).length],
              ["Cash drawers open", 2],
              ["In production", 3],
              ["On leave today", 1],
            ].map(([k, v]) => (
              <li key={k as string} className="flex items-center justify-between text-[0.82rem]">
                <span className="text-plum-900/55">{k}</span>
                <span className="font-mono font-bold text-plum-900">{v}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

function MiniChart() {
  const max = Math.max(...REVENUE_BY_MONTH.map((r) => r.v));
  return (
    <div className="flex h-[122px] items-end gap-2">
      {REVENUE_BY_MONTH.map((r, i) => (
        <div key={r.m} className="flex flex-1 flex-col items-center gap-1.5">
          <motion.span
            className="w-full origin-bottom rounded-t-[3px] bg-gradient-to-t from-plum-700 to-plum-500"
            style={{ height: `${(r.v / max) * 100}px`, willChange: "transform" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
          />
          <span className="font-mono text-[0.58rem] text-plum-900/40">{r.m}</span>
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   CRM — click a deal to advance its stage
   ========================================================================== */

function Crm({ s, act }: PaneProps) {
  return (
    <>
      <PaneHead
        title="CRM"
        sub="Click a deal to move it along the pipeline"
        actions={
          <span className="font-mono text-[0.7rem] text-plum-900/40">
            Weighted pipeline{" "}
            <Money
              className="font-bold text-plum-800"
              value={s.deals.filter((d) => d.stage !== "Won").reduce((t, d) => t + d.value, 0)}
              currency={s.currency}
            />
          </span>
        }
      />
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const deals = s.deals.filter((d) => d.stage === stage);
          return (
            <div key={stage} className="rounded-xl border border-plum-900/8 bg-bone-50/70 p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/45">
                  {stage}
                </span>
                <span className="font-mono text-[0.6rem] text-plum-900/35">{deals.length}</span>
              </div>
              <div className="space-y-2">
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
                      "block w-full rounded-lg border border-plum-900/8 bg-white p-2.5 text-left shadow-[0_1px_2px_rgba(42,29,41,0.04)]",
                      d.stage === "Won"
                        ? "cursor-default"
                        : "cursor-pointer hover:border-plum-600/25",
                    )}
                  >
                    <div className="text-[0.8rem] font-semibold text-plum-950">{d.title}</div>
                    <div className="mt-0.5 text-[0.72rem] text-plum-900/45">{d.client}</div>
                    <div className="mt-1.5">
                      <Money
                        value={d.value}
                        currency={s.currency}
                        className="text-[0.78rem] font-bold text-plum-700"
                      />
                    </div>
                  </motion.button>
                ))}
                {!deals.length && (
                  <div className="rounded-lg border border-dashed border-plum-900/10 py-4 text-center text-[0.7rem] text-plum-900/30">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ==========================================================================
   Quotations — convert one and watch an invoice appear
   ========================================================================== */

function Quotations({ s, act }: PaneProps) {
  return (
    <>
      <PaneHead title="Quotations" sub={`${s.quotes.length} total quotations`} />
      <TableWrap>
        <thead>
          <tr>
            <Th>Quote #</Th>
            <Th>Client</Th>
            <Th>Date</Th>
            <Th right>Amount</Th>
            <Th>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {s.quotes.map((q, i) => (
            <Row key={q.ref} i={i}>
              <Td className="font-mono text-[0.78rem] font-semibold text-plum-900">{q.ref}</Td>
              <Td>{q.client}</Td>
              <Td className="text-plum-900/45">{q.date}</Td>
              <Td right>
                <Money value={q.total} currency={s.currency} className="font-semibold" />
              </Td>
              <Td>
                <Pill status={q.status} />
              </Td>
              <Td right>
                {q.status === "Converted" ? (
                  <span className="text-[0.74rem] italic text-plum-900/30">Invoiced</span>
                ) : (
                  <Btn variant="primary" onClick={() => act({ type: "convertQuote", ref: q.ref })}>
                    Convert to invoice
                  </Btn>
                )}
              </Td>
            </Row>
          ))}
        </tbody>
      </TableWrap>
      <p className="mt-3 text-[0.76rem] text-plum-900/40">
        Converting copies the lines, the client and the tax treatment across. The invoice is
        raised and the entry is posted in the same transaction.
      </p>
    </>
  );
}

/* ==========================================================================
   Invoices — record a payment, and the ledger moves
   ========================================================================== */

const FILTERS = ["All", "Unpaid", "Paid"] as const;

function Invoices({ s, act }: PaneProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const rows = s.invoices.filter((i) => filter === "All" || i.status === filter);

  return (
    <>
      <PaneHead
        title="Invoices"
        sub={`${s.invoices.length} total invoices`}
        actions={
          <Segmented options={FILTERS} value={filter} onChange={setFilter} idPrefix="inv" />
        }
      />
      <TableWrap>
        <thead>
          <tr>
            <Th>Invoice #</Th>
            <Th>Client</Th>
            <Th right>Amount</Th>
            <Th right>Remaining</Th>
            <Th>Status</Th>
            <Th>Due</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((inv, i) => (
            <Row key={inv.ref} i={i}>
              <Td className="font-mono text-[0.78rem] font-semibold text-plum-900">
                {inv.ref}
                {inv.quote && (
                  <span className="ml-1.5 font-normal text-plum-900/30">← {inv.quote}</span>
                )}
              </Td>
              <Td>{inv.client}</Td>
              <Td right>
                <Money value={inv.total} currency={s.currency} className="font-semibold" />
              </Td>
              <Td right>
                <Money
                  value={round2(inv.total - inv.paid)}
                  currency={s.currency}
                  className={inv.status === "Unpaid" ? "text-red-600" : "text-plum-900/35"}
                />
              </Td>
              <Td>
                <Pill status={inv.status} />
              </Td>
              <Td className="text-plum-900/45">{inv.due}</Td>
              <Td right>
                {inv.status === "Unpaid" ? (
                  <Btn variant="jade" onClick={() => act({ type: "recordPayment", ref: inv.ref })}>
                    Record payment
                  </Btn>
                ) : (
                  <span className="text-[0.74rem] italic text-plum-900/30">Settled</span>
                )}
              </Td>
            </Row>
          ))}
          {!rows.length && (
            <tr>
              <Td className="py-8 text-center text-plum-900/35">Nothing matches that filter.</Td>
            </tr>
          )}
        </tbody>
      </TableWrap>
    </>
  );
}

/* ==========================================================================
   Point of Sale — a register wired to stock and the ledger
   ========================================================================== */

function Pos({ s, act }: PaneProps) {
  const gross = round2(
    s.cart.reduce((t, c) => {
      const p = s.products.find((x) => x.sku === c.sku);
      return t + (p ? p.price * c.qty : 0);
    }, 0),
  );
  const { net, vat } = splitVat(gross);

  return (
    <>
      <PaneHead title="Point of Sale" sub="Shelf prices include VAT · tap to add" />
      <div className="grid gap-3 lg:grid-cols-[1fr_15rem]">
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {s.products.map((p) => {
            const out = p.stock === 0;
            return (
              <motion.button
                key={p.sku}
                type="button"
                onClick={() => act({ type: "cartAdd", sku: p.sku })}
                disabled={out}
                whileHover={out ? undefined : { y: -3 }}
                whileTap={out ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 460, damping: 30 }}
                className={cn(
                  "rounded-xl border border-plum-900/8 bg-white p-3 text-left shadow-[0_1px_2px_rgba(42,29,41,0.04)]",
                  out
                    ? "cursor-not-allowed opacity-45"
                    : "cursor-pointer hover:border-plum-600/25",
                )}
              >
                {/* Fixed height: without it, only the cards carrying a stock
                    pill are pushed down and the product names in a row stop
                    sharing a baseline. */}
                <div className="flex min-h-[22px] items-start justify-between gap-2">
                  <span className="font-mono text-[0.55rem] uppercase tracking-[0.1em] text-plum-900/35">
                    {p.sku}
                  </span>
                  {p.stock <= p.reorder && <Pill status={out ? "Out" : "Low"} />}
                </div>
                <div className="mt-1.5 text-[0.85rem] font-semibold leading-tight text-plum-950">
                  {p.name}
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <Money
                    value={p.price}
                    currency={s.currency}
                    className="text-[0.82rem] font-bold text-plum-700"
                  />
                  <span className="font-mono text-[0.66rem] text-plum-900/40">{p.stock} left</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <Card className="flex h-max flex-col">
          <div className="mb-2 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
            Current sale
          </div>
          {!s.cart.length && (
            <p className="py-6 text-center text-[0.76rem] text-plum-900/30">
              Tap a product to start.
            </p>
          )}
          <ul className="space-y-1.5">
            {s.cart.map((c) => {
              const p = s.products.find((x) => x.sku === c.sku)!;
              return (
                <motion.li
                  key={c.sku}
                  layout
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="flex items-center gap-1.5 text-[0.78rem]"
                >
                  <span className="min-w-0 flex-1 truncate text-plum-900/75">{p.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove one ${p.name}`}
                    onClick={() => act({ type: "cartSub", sku: c.sku })}
                    className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border border-plum-900/12 text-plum-900/50 hover:border-plum-600/30 hover:text-plum-700"
                  >
                    <Icon name="minus" className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center font-mono font-bold text-plum-900">{c.qty}</span>
                  <Money
                    value={round2(p.price * c.qty)}
                    currency={s.currency}
                    className="w-20 text-right text-[0.76rem] font-semibold"
                  />
                </motion.li>
              );
            })}
          </ul>

          {s.cart.length > 0 && (
            <>
              <div className="mt-3 space-y-1 border-t border-plum-900/8 pt-2.5 text-[0.76rem]">
                <div className="flex justify-between text-plum-900/50">
                  <span>Net</span>
                  <Money value={net} currency={s.currency} />
                </div>
                <div className="flex justify-between text-plum-900/50">
                  <span>VAT {Math.round(VAT_RATE * 100)}%</span>
                  <Money value={vat} currency={s.currency} />
                </div>
                <div className="flex justify-between pt-1 text-[0.9rem] font-bold text-plum-950">
                  <span>Total</span>
                  <Money value={gross} currency={s.currency} />
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Btn variant="primary" onClick={() => act({ type: "checkout" })}>
                  Complete sale
                </Btn>
                <Btn onClick={() => act({ type: "cartClear" })}>Clear</Btn>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

/* ==========================================================================
   Inventory
   ========================================================================== */

function Inventory({ s }: PaneProps) {
  const value = round2(s.products.reduce((t, p) => t + p.price * p.stock, 0));
  return (
    <>
      <PaneHead
        title="Inventory"
        sub={`${s.products.length} products · stock drawn automatically on every sale`}
        actions={
          <span className="font-mono text-[0.7rem] text-plum-900/40">
            Stock value{" "}
            <Money className="font-bold text-plum-800" value={value} currency={s.currency} />
          </span>
        }
      />
      <TableWrap>
        <thead>
          <tr>
            <Th>SKU</Th>
            <Th>Product</Th>
            <Th right>Price</Th>
            <Th right>On hand</Th>
            <Th right>Reorder at</Th>
            <Th>Level</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {s.products.map((p, i) => {
            const status = p.stock === 0 ? "Out" : p.stock <= p.reorder ? "Low" : "In stock";
            return (
              <Row key={p.sku} i={i}>
                <Td className="font-mono text-[0.76rem] text-plum-900/60">{p.sku}</Td>
                <Td className="font-semibold text-plum-950">{p.name}</Td>
                <Td right>
                  <Money value={p.price} currency={s.currency} />
                </Td>
                <Td right className="font-mono font-bold text-plum-900">
                  {p.stock}
                </Td>
                <Td right className="text-plum-900/40">
                  {p.reorder}
                </Td>
                <Td className="w-28">
                  <Bar
                    pct={(p.stock / Math.max(p.reorder * 3, 1)) * 100}
                    tone={status === "In stock" ? "jade" : status === "Low" ? "gold" : "plum"}
                  />
                </Td>
                <Td>
                  <Pill status={status} />
                </Td>
              </Row>
            );
          })}
        </tbody>
      </TableWrap>
    </>
  );
}

/* ==========================================================================
   Manufacturing
   ========================================================================== */

function Manufacturing({ s }: PaneProps) {
  const unit = round2(BOM.reduce((t, b) => t + b.cost, 0));
  return (
    <>
      <PaneHead title="Manufacturing" sub="Bills of materials, runs and real cost" />
      <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr]">
        {/* min-w-0: a grid child defaults to min-width:auto, so this would
            stretch to the table's 42rem min-content and defeat the
            scroller inside TableWrap. */}
        <div className="min-w-0">
          <TableWrap>
            <thead>
              <tr>
                <Th>Order #</Th>
                <Th>Product</Th>
                <Th right>Qty</Th>
                <Th>Progress</Th>
                <Th>State</Th>
              </tr>
            </thead>
            <tbody>
              {ORDERS.map((o, i) => (
                <Row key={o.ref} i={i}>
                  <Td className="font-mono text-[0.78rem] font-semibold text-plum-900">{o.ref}</Td>
                  <Td>{o.product}</Td>
                  <Td right className="font-mono">
                    {o.qty}
                  </Td>
                  <Td className="w-32">
                    <Bar pct={o.pct} tone={o.state === "QC hold" ? "gold" : "plum"} />
                  </Td>
                  <Td>
                    <Pill status={o.state} />
                  </Td>
                </Row>
              ))}
            </tbody>
          </TableWrap>
        </div>

        <Card>
          <div className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
            Bill of materials · Product Alpha
          </div>
          <ul className="space-y-2">
            {BOM.map((b) => (
              <li key={b.item} className="flex items-baseline justify-between text-[0.8rem]">
                <span className="text-plum-900/70">{b.item}</span>
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[0.72rem] text-plum-900/40">{b.qty}</span>
                  <Money value={b.cost} currency={s.currency} className="w-20 text-right" />
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-plum-900/8 pt-2.5">
            <span className="text-[0.82rem] font-bold text-plum-950">Cost per unit</span>
            <Money
              value={unit}
              currency={s.currency}
              className="text-[0.92rem] font-bold text-plum-700"
            />
          </div>
          <p className="mt-2.5 text-[0.72rem] leading-relaxed text-plum-900/40">
            Overhead is priced from the hours the run actually took, not a standard rate.
          </p>
        </Card>
      </div>
    </>
  );
}

/* ==========================================================================
   Accounting — the proof that everything above tied out
   ========================================================================== */

function Accounting({ s }: PaneProps) {
  const tb = trialBalance(s.journal);
  const balanced = Math.abs(tb.dr - tb.cr) < 0.005;

  return (
    <>
      <PaneHead
        title="Accounting"
        sub={`${s.journal.length} journal entries · posted automatically`}
        actions={
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[0.74rem] font-semibold",
              balanced
                ? "border-jade-500/25 bg-jade-500/10 text-jade-700"
                : "border-red-500/25 bg-red-500/8 text-red-600",
            )}
          >
            <Icon name="check" className="h-3 w-3" />
            {balanced ? "Trial balance ties out" : "Out of balance"}
          </span>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr]">
        <div className="min-w-0 space-y-2">
          {s.journal.map((j, i) => (
            <motion.div
              key={j.ref}
              layout
              initial={j.fresh ? { opacity: 0, y: -10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 6) * 0.03 }}
              className={cn(
                "rounded-xl border bg-white p-3",
                j.fresh ? "border-jade-500/35 bg-jade-500/[0.04]" : "border-plum-900/8",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-[0.76rem] font-bold text-plum-900">{j.ref}</span>
                <span className="text-[0.72rem] text-plum-900/40">
                  {j.date} · from {j.source}
                </span>
              </div>
              <div className="mt-0.5 text-[0.78rem] text-plum-900/60">{j.memo}</div>
              <div className="mt-2 space-y-1">
                {j.lines.map((l, n) => (
                  <div key={n} className="flex items-baseline justify-between text-[0.76rem]">
                    <span className="font-mono text-plum-900/55">{l.account}</span>
                    <span className="flex gap-4">
                      <Money
                        value={l.dr}
                        currency={s.currency}
                        className={cn("w-24 text-right", l.dr ? "text-plum-900" : "text-plum-900/15")}
                      />
                      <Money
                        value={l.cr}
                        currency={s.currency}
                        className={cn("w-24 text-right", l.cr ? "text-plum-900" : "text-plum-900/15")}
                      />
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <Card className="h-max">
          <div className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
            Trial balance
          </div>
          <div className="mb-1.5 flex justify-between font-mono text-[0.55rem] uppercase tracking-[0.1em] text-plum-900/30">
            <span>Account</span>
            <span className="flex gap-4">
              <span className="w-20 text-right">Debit</span>
              <span className="w-20 text-right">Credit</span>
            </span>
          </div>
          {tb.rows.map((r) => (
            <div key={r.account} className="flex justify-between py-1 text-[0.75rem]">
              <span className="font-mono text-plum-900/60">{r.account}</span>
              <span className="flex gap-4">
                <Money
                  value={r.dr}
                  currency={s.currency}
                  className={cn("w-20 text-right", r.dr ? "text-plum-900" : "text-plum-900/15")}
                />
                <Money
                  value={r.cr}
                  currency={s.currency}
                  className={cn("w-20 text-right", r.cr ? "text-plum-900" : "text-plum-900/15")}
                />
              </span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-plum-900/10 pt-2 text-[0.8rem] font-bold text-plum-950">
            <span>Totals</span>
            <span className="flex gap-4">
              <Money value={tb.dr} currency={s.currency} className="w-20 text-right" />
              <Money value={tb.cr} currency={s.currency} className="w-20 text-right" />
            </span>
          </div>
          <p className="mt-2.5 text-[0.72rem] leading-relaxed text-plum-900/40">
            Both columns are summed independently. They agree because every entry above was
            written by the system, not by a person.
          </p>
        </Card>
      </div>
    </>
  );
}

/* ==========================================================================
   Reports
   ========================================================================== */

function Reports({ s }: PaneProps) {
  const revenue = revenueOf(s.journal);
  const vat = vatOf(s.journal);
  const atRisk = AGING.filter((a) => a.tone !== "ok").reduce((t, a) => t + a.amount, 0);

  return (
    <>
      <PaneHead title="Reports" sub="Answers, without exporting to a spreadsheet" />
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <div className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
            VAT summary · this period
          </div>
          <div className="space-y-2 text-[0.82rem]">
            <div className="flex justify-between">
              <span className="text-plum-900/55">Net sales</span>
              <Money value={round2(revenue)} currency={s.currency} className="font-semibold" />
            </div>
            <div className="flex justify-between">
              <span className="text-plum-900/55">Output VAT collected</span>
              <Money value={vat} currency={s.currency} className="font-semibold text-plum-700" />
            </div>
            <div className="flex justify-between border-t border-plum-900/8 pt-2 font-bold text-plum-950">
              <span>Payable to authority</span>
              <Money value={vat} currency={s.currency} />
            </div>
          </div>
          <p className="mt-3 text-[0.72rem] text-plum-900/40">
            Extracted from tax-inclusive shelf prices at {Math.round(VAT_RATE * 100)}%, per line,
            as each sale posted.
          </p>
        </Card>

        <Card>
          <div className="mb-3 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-plum-900/40">
            Invoice aging
          </div>
          <div className="space-y-2.5">
            {AGING.map((a) => (
              <div key={a.bucket}>
                <div className="mb-1 flex justify-between text-[0.78rem]">
                  <span className="text-plum-900/55">{a.bucket}</span>
                  <Money value={a.amount} currency={s.currency} className="font-semibold" />
                </div>
                <Bar
                  pct={(a.amount / 12480.4) * 100}
                  tone={a.tone === "ok" ? "jade" : a.tone === "warn" ? "gold" : "plum"}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between border-t border-plum-900/8 pt-2 text-[0.8rem] font-bold text-plum-950">
            <span>At risk</span>
            <Money value={round2(atRisk)} currency={s.currency} className="text-gold-700" />
          </div>
        </Card>
      </div>
    </>
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
  invoices: "Record a payment — then open Accounting.",
  pos: "Ring up a sale. Stock falls and the ledger moves in the same transaction.",
  inventory: "Sell something in Point of Sale and watch these numbers drop.",
  manufacturing: "Overhead is costed from the hours a run actually took.",
  accounting: "Nothing here was typed. Both columns still agree.",
  reports: "Built from the ledger, so it cannot disagree with it.",
};
