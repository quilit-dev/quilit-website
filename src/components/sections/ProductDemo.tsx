"use client";

import React from "react";
import { Section, SectionHeading, Reveal } from "@/components/ui/primitives";
import { ErpDemo } from "@/components/demo/ErpDemo";

/* ============================================================================
   Replaces the screenshot gallery that used to sit here.

   A screenshot asks to be believed. This asks to be used — and the thing it
   demonstrates is the one claim the rest of the page can only assert: convert
   a quotation and the invoice exists; settle the invoice and a balanced entry
   posts itself; ring up a sale and stock falls. One set of numbers.
   ========================================================================== */

export function ProductDemo() {
  return (
    <Section id="showcase" tone="bone">
      <SectionHeading
        align="split"
        eyebrow="Try it here"
        title={
          <>
            Not a video.
            <br />
            <span className="font-serif italic text-plum-600">Click around it.</span>
          </>
        }
        lead="A simplified recreation of Quilit, running in this page. Raise a quotation, take a payment, ring up a sale — then open Accounting and see what posted itself."
        aside={
          <span className="hidden items-center gap-2.5 rounded-full border border-plum-900/10 bg-white px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-plum-900/45 lg:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade-400" />
            Interactive demo · not the live app
          </span>
        }
      />

      <Reveal delay={0.08} className="mt-10">
        <ErpDemo />
      </Reveal>

      {/* Said plainly rather than buried: the demo is a recreation built for
          this page, and a visitor should not arrive at a sales call expecting
          these exact screens. The behaviour is the honest part — the chrome
          is simplified. */}
      <Reveal delay={0.14}>
        <p className="mx-auto mt-5 max-w-2xl text-center text-[0.82rem] leading-relaxed text-plum-900/45">
          A demonstration, not the live product. The chrome, columns and controls are
          built from the application&rsquo;s own design system, but this runs on sample data
          and covers nine of the twenty-eight modules — the real screens carry more
          filters, actions and detail than you see here. What is faithful is the
          behaviour: documents flow between modules exactly like this, and the ledger
          really is derived rather than typed.
        </p>
      </Reveal>
    </Section>
  );
}
