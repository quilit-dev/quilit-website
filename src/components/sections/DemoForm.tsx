"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  DEPLOYMENTS,
  SIZES,
  asText,
  validate,
  type DemoRequest,
  type Errors,
} from "@/lib/demo-request";

/* ============================================================================
   The booking form.

   Every "Book a demo" on the page points at #demo, which until now was a
   headline whose own button linked back to itself — the site had no contact
   channel at all.

   Three states: form, sending, sent. A failure never dead-ends; if the
   endpoint is unconfigured or down, the details are offered for copying
   alongside whatever direct contact exists, because the visitor's intent is
   the scarce thing here, not the transport.
   ========================================================================== */

const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;

type Status = "idle" | "sending" | "sent" | "failed";

export function DemoForm() {
  const [values, setValues] = useState<Partial<DemoRequest>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [copied, setCopied] = useState(false);
  /* Stamped after mount, not during render: calling Date.now() while
     rendering is impure and makes the component non-deterministic. */
  const mounted = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const uid = useId();

  useEffect(() => {
    mounted.current = Date.now();
  }, []);

  const set = (k: keyof DemoRequest, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    /* Clear the error the moment it stops being true, rather than waiting for
       the next submit — being told off while you fix it is the thing people
       hate most about forms. */
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`${uid}-${Object.keys(found)[0]}`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: honeypot.current?.value ?? "",
          elapsed: mounted.current ? Date.now() - mounted.current : 0,
        }),
      });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      if (res.status === 422) {
        const body = await res.json();
        setErrors(body.errors ?? {});
        setStatus("idle");
        return;
      }
      setStatus("failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return (
      <Panel>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="py-6 text-center"
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-jade-500/15 text-jade-400">
            <Icon name="check" className="h-5 w-5" />
          </span>
          <h3 className="mt-5 font-display text-[1.4rem] font-bold tracking-[-0.026em] text-white">
            Request received.
          </h3>
          <p className="mx-auto mt-3 max-w-sm text-[0.95rem] leading-relaxed text-plum-200/60">
            We will reply to <span className="text-white">{values.email}</span> within one working
            day to agree a time. Bring a month of invoices and a product list and we will load
            them live.
          </p>
        </motion.div>
      </Panel>
    );
  }

  return (
    <Panel>
      <form onSubmit={onSubmit} noValidate className="text-left">
        {/* Not display:none — some bots skip hidden fields. Off-screen and
            removed from the tab order and the accessibility tree instead. */}
        <input
          ref={honeypot}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            id={`${uid}-name`}
            label="Your name"
            required
            value={values.name ?? ""}
            onChange={(v) => set("name", v)}
            error={errors.name}
            autoComplete="name"
          />
          <Field
            id={`${uid}-email`}
            label="Work email"
            required
            type="email"
            value={values.email ?? ""}
            onChange={(v) => set("email", v)}
            error={errors.email}
            autoComplete="email"
          />
          <Field
            id={`${uid}-company`}
            label="Company"
            required
            value={values.company ?? ""}
            onChange={(v) => set("company", v)}
            error={errors.company}
            autoComplete="organization"
          />
          <Field
            id={`${uid}-phone`}
            label="Phone or WhatsApp"
            hint="optional"
            type="tel"
            value={values.phone ?? ""}
            onChange={(v) => set("phone", v)}
            autoComplete="tel"
          />
          <Select
            id={`${uid}-size`}
            label="Team size"
            value={values.size ?? ""}
            onChange={(v) => set("size", v)}
            options={SIZES}
            placeholder="Select…"
          />
          <Select
            id={`${uid}-deployment`}
            label="Deployment"
            value={values.deployment ?? ""}
            onChange={(v) => set("deployment", v)}
            options={DEPLOYMENTS}
            placeholder="Select…"
          />
        </div>

        <div className="mt-3.5">
          <Field
            id={`${uid}-message`}
            label="What would you like to see?"
            hint="optional"
            textarea
            value={values.message ?? ""}
            onChange={(v) => set("message", v)}
            error={errors.message}
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className={cn(
            "btn-tactile-light mt-5 flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5",
            "text-[0.98rem] font-semibold transition-transform duration-300",
            status === "sending" ? "cursor-wait opacity-70" : "hover:-translate-y-0.5",
          )}
        >
          {status === "sending" ? "Sending…" : "Request a demo"}
          {status !== "sending" && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>

        <p className="mt-3.5 text-center text-[0.76rem] leading-relaxed text-plum-300/75">
          No newsletter, no reseller calls. We use this only to arrange the walkthrough.
        </p>

        {/* A failure hands the visitor their own details back rather than
            losing them. */}
        <AnimatePresence>
          {status === "failed" && (
            <motion.div
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 rounded-2xl border border-gold-500/30 bg-gold-500/8 p-4"
            >
              <p className="text-[0.88rem] font-semibold text-gold-400">
                That did not go through.
              </p>
              <p className="mt-1.5 text-[0.84rem] leading-relaxed text-plum-200/70">
                Nothing is lost — copy your details and send them across directly and we will
                pick it up from there.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(asText(values as DemoRequest));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="glass-badge rounded-full px-4 py-2 text-[0.82rem] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {copied ? "Copied" : "Copy my details"}
                </button>
                {EMAIL && (
                  <a
                    href={`mailto:${EMAIL}?subject=${encodeURIComponent(
                      `Demo request — ${values.company ?? ""}`,
                    )}&body=${encodeURIComponent(asText(values as DemoRequest))}`}
                    className="glass-badge rounded-full px-4 py-2 text-[0.82rem] font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Email us
                  </a>
                )}
                {WHATSAPP && (
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
                      asText(values as DemoRequest),
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-badge rounded-full px-4 py-2 text-[0.82rem] font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Panel>
  );
}

/* ---- pieces -------------------------------------------------------------- */

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass-badge rounded-[26px] p-5 sm:p-7">
      {children}
    </div>
  );
}

const FIELD =
  "w-full rounded-xl border bg-white/[0.04] px-3.5 py-2.5 text-[0.95rem] text-white placeholder:text-plum-300/45 " +
  "transition-colors duration-200 outline-none focus:border-plum-300/60 focus:bg-white/[0.07]";

/* Opacities here are set by measurement, not taste: at /55 the labels scored
   3.35:1 against the obsidian ground and the hints 2.28:1. A form label is
   essential UI, not decoration — it has to clear 4.5:1. */
function Label({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-baseline gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-plum-300/80"
    >
      {children}
      {required && <span className="text-plum-300/75">*</span>}
      {hint && <span className="normal-case tracking-normal text-plum-300/75">{hint}</span>}
    </label>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  type = "text",
  textarea,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  textarea?: boolean;
  autoComplete?: string;
}) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="min-w-0">
      <Label htmlFor={id} hint={hint} required={required}>
        {label}
      </Label>
      <Tag
        id={id}
        type={textarea ? undefined : type}
        rows={textarea ? 3 : undefined}
        value={value}
        autoComplete={autoComplete}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={cn(FIELD, error ? "border-red-400/60" : "border-white/12", textarea && "resize-y")}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[0.78rem] text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function Select({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder: string;
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD, "cursor-pointer border-white/12", !value && "text-plum-300/40")}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-obsidian-900 text-white">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
