import Hero from "@/components/sections/Hero";
import Legacy from "@/components/sections/Legacy";
import StoryScroll from "@/components/sections/StoryScroll";
import HorizontalWork from "@/components/sections/HorizontalWork";
import ServicesList from "@/components/sections/ServicesList";
import Philosophy from "@/components/sections/Philosophy";
import FilmStrip from "@/components/sections/FilmStrip";
import Stats from "@/components/sections/Stats";
import PhotoBand from "@/components/sections/PhotoBand";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Photographs, not slogans. This band used to scroll the studio's own
          taglines across the full width at up to 42px. */}
      <PhotoBand />

      <Legacy />
      <StoryScroll />
      <HorizontalWork />
      <ServicesList />
      <Philosophy />
      <FilmStrip />
      <Stats />
    </>
  );
}
