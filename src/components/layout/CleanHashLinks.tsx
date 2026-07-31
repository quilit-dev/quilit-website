"use client";

import { useEffect } from "react";

/* ============================================================================
   Keeps the address bar clean.

   Every in-page link is an `#anchor`, and the browser's default behaviour
   writes that fragment into the URL — so reading the page leaves you at
   erp.quilit.dev/#deployment rather than erp.quilit.dev. One delegated
   listener scrolls to the target itself and never touches history.

   The anchors keep their real `href`: they stay right-clickable, keyboard
   accessible, crawlable, and still work if this script never runs. Only the
   plain left-click is intercepted — modified clicks (new tab, new window,
   download) are left entirely alone.
   ========================================================================== */

export function CleanHashLinks() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollTo = (hash: string) => {
      const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
      if (hash === "#top" || hash === "#") {
        window.scrollTo({ top: 0, behavior });
        return true;
      }
      const el = document.querySelector(hash);
      if (!el) return false;
      el.scrollIntoView({ behavior, block: "start" });
      /* Scrolling alone does not move focus, which strands keyboard and
         screen-reader users at the top of the document. */
      const target = el as HTMLElement;
      const hadTabIndex = target.hasAttribute("tabindex");
      if (!hadTabIndex) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      if (!hadTabIndex) target.removeAttribute("tabindex");
      return true;
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      if (scrollTo(href)) e.preventDefault();
    };

    document.addEventListener("click", onClick);

    /* A shared or reloaded URL may already carry a fragment. Honour it, then
       tidy the bar — replaceState so the back button is not polluted. */
    if (window.location.hash) {
      const hash = window.location.hash;
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      requestAnimationFrame(() => scrollTo(hash));
    }

    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
