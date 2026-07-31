"use client";

import { useReducer, useCallback } from "react";
import {
  ACCOUNTS,
  DEALS,
  INVOICES,
  JOURNAL,
  PRODUCTS,
  QUOTES,
  STAGES,
  round2,
  splitVat,
  type Deal,
  type Invoice,
  type JournalEntry,
  type Product,
  type Quote,
  type Stage,
} from "./data";

/* ============================================================================
   One store behind every pane.

   The entire point of the demo is that a document raised in one module shows
   up, already posted, in the others: convert a quotation and an invoice
   appears; pay the invoice and a balanced journal entry appears; ring up a
   POS sale and stock falls while revenue rises. Nothing here is typed twice,
   which is precisely the product claim the page makes in words.
   ========================================================================== */

export type CartLine = { sku: string; qty: number };

export type State = {
  currency: "USD" | "LBP";
  quotes: Quote[];
  invoices: Invoice[];
  journal: JournalEntry[];
  products: Product[];
  deals: Deal[];
  cart: CartLine[];
  /* Counters so generated references keep marching forward realistically. */
  nextInvoice: number;
  nextJournal: number;
  nextPos: number;
  /* Set by any action that writes somewhere else, so the shell can point at
     the module the visitor should look at next. */
  toast: { text: string; go?: string } | null;
};

export const initialState: State = {
  currency: "USD",
  quotes: QUOTES,
  invoices: INVOICES,
  journal: JOURNAL,
  products: PRODUCTS,
  deals: DEALS,
  cart: [],
  nextInvoice: 104,
  nextJournal: 381,
  nextPos: 19,
  toast: null,
};

export type Action =
  | { type: "currency"; value: State["currency"] }
  | { type: "convertQuote"; ref: string }
  | { type: "recordPayment"; ref: string }
  | { type: "cartAdd"; sku: string }
  | { type: "cartSub"; sku: string }
  | { type: "cartClear" }
  | { type: "checkout" }
  | { type: "advanceDeal"; id: string }
  | { type: "dismissToast" }
  | { type: "reset" };

const pad = (n: number, w: number) => String(n).padStart(w, "0");

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "currency":
      return { ...s, currency: a.value };

    case "dismissToast":
      return { ...s, toast: null };

    case "reset":
      return { ...initialState };

    /* -- quotation → invoice -------------------------------------------- */
    case "convertQuote": {
      const q = s.quotes.find((x) => x.ref === a.ref);
      if (!q || q.status === "Converted") return s;
      const ref = `INV-2026-${pad(s.nextInvoice, 4)}`;
      const { net, vat } = splitVat(q.total);
      const je = `JE-2026-${pad(s.nextJournal, 5)}`;
      return {
        ...s,
        quotes: s.quotes.map((x) => (x.ref === a.ref ? { ...x, status: "Converted" } : x)),
        invoices: [
          { ref, quote: q.ref, client: q.client, total: q.total, paid: 0, status: "Unpaid", due: "Aug 28, 2026" },
          ...s.invoices,
        ],
        journal: [
          {
            ref: je,
            date: "Jul 31, 2026",
            memo: `Sales invoice · ${ref}`,
            source: "Quotations",
            fresh: true,
            lines: [
              { account: ACCOUNTS.ar, dr: q.total, cr: 0 },
              { account: ACCOUNTS.sales, dr: 0, cr: net },
              { account: ACCOUNTS.vat, dr: 0, cr: vat },
            ],
          },
          ...s.journal.map((j) => ({ ...j, fresh: false })),
        ],
        nextInvoice: s.nextInvoice + 1,
        nextJournal: s.nextJournal + 1,
        toast: { text: `${ref} raised from ${q.ref} — nothing retyped`, go: "invoices" },
      };
    }

    /* -- invoice → payment ------------------------------------------------ */
    case "recordPayment": {
      const inv = s.invoices.find((x) => x.ref === a.ref);
      if (!inv || inv.status !== "Unpaid") return s;
      const je = `JE-2026-${pad(s.nextJournal, 5)}`;
      return {
        ...s,
        invoices: s.invoices.map((x) =>
          x.ref === a.ref ? { ...x, paid: x.total, status: "Paid" } : x,
        ),
        journal: [
          {
            ref: je,
            date: "Jul 31, 2026",
            memo: `Payment received · ${inv.ref}`,
            source: "Invoices",
            fresh: true,
            lines: [
              { account: ACCOUNTS.cash, dr: inv.total, cr: 0 },
              { account: ACCOUNTS.ar, dr: 0, cr: inv.total },
            ],
          },
          ...s.journal.map((j) => ({ ...j, fresh: false })),
        ],
        nextJournal: s.nextJournal + 1,
        toast: { text: `${je} posted itself · the books still balance`, go: "accounting" },
      };
    }

    /* -- point of sale ---------------------------------------------------- */
    case "cartAdd": {
      const p = s.products.find((x) => x.sku === a.sku);
      if (!p) return s;
      const line = s.cart.find((c) => c.sku === a.sku);
      if (line && line.qty >= p.stock) return s; // never sell stock you do not hold
      if (p.stock === 0) return s;
      return {
        ...s,
        cart: line
          ? s.cart.map((c) => (c.sku === a.sku ? { ...c, qty: c.qty + 1 } : c))
          : [...s.cart, { sku: a.sku, qty: 1 }],
      };
    }

    case "cartSub": {
      const line = s.cart.find((c) => c.sku === a.sku);
      if (!line) return s;
      return line.qty <= 1
        ? { ...s, cart: s.cart.filter((c) => c.sku !== a.sku) }
        : { ...s, cart: s.cart.map((c) => (c.sku === a.sku ? { ...c, qty: c.qty - 1 } : c)) };
    }

    case "cartClear":
      return { ...s, cart: [] };

    case "checkout": {
      if (!s.cart.length) return s;
      const gross = round2(
        s.cart.reduce((t, c) => {
          const p = s.products.find((x) => x.sku === c.sku);
          return t + (p ? p.price * c.qty : 0);
        }, 0),
      );
      const { net, vat } = splitVat(gross);
      const ref = `POS-2026-${pad(s.nextPos, 4)}`;
      const je = `JE-2026-${pad(s.nextJournal, 5)}`;
      return {
        ...s,
        /* One transaction: the sale writes the invoice, draws the stock and
           posts the entry. Splitting these is how the numbers drift apart. */
        products: s.products.map((p) => {
          const line = s.cart.find((c) => c.sku === p.sku);
          return line ? { ...p, stock: p.stock - line.qty } : p;
        }),
        invoices: [
          { ref, client: "Walk-in", total: gross, paid: gross, status: "Paid", due: "Jul 31, 2026" },
          ...s.invoices,
        ],
        journal: [
          {
            ref: je,
            date: "Jul 31, 2026",
            memo: `POS sale · ${ref}`,
            source: "Point of Sale",
            fresh: true,
            lines: [
              { account: ACCOUNTS.cash, dr: gross, cr: 0 },
              { account: ACCOUNTS.sales, dr: 0, cr: net },
              { account: ACCOUNTS.vat, dr: 0, cr: vat },
            ],
          },
          ...s.journal.map((j) => ({ ...j, fresh: false })),
        ],
        cart: [],
        nextPos: s.nextPos + 1,
        nextJournal: s.nextJournal + 1,
        toast: { text: `${ref} · stock drawn and ${je} posted`, go: "accounting" },
      };
    }

    /* -- CRM -------------------------------------------------------------- */
    case "advanceDeal": {
      return {
        ...s,
        deals: s.deals.map((d) => {
          if (d.id !== a.id) return d;
          const i = STAGES.indexOf(d.stage);
          return { ...d, stage: STAGES[Math.min(i + 1, STAGES.length - 1)] as Stage };
        }),
      };
    }

    default:
      return s;
  }
}

export function useErp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const act = useCallback((a: Action) => dispatch(a), []);
  return { state, act };
}

/* ---- derived figures, all computed from the journal --------------------- */

/** Revenue is never stored — it is summed from what has actually posted. */
export function revenueOf(journal: JournalEntry[]) {
  return round2(
    journal.reduce(
      (t, j) => t + j.lines.filter((l) => l.account === ACCOUNTS.sales).reduce((n, l) => n + l.cr, 0),
      0,
    ),
  );
}

export function vatOf(journal: JournalEntry[]) {
  return round2(
    journal.reduce(
      (t, j) => t + j.lines.filter((l) => l.account === ACCOUNTS.vat).reduce((n, l) => n + l.cr, 0),
      0,
    ),
  );
}

export function cashOf(journal: JournalEntry[]) {
  return round2(
    journal.reduce(
      (t, j) =>
        t + j.lines.filter((l) => l.account === ACCOUNTS.cash).reduce((n, l) => n + l.dr - l.cr, 0),
      0,
    ),
  );
}

/** The trial balance. Both sides are summed independently — if the reducer
    ever posted a lopsided entry this would visibly stop tying out. */
export function trialBalance(journal: JournalEntry[]) {
  const rows = new Map<string, { dr: number; cr: number }>();
  for (const j of journal) {
    for (const l of j.lines) {
      const r = rows.get(l.account) ?? { dr: 0, cr: 0 };
      r.dr += l.dr;
      r.cr += l.cr;
      rows.set(l.account, r);
    }
  }
  const list = [...rows.entries()]
    .map(([account, v]) => ({ account, dr: round2(v.dr), cr: round2(v.cr) }))
    .sort((a, b) => a.account.localeCompare(b.account));
  return {
    rows: list,
    dr: round2(list.reduce((t, r) => t + r.dr, 0)),
    cr: round2(list.reduce((t, r) => t + r.cr, 0)),
  };
}
