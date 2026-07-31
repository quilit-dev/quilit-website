import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/* ============================================================================
   The Quilit mark.

   One component for every appearance so the identity cannot drift — it was
   previously a letter "Q" set in a gradient tile, repeated in four files with
   four slightly different shadows.

   The supplied artwork is a flat single-colour PNG on an opaque near-white
   ground, so it is served pre-keyed from /brand: `mark` for light surfaces,
   `mark-white` for the obsidian ones. A `tone` rather than a CSS filter,
   because filters on a transparent PNG cannot recolour it cleanly.
   ========================================================================== */

export function Mark({
  size = 36,
  tone = "ink",
  className,
}: {
  size?: number;
  /** `ink` on light grounds, `white` on obsidian. */
  tone?: "ink" | "white";
  className?: string;
}) {
  return (
    <Image
      src={tone === "white" ? "/brand/mark-white.png" : "/brand/mark.png"}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      priority
      draggable={false}
    />
  );
}

/** Mark plus the name — the standard lockup used in the nav and footer. */
export function Wordmark({
  size = 34,
  tone = "ink",
  className,
}: {
  size?: number;
  tone?: "ink" | "white";
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Mark size={size} tone={tone} />
      <span
        className={cn(
          "font-display text-[1.05rem] font-bold tracking-[-0.03em]",
          tone === "white" ? "text-white" : "text-plum-950",
        )}
      >
        Quilit
      </span>
    </span>
  );
}
