import Hero from "@/components/sections/Hero";
import CategoryRow from "@/components/sections/CategoryRow";
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

      {/* What can be booked, within a screen of the hero — the position the
          reference gives its category row. The services used to arrive six
          sections down, after the whole atmospheric run. */}
      <CategoryRow />

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
