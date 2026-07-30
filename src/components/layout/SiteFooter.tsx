import React from "react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      "Sales & invoicing",
      "Point of sale",
      "Inventory & lots",
      "Manufacturing",
      "Accounting",
      "HR & payroll",
    ],
  },
  {
    title: "Company",
    links: ["About", "Customers", "Partners", "Careers", "Contact"],
  },
  {
    title: "Resources",
    links: ["Documentation", "API reference", "Release notes", "Status", "Security"],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-obsidian-950 px-6 pb-10 pt-20 text-plum-200/60 lg:px-10">
      <div className="film-grain" aria-hidden />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-plum-400/25 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-[76rem]">
        <div className="grid gap-12 border-b border-white/6 pb-14 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-gradient-to-br from-plum-500 to-plum-800 text-[0.78rem] font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)]">
                Q
              </span>
              <span className="font-display text-[1.05rem] font-bold tracking-[-0.03em] text-white">
                Quilit
              </span>
            </div>
            <p className="mt-5 max-w-xs text-[0.9rem] leading-relaxed">
              One system for sales, stock, production, accounting and people —
              deployed the way you prefer and licensed module by module.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Offline or cloud", "Licensed per module", "English & العربية"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/8 bg-white/4 px-3 py-1 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-plum-300/60"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-plum-300/45">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-[0.9rem] transition-colors hover:text-white"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-8 font-mono text-[0.72rem] tracking-wide text-plum-300/40">
          <span>© {new Date().getFullYear()} Quilit ERP. All rights reserved.</span>
          <span>Python · FastAPI · React · SQLite</span>
        </div>
      </div>
    </footer>
  );
}
