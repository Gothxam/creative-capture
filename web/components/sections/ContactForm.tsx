"use client";

import { useRef, useState } from "react";
import { CONTACT, STUDIO } from "@/lib/content";
import { EASE, gsap, useGSAP } from "@/lib/gsap";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Enquiry form.
 *
 * Posts to `NEXT_PUBLIC_FORM_ENDPOINT` when one is configured (Formspree,
 * Basin, a custom handler — anything that accepts a JSON POST). With no
 * endpoint set it falls back to opening a pre-filled email to the studio, so
 * the form is never a dead end.
 */
export default function ContactForm() {
  const endpoint = process.env.NEXT_PUBLIC_FORM_ENDPOINT;
  const root = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  useGSAP(
    () => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-field]", root.current);
      if (!rows.length) return;
      gsap.from(rows, {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: EASE,
        stagger: 0.07,
        scrollTrigger: { trigger: root.current, start: "top 85%", once: true },
      });
    },
    { scope: root },
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;

    if (!endpoint) {
      const body = [
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Date: ${data.date || "—"}`,
        `Venue: ${data.place || "—"}`,
        "",
        data.message,
      ].join("\n");
      window.location.href = `mailto:${STUDIO.email}?subject=${encodeURIComponent(
        `Wedding enquiry — ${data.name}`,
      )}&body=${encodeURIComponent(body)}`;
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const field =
    "peer w-full border-b border-ink/25 bg-transparent py-3 text-[1.05rem] outline-none transition-colors placeholder:text-ink-faint focus:border-ink";

  return (
    <form ref={root} onSubmit={onSubmit} className="space-y-9">
      <div className="grid gap-9 sm:grid-cols-2">
        <label data-field className="block">
          <span className="u-mono text-ink-faint">{CONTACT.fields.name}</span>
          <input name="name" required autoComplete="name" className={field} placeholder="—" />
        </label>
        <label data-field className="block">
          <span className="u-mono text-ink-faint">{CONTACT.fields.email}</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={field}
            placeholder="—"
          />
        </label>
        <label data-field className="block">
          <span className="u-mono text-ink-faint">{CONTACT.fields.date}</span>
          <input name="date" className={field} placeholder="Month / year is fine" />
        </label>
        <label data-field className="block">
          <span className="u-mono text-ink-faint">{CONTACT.fields.place}</span>
          <input name="place" className={field} placeholder="—" />
        </label>
      </div>

      <label data-field className="block">
        <span className="u-mono text-ink-faint">{CONTACT.fields.message}</span>
        <textarea name="message" rows={5} required className={`${field} resize-none`} placeholder="—" />
      </label>

      <div data-field className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group relative overflow-hidden border border-ink px-9 py-4 transition-colors disabled:opacity-50"
        >
          <span className="u-mono relative z-10 transition-colors group-hover:text-paper">
            {status === "sending" ? "Sending…" : "Send enquiry"}
          </span>
          <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-y-100" />
        </button>

        <p role="status" aria-live="polite" className="u-mono text-ink-soft">
          {status === "sent" && "Thank you — we'll be in touch shortly."}
          {status === "error" && "Something went wrong. Please email us directly."}
        </p>
      </div>
    </form>
  );
}
