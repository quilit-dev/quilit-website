"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Where does our data actually live?",
    a: "Wherever you want it. Run Quilit offline on your own machine or server, where nothing is transmitted anywhere and the system works with no internet connection at all — or let us host it, so branches and remote staff reach one instance without you administering anything. It is the same product either way, and you can move between them later by migrating a single database.",
  },
  {
    q: "Do we have to buy the whole thing?",
    a: "No. Licensing is per module, and in places per feature, so you pay for what you actually use. Start with sales and stock, add manufacturing or payroll the month you need them. A module you have not licensed returns 403 at its own endpoint rather than merely being hidden from the menu, and adding one later is a licence change rather than a migration.",
  },
  {
    q: "Is the accounting real double-entry, or a report?",
    a: "Real double-entry. There is a seeded chart of accounts, and business events post their own balanced journal entries — invoice payments, expenses, payroll, depreciation and paid purchases. The trial balance always ties out, and corrections are made by posting a reversing entry rather than deleting anything.",
  },
  {
    q: "How does it handle two currencies?",
    a: "One base currency holds every balance, cost and report. A second currency exists for payment capture, so a client can settle in LBP against a USD invoice. The payment stores what was handed over, the rate used and the converted amount. Rates are entered manually with full history — deliberately, since offline installs cannot reach a rate feed.",
  },
  {
    q: "What happens when someone deletes the wrong thing?",
    a: "Very little. Records are archived with a reason, or soft-deleted into a recycle bin that holds them for thirty days with individual and bulk restore. Journal entries are never deleted at all. Every mutation is written to an audit log that a normal admin cannot edit.",
  },
  {
    q: "Does Arabic actually work, or is it a font swap?",
    a: "The layout mirrors properly for RTL and the typeface changes to Cairo. Notification text generated on the server is stored as a key and rendered in each viewer's own language, so two people looking at the same event see it in different words.",
  },
  {
    q: "How do backups work?",
    a: "Daily and weekly backups run automatically, each one checksummed and then restore-tested rather than merely written. The database is integrity-checked before the server accepts traffic. You can also export to a USB stick or network folder in one click, and restore from any backup file.",
  },
  {
    q: "Can it run across several branches?",
    a: "Yes. A branch is a warehouse, so there is one concept rather than two overlapping ones. Records and reporting can be scoped per branch, users can be restricted to the branches they work in, and a report tab compares locations side by side.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" tone="bone">
      <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <SectionHeading
            align="left"
            eyebrow="Questions"
            title={
              <>
                The things buyers
                <br />
                <span className="font-serif italic text-plum-600">ask us first.</span>
              </>
            }
            lead="If yours is not here, a forty-minute call will cover it properly."
            className="max-w-none"
          />
        </div>

        <div className="divide-y divide-plum-900/8 border-y border-plum-900/8">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, x: 28, rotateY: -6, transformPerspective: 1200 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: Math.min(i, 5) * 0.05,
                }}
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={cn(
                        "font-display text-[1.08rem] font-semibold leading-snug tracking-[-0.018em] transition-colors",
                        isOpen ? "text-plum-600" : "text-plum-950 group-hover:text-plum-700",
                      )}
                    >
                      {f.q}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                        isOpen
                          ? "border-plum-600/25 bg-plum-600 text-white"
                          : "border-plum-900/12 text-plum-900/45 group-hover:border-plum-900/25",
                      )}
                    >
                      <motion.svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        className="h-3 w-3"
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        aria-hidden
                      >
                        <path d="M12 5v14M5 12h14" />
                      </motion.svg>
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 pr-10 text-[0.96rem] leading-relaxed text-plum-900/58">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
