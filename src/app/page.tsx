import { CinematicHero } from "@/components/hero/CinematicHero";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrustBar } from "@/components/sections/TrustBar";
import { Modules } from "@/components/sections/Modules";
import { Workflow } from "@/components/sections/Workflow";
import { WhyQuilit } from "@/components/sections/WhyQuilit";
import { Showcase } from "@/components/sections/Showcase";
import { Industries } from "@/components/sections/Industries";
import { Deployment } from "@/components/sections/Deployment";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="top" className="w-full overflow-x-clip">
        {/* The nav measures this element to know when the pinned runway ends. */}
        <CinematicHero className="" />

        {/* Light → light-deep → dark alternation gives the scroll a pulse
            instead of one continuous wall of the same surface. */}
        <TrustBar />
        <Modules />
        <Workflow />
        <WhyQuilit />
        <Showcase />
        <Industries />
        <Deployment />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
