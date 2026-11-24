import type { Metadata, Viewport } from "next";
import { Geist_Mono, Geist_Pixel, Instrument_Serif } from "next/font/google";
import { STUDIO } from "@/lib/content";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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

/** Headlines. Set roman and in sentence case, never uppercase. */
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/** Everything else: body copy, labels, captions, buttons, figures. */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/**
 * The dot-matrix voice: wordmark, counters, the loader. Stands in for the
 * reference's proprietary dot font — same pixel-grid construction, and the
 * only free face that reads as a readout rather than as a typeface.
 */
const geistPixel = Geist_Pixel({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-geist-pixel",
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
      className={`${instrument.variable} ${geistMono.variable} ${geistPixel.variable}`}
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
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
