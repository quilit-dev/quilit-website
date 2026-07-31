/** Single source of truth for the in-page navigation — the floating nav, the
    hero's own nav and both mobile menus render from this list. */
export const LINKS = [
  { label: "Modules", href: "#modules" },
  { label: "How it works", href: "#workflow" },
  { label: "Product", href: "#showcase" },
  { label: "Industries", href: "#industries" },
  { label: "Deployment", href: "#deployment" },
  { label: "FAQ", href: "#faq" },
] as const;
