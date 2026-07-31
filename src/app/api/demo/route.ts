import { NextResponse } from "next/server";
import { asText, validate, type DemoRequest } from "@/lib/demo-request";

/* ============================================================================
   Demo requests.

   Two transports, tried in order, both configured entirely by environment so
   no credential ever lands in the repository:

     RESEND_API_KEY + DEMO_INBOX   → email notification
     DEMO_WEBHOOK_URL              → POST the JSON anywhere (Slack, Zapier, CRM)

   If neither is set the handler returns 503 with `configured: false` rather
   than a cheerful 200. A form that swallows a lead and says "thanks" is worse
   than no form at all — the visitor believes they have made contact and never
   follows up. The UI turns that response into the direct contact details.
   ========================================================================== */

export const runtime = "nodejs";

/* A single box is plenty for a marketing form: it costs nothing, survives the
   only attack that matters here (one script hammering one endpoint), and
   resets on redeploy. Anything more wants a real store. */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 5000) HITS.clear(); // crude ceiling, this is not a database
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  let body: Partial<DemoRequest> & { website?: string; elapsed?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  /* Honeypot + time-to-submit. Both are silently accepted so a bot cannot
     learn which field gave it away, but nothing is dispatched. */
  const looksAutomated = Boolean(body.website) || (body.elapsed ?? Infinity) < 2000;
  if (looksAutomated) return NextResponse.json({ ok: true });

  const errors = validate(body);
  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const data: DemoRequest = {
    name: body.name!.trim(),
    email: body.email!.trim(),
    company: body.company!.trim(),
    phone: body.phone?.trim() || undefined,
    size: body.size || undefined,
    deployment: body.deployment || undefined,
    message: body.message?.trim() || undefined,
  };

  const { RESEND_API_KEY, DEMO_INBOX, DEMO_WEBHOOK_URL } = process.env;

  try {
    if (RESEND_API_KEY && DEMO_INBOX) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.DEMO_FROM || "Quilit <onboarding@resend.dev>",
          to: [DEMO_INBOX],
          reply_to: data.email,
          subject: `Demo request — ${data.company} (${data.name})`,
          text: asText(data),
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
      return NextResponse.json({ ok: true });
    }

    if (DEMO_WEBHOOK_URL) {
      const res = await fetch(DEMO_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, receivedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Webhook ${res.status}`);
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error("[demo] dispatch failed", err);
    return NextResponse.json(
      { ok: false, configured: true, error: "We could not send that just now." },
      { status: 502 },
    );
  }

  console.warn("[demo] no transport configured — request not delivered:", data.email);
  return NextResponse.json({ ok: false, configured: false }, { status: 503 });
}
