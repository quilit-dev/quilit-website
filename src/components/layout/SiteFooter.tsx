import React from "react";
import { Icon } from "@/components/ui/primitives";

/* ============================================================================
   Footer.

   Every link here points at a section that exists on this page. Nothing is
   invented: there is no docs site, status page or careers page yet, so none
   are listed. A footer full of dead links costs more credibility than a short
   one — those columns can be added the moment the destinations are real.
   ========================================================================== */

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Sales & invoicing", href: "#modules" },
      { label: "Point of sale", href: "#modules" },
      { label: "Inventory & lots", href: "#modules" },
      { label: "Manufacturing", href: "#modules" },
      { label: "Accounting", href: "#modules" },
      { label: "HR & payroll", href: "#modules" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Why Quilit", href: "#why" },
      { label: "Product screens", href: "#showcase" },
      { label: "Industries", href: "#industries" },
      { label: "Deployment", href: "#deployment" },
      { label: "Questions", href: "#faq" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Book a demo", href: "#demo" },
      { label: "Request a quote", href: "#demo" },
      { label: "Talk to sales", href: "#demo" },
    ],
  },
];

const CAPABILITIES = [
  "Offline or cloud",
  "Licensed per module",
  "English & العربية",
  "Role-based access",
  "Audit log",
  "Automatic backups",
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-obsidian-950 px-6 pb-10 pt-20 text-plum-200/60 lg:px-10 lg:pt-24">
      <div className="film-grain" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-plum-400/25 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(108,77,105,0.22), transparent 72%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[76rem]">
        {/* ---- closing prompt: the primary action, one last time ---- */}
        <div className="flex flex-col gap-6 border-b border-white/8 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-plum-500 to-plum-800 text-[0.78rem] font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                Q
              </span>
              <span className="font-display text-[1.05rem] font-bold tracking-[-0.03em] text-white">
                Quilit
              </span>
            </div>
            <p className="mt-5 max-w-sm text-[1.05rem] leading-snug text-white/85">
              One system for sales, stock, production, accounting and people.
            </p>
          </div>

          <a
            href="#demo"
            className="btn-tactile-light inline-flex w-fit items-center gap-2 rounded-full px-7 py-3.5 text-[0.95rem] font-semibold transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-300"
          >
            Book a demo
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* ---- link columns ---- */}
        <div className="grid gap-10 border-b border-white/8 py-12 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-plum-300/45">
              What ships with it
            </h3>
            <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {CAPABILITIES.map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-[0.86rem]">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] bg-white/8 text-plum-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5" aria-hidden>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-plum-300/45">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="rounded text-[0.88rem] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-400"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ---- base ---- */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-8">
          <span className="font-mono text-[0.72rem] tracking-wide text-plum-300/40">
            © {new Date().getFullYear()} Quilit. All rights reserved.
          </span>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-plum-300/40">
              <Icon name="globe" className="h-3.5 w-3.5" />
              English · العربية
            </span>
            <span className="font-mono text-[0.72rem] tracking-wide text-plum-300/40">
              Python · FastAPI · React
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
