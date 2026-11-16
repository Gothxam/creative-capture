import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { STUDIO } from "@/lib/content";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/providers/SmoothScroll";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
  themeColor: "#efebe4",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${archivo.variable} ${instrument.variable} ${jetbrains.variable}`}
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
