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
        lead="A working slice of Quilit, running in this page. Raise a quotation, take a payment, ring up a sale — then open Accounting and see what posted itself."
        aside={
          <span className="hidden items-center gap-2.5 rounded-full border border-plum-900/10 bg-white px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-plum-900/45 lg:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-jade-400" />
            Interactive · nothing is faked
          </span>
        }
      />

      <Reveal delay={0.08} className="mt-10">
        <ErpDemo />
      </Reveal>

      <Reveal delay={0.14}>
        <p className="mt-5 text-center text-[0.82rem] text-plum-900/40">
          Sample data, and a slice of the modules. The real system carries 28 of them.
        </p>
      </Reveal>
    </Section>
  );
}
