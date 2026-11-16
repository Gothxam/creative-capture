import type { Metadata } from "next";
import { MEDIA } from "@/lib/media.generated";
import PageHero from "@/components/sections/PageHero";
import GalleryFilter from "@/components/sections/GalleryFilter";

export const metadata: Metadata = {
  title: "Gallery — Weddings, Pre-Weddings & Portraits",
  description:
    "Curated collections from Classy Captures: weddings, pre-weddings and portraits photographed across Bengaluru and South India.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="[ Gallery ]"
        title={["Gallery"]}
        lead="Each collection captures the soul of a moment — a glimpse into how we see love, light and life."
        meta={`${MEDIA.length} frames`}
      />
      <GalleryFilter />
    </>
  );
}
