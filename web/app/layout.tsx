import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Geist_Pixel, Source_Serif_4 } from "next/font/google";
import { STUDIO } from "@/lib/content";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/providers/SmoothScroll";
import "./globals.css";

/**
 * Three faces, each with one job — the split the reference runs on.
 *
 * The site used to lead with a heavy sans set in stretched uppercase, with
 * the serif demoted to italic pull-quotes. That reads as a brutalist
 * editorial poster, which is a different thing from the quiet, precise,
 * instrument-panel register we're after.
 */

/**
 * Headlines. Roman, sentence case, never uppercase.
 *
 * Source Serif rather than Instrument Serif, chosen by measurement against
 * the reference. Its headline face is NType82 — Nothing's own typeface,
 * served from their CDN and not licensable for anyone else — so the job was
 * to find the closest thing that is free. Set the same string at the same
 * size in both: NType82 renders it at 876px and Source Serif at 876px, a 0%
 * difference, and the two break the reference's own headline on the
 * identical word. Instrument Serif came out 15% narrower, which is why it
 * read as a different, more condensed face.
 */
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/**
 * The dot-matrix label, for the one place the reference uses its own: the
 * small line that names what you are looking at, directly above a headline.
 * It is a readout, not a wordmark — the studio name is set in the sans
 * beside the mark, which is where the earlier use of this face was wrong.
 */
const geistPixel = Geist_Pixel({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-geist-pixel",
  display: "swap",
});

/** Everything else: body copy, labels, captions, buttons, figures. */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/**
 * The wordmark beside the studio mark, and nothing else.
 *
 * The logo sets its own name in a clean geometric sans with wide tracking.
 * The wordmark was being set in the dot-matrix face borrowed from the
 * reference site, which is that site's signature rather than this studio's
 * — and next to the real mark it read as two different brands.
 */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://classycaptures.com"),
  title: {
    default: `${STUDIO.name} — Wedding Photography & Cinematography in ${STUDIO.city}`,
    template: `%s — ${STUDIO.name}`,
  },
  description:
    "Luxury wedding photography and cinematography in Bengaluru. Thirty years of candid, emotional storytelling across South India — weddings, pre-weddings, portraits and films.",
  keywords: [
    "wedding photographer Bangalore",
    "luxury wedding photography Bengaluru",
    "South Indian wedding photography",
    "wedding cinematography Bangalore",
    "pre-wedding shoot Bengaluru",
    "candid wedding photographer",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: STUDIO.name,
    title: `${STUDIO.name} — Timeless Wedding Photography in ${STUDIO.city}`,
    description:
      "Thirty years of candid, emotional wedding storytelling across South India.",
  },
  icons: { icon: "/icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f4f4f4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${serif.variable} ${geistPixel.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Reveal targets start hidden for the animation. With scripting off
            nothing would ever un-hide them, so restore them up front. */}
        <noscript>
          <style>{`[data-reveal],[data-reveal-children] > *,[data-mask] > span{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <SmoothScroll>
          <Loader />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
