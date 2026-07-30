import fs from "node:fs";
import path from "node:path";
import { Section, SectionHeading } from "@/components/ui/primitives";
import { IndustriesGrid } from "./IndustriesGrid";

/* ============================================================================
   Industries — server component.

   Which photographs exist is resolved here, on the server, rather than by
   letting the browser request a missing file and catching the error: ten
   absent images meant ten failed requests and ten console errors on every
   single page load. Tiles without a photograph render a plum plate instead.

   Photographs live in  public/industries/<key>.jpg  — see IndustriesGrid for
   the manifest of filenames and what each shot should show. New images are
   picked up on the next build (or immediately under `npm run dev`).
   ========================================================================== */

const KEYS = [
  // retail split into the store types Quilit is actually sold into
  "grocery",
  "pharmacy",
  "clothing",
  "electronics",
  "hospitality",
  "manufacturing",
  "construction",
  "distribution",
  "warehousing",
  "services",
  "education",
  "automotive",
  "finance",
  "real-estate",
];

const EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/** Maps each industry key to the real file that exists for it, extension and
 *  all. Returning only *which* keys have a photo is not enough — assuming the
 *  extension meant a .png on disk was still requested as .jpg and 400'd. */
function resolveImageMap(): Record<string, string> {
  const dir = path.join(process.cwd(), "public", "industries");
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return {}; // folder not created yet — every tile uses its plate
  }
  const map: Record<string, string> = {};
  for (const key of KEYS) {
    const hit = EXTENSIONS.map((ext) => key + ext).find((f) => entries.includes(f));
    if (hit) map[key] = `/industries/${hit}`;
  }
  return map;
}

export function Industries() {
  const images = resolveImageMap();

  return (
    <Section id="industries" tone="obsidian">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(closest-side, rgba(163,127,156,0.15), transparent 72%)",
        }}
      />

      <SectionHeading
        align="split"
        tone="dark"
        eyebrow="Where Quilit is running"
        title={
          <>
            Fourteen trades,
            <br />
            <span className="font-serif italic text-plum-300">
              one system underneath.
            </span>
          </>
        }
        lead="The business type you pick at setup seeds the right attributes, categories and defaults. It arrives already speaking your trade."
        aside={
          <span className="hidden items-center gap-2.5 rounded-full border border-white/12 bg-white/5 px-4 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-plum-300/55 lg:inline-flex">
            Drag the rails to explore
          </span>
        }
      />

      <IndustriesGrid images={images} />
    </Section>
  );
}
