import type { Metadata } from "next";
import { CONTACT, STUDIO } from "@/lib/content";
import PageHero from "@/components/sections/PageHero";
import ContactForm from "@/components/sections/ContactForm";
import Figure from "@/components/primitives/Figure";
import Reveal from "@/components/primitives/Reveal";

export const metadata: Metadata = {
  title: "Contact — Enquire About Your Date",
  description: `Enquire about wedding photography and cinematography with Classy Captures, Bengaluru. Email ${STUDIO.email} or call ${STUDIO.phone}.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow={CONTACT.eyebrow}
        title={CONTACT.title}
        lead={CONTACT.lead}
        media="forehead-rest"
      />

      <section className="px-[var(--gutter)] pb-[clamp(4rem,10vw,9rem)]">
        <div className="grid gap-x-10 gap-y-14 md:grid-cols-12">
          <div className="md:col-span-7">
            <ContactForm />
          </div>

          <div className="md:col-span-4 md:col-start-9">
            <Reveal>
              <Figure
                slug="close-whisper"
                alt="A couple, close"
                ratio="4/5"
                sizes="(max-width: 768px) 100vw, 32vw"
              />
            </Reveal>

            <div className="mt-10 space-y-8">
              <Reveal delay={0.1}>
                <h2 className="u-mono mb-3 text-ink-faint">Email</h2>
                <a
                  href={`mailto:${STUDIO.email}`}
                  className="break-all text-[1.05rem] transition-colors hover:text-ember"
                >
                  {STUDIO.email}
                </a>
              </Reveal>

              <Reveal delay={0.16}>
                <h2 className="u-mono mb-3 text-ink-faint">Phone</h2>
                <a
                  href={`tel:${STUDIO.phoneHref}`}
                  className="text-[1.05rem] transition-colors hover:text-ember"
                >
                  {STUDIO.phone}
                </a>
              </Reveal>

              <Reveal delay={0.22}>
                <h2 className="u-mono mb-3 text-ink-faint">Studio</h2>
                <address className="not-italic leading-relaxed text-ink-soft">
                  {STUDIO.address}
                </address>
                <p className="u-mono mt-3 text-ink-faint">{STUDIO.coords}</p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
