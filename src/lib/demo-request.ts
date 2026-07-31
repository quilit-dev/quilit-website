/* ============================================================================
   The demo request — shared between the form and the route handler so the
   two can never disagree about what is valid.
   ========================================================================== */

export type DemoRequest = {
  name: string;
  email: string;
  company: string;
  phone?: string;
  size?: string;
  deployment?: string;
  message?: string;
};

export const SIZES = [
  "1 – 10 people",
  "11 – 50 people",
  "51 – 200 people",
  "More than 200",
] as const;

export const DEPLOYMENTS = ["Offline, on our hardware", "Cloud", "Not sure yet"] as const;

/* Deliberately permissive. The point of validating here is to catch a typo
   before it costs someone a reply, not to adjudicate RFC 5322 — every clever
   email regex rejects addresses that genuinely work. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type Errors = Partial<Record<keyof DemoRequest, string>>;

export function validate(v: Partial<DemoRequest>): Errors {
  const e: Errors = {};
  if (!v.name?.trim()) e.name = "Tell us who to ask for.";
  if (!v.email?.trim()) e.email = "We need somewhere to send the invitation.";
  else if (!EMAIL.test(v.email.trim())) e.email = "That address looks incomplete.";
  if (!v.company?.trim()) e.company = "Which business are we setting up?";
  if (v.message && v.message.length > 2000) e.message = "Please keep this under 2000 characters.";
  return e;
}

/** Plain-text rendering for the notification email. */
export function asText(v: DemoRequest) {
  return [
    `Name:        ${v.name}`,
    `Email:       ${v.email}`,
    `Company:     ${v.company}`,
    v.phone ? `Phone:       ${v.phone}` : null,
    v.size ? `Size:        ${v.size}` : null,
    v.deployment ? `Deployment:  ${v.deployment}` : null,
    "",
    v.message ? `What they want to see:\n${v.message}` : "(no message)",
  ]
    .filter((l) => l !== null)
    .join("\n");
}
