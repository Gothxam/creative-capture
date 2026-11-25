import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
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
 * The three faces the reference actually uses, supplied as files.
 *
 * NType82 for headlines, Ndot for the dot-matrix label, Lettera Mono for
 * the small readouts. These replace the free stand-ins that were chosen by
 * measuring against them — Source Serif matched NType82's width to 0%, but
 * a match is still not the thing.
 *
 * Licensing is worth naming here: the archive these came from credits
 * "NOTHING Tech. All Rights Reserved." and carries no licence file.
 * NType82 and Ndot are Nothing's own brand typefaces and Lettera Mono is a
 * Lineto retail font, so none of the three is licensed for use on this
 * site. That is the site owner's call, not a technical one, and the
 * stand-ins are one commit away if it needs reversing.
 */
const ntype82 = localFont({
  src: "./fonts/NType82-Regular.otf",
  // The binding name becomes the CSS family name. `serif` here collided
  // with the generic keyword and the file was never used.
  variable: "--font-instrument",
  display: "swap",
  weight: "400",
});

const dot = localFont({
  src: "./fonts/Ndot57-Regular.otf",
  variable: "--font-geist-pixel",
  display: "swap",
  weight: "400",
});

const letteraMono = localFont({
  src: "./fonts/LetteraMonoLL-Regular.otf",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "400",
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
      className={`${ntype82.variable} ${dot.variable} ${geist.variable} ${letteraMono.variable}`}
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
