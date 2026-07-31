import type { IconName } from "@/components/ui/primitives";

/* ============================================================================
   Seed data for the interactive product demo.

   The figures deliberately agree with the rest of the page: the quotation
   QTN-2026-0031 carries $4,335.75, converting it raises INV-2026-0104, and
   paying that invoice posts JE-2026-00382 — the exact chain the "One sale,
   end to end" section narrates. A visitor who scrolled past that story can
   now perform it.
   ========================================================================== */

export const VAT_RATE = 0.11;
export const LBP_RATE = 89_500;

export type ModuleKey =
  | "dashboard"
  | "crm"
  | "quotations"
  | "invoices"
  | "pos"
  | "inventory"
  | "manufacturing"
  | "accounting"
  | "reports";

export const NAV: { group: string; items: { key: ModuleKey; label: string; icon: IconName }[] }[] = [
  {
    group: "",
    items: [{ key: "dashboard", label: "Dashboard", icon: "grid" }],
  },
  {
    group: "Sales",
    items: [
      { key: "crm", label: "CRM", icon: "target" },
      { key: "quotations", label: "Quotations", icon: "file" },
      { key: "invoices", label: "Invoices", icon: "card" },
      { key: "pos", label: "Point of Sale", icon: "cart" },
    ],
  },
  {
    group: "Operations",
    items: [
      { key: "inventory", label: "Inventory", icon: "package" },
      { key: "manufacturing", label: "Manufacturing", icon: "factory" },
    ],
  },
  {
    group: "Finance",
    items: [
      { key: "accounting", label: "Accounting", icon: "book" },
      { key: "reports", label: "Reports", icon: "chart" },
    ],
  },
];

/* ---- chart of accounts -------------------------------------------------- */

export const ACCOUNTS = {
  cash: "1000 · Cash & Bank",
  ar: "1200 · Accounts Receivable",
  inventory: "1300 · Inventory",
  vat: "2100 · VAT Payable",
  sales: "4000 · Sales Revenue",
  cogs: "5000 · Cost of Goods Sold",
} as const;

/* ---- products ------------------------------------------------------------ */

export type Product = {
  sku: string;
  name: string;
  price: number; // tax-inclusive shelf price
  stock: number;
  reorder: number;
};

export const PRODUCTS: Product[] = [
  { sku: "PRD-A", name: "Product Alpha", price: 220.0, stock: 48, reorder: 20 },
  { sku: "PRD-B", name: "Product Beta", price: 95.0, stock: 14, reorder: 20 },
  { sku: "PRD-G", name: "Product Gamma", price: 34.6, stock: 132, reorder: 40 },
  { sku: "MAT-G", name: "Material Gamma", price: 17.5, stock: 8, reorder: 25 },
  { sku: "PRD-D", name: "Product Delta", price: 61.2, stock: 76, reorder: 30 },
  { sku: "PRD-E", name: "Product Epsilon", price: 42.0, stock: 5, reorder: 15 },
  { sku: "PRD-Z", name: "Product Zeta", price: 99.0, stock: 210, reorder: 50 },
  { sku: "PRD-H", name: "Product Eta", price: 65.8, stock: 33, reorder: 25 },
];

/* ---- quotations ---------------------------------------------------------- */

export type QuoteStatus = "Draft" | "Sent" | "Converted";
export type Quote = {
  ref: string;
  client: string;
  total: number;
  status: QuoteStatus;
  date: string;
};

export const QUOTES: Quote[] = [
  { ref: "QTN-2026-0031", client: "Client Theta", total: 4335.75, status: "Sent", date: "Jul 29, 2026" },
  { ref: "QTN-2026-0033", client: "Client Epsilon", total: 8410.5, status: "Sent", date: "Jul 27, 2026" },
  { ref: "QTN-2026-0032", client: "Client Iota", total: 1920.0, status: "Draft", date: "Jul 26, 2026" },
  { ref: "QTN-2026-0029", client: "Client Zeta", total: 2150.0, status: "Converted", date: "Jul 21, 2026" },
];

/* ---- invoices ------------------------------------------------------------ */

export type InvoiceStatus = "Paid" | "Unpaid" | "Void";
export type Invoice = {
  ref: string;
  quote?: string;
  client: string;
  project?: string;
  total: number;
  paid: number;
  status: InvoiceStatus;
  due: string;
};

export const INVOICES: Invoice[] = [
  { ref: "INV-2026-0166", client: "Client Theta", total: 6742.14, paid: 6742.14, status: "Paid", due: "Aug 12, 2026" },
  { ref: "INV-2026-0167", client: "Client Zeta", total: 4356.75, paid: 4356.75, status: "Paid", due: "Aug 12, 2026" },
  { ref: "INV-2026-0168", client: "Client Eta", total: 5705.4, paid: 5705.4, status: "Paid", due: "Aug 12, 2026" },
  { ref: "INV-2026-0001", quote: "QTN-2026-0003", client: "Client Epsilon", project: "Project Epsilon", total: 2686.2, paid: 0, status: "Unpaid", due: "Aug 12, 2026" },
  { ref: "INV-2026-0002", quote: "QTN-2026-0004", client: "Client Zeta", project: "Project Zeta", total: 3774.0, paid: 0, status: "Unpaid", due: "Aug 12, 2026" },
];

/* ---- journal ------------------------------------------------------------- */

export type JournalLine = { account: string; dr: number; cr: number };
export type JournalEntry = {
  ref: string;
  date: string;
  memo: string;
  source: string;
  lines: JournalLine[];
  fresh?: boolean;
};

export const JOURNAL: JournalEntry[] = [
  {
    ref: "JE-2026-00380",
    date: "Jul 29, 2026",
    memo: "Payment received · INV-2026-0166",
    source: "Invoices",
    lines: [
      { account: ACCOUNTS.cash, dr: 6742.14, cr: 0 },
      { account: ACCOUNTS.ar, dr: 0, cr: 6742.14 },
    ],
  },
  {
    ref: "JE-2026-00379",
    date: "Jul 29, 2026",
    memo: "Sales invoice · INV-2026-0166",
    source: "Invoices",
    lines: [
      { account: ACCOUNTS.ar, dr: 6742.14, cr: 0 },
      { account: ACCOUNTS.sales, dr: 0, cr: 6074.0 },
      { account: ACCOUNTS.vat, dr: 0, cr: 668.14 },
    ],
  },
  {
    ref: "JE-2026-00378",
    date: "Jul 28, 2026",
    memo: "Sales invoice · INV-2026-0167",
    source: "Invoices",
    lines: [
      { account: ACCOUNTS.ar, dr: 4356.75, cr: 0 },
      { account: ACCOUNTS.sales, dr: 0, cr: 3924.1 },
      { account: ACCOUNTS.vat, dr: 0, cr: 432.65 },
    ],
  },
];

/* ---- CRM ----------------------------------------------------------------- */

export const STAGES = ["Lead", "Qualified", "Proposal", "Won"] as const;
export type Stage = (typeof STAGES)[number];
export type Deal = { id: string; client: string; title: string; value: number; stage: Stage };

export const DEALS: Deal[] = [
  { id: "d1", client: "Client Lambda", title: "Pilot rollout", value: 2600, stage: "Lead" },
  { id: "d2", client: "Client Kappa", title: "New fit-out", value: 8900, stage: "Qualified" },
  { id: "d3", client: "Client Iota", title: "Expansion order", value: 12400, stage: "Proposal" },
  { id: "d4", client: "Client Theta", title: "Annual renewal", value: 4335, stage: "Won" },
  { id: "d5", client: "Client Mu", title: "Branch opening", value: 5100, stage: "Qualified" },
];

/* ---- manufacturing ------------------------------------------------------- */

export const ORDERS = [
  { ref: "MO-2026-0044", product: "Product Alpha", qty: 120, state: "In progress", pct: 64 },
  { ref: "MO-2026-0045", product: "Product Gamma", qty: 400, state: "Queued", pct: 0 },
  { ref: "MO-2026-0043", product: "Product Beta", qty: 60, state: "QC hold", pct: 100 },
] as const;

export const BOM = [
  { item: "Material Gamma", qty: "2.00 kg", cost: 35.0 },
  { item: "Material Delta", qty: "0.50 kg", cost: 12.4 },
  { item: "Assembly labour", qty: "0.75 h", cost: 9.0 },
  { item: "Machine overhead", qty: "0.75 h", cost: 6.6 },
] as const;

/* ---- reports ------------------------------------------------------------- */

export const REVENUE_BY_MONTH = [
  { m: "Feb", v: 14200 },
  { m: "Mar", v: 16850 },
  { m: "Apr", v: 15400 },
  { m: "May", v: 19120 },
  { m: "Jun", v: 20760 },
  { m: "Jul", v: 23341 },
] as const;

export const AGING = [
  { bucket: "Current", amount: 12480.4, tone: "ok" },
  { bucket: "1 – 30 days", amount: 6460.2, tone: "ok" },
  { bucket: "31 – 60 days", amount: 3120.0, tone: "warn" },
  { bucket: "61 – 90 days", amount: 1845.5, tone: "warn" },
  { bucket: "90+ days", amount: 8645.79, tone: "bad" },
] as const;

/* ---- helpers ------------------------------------------------------------- */

/** Shelf prices include VAT, so the net is extracted rather than added. */
export function splitVat(gross: number) {
  const net = gross / (1 + VAT_RATE);
  return { net: round2(net), vat: round2(gross - net) };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
