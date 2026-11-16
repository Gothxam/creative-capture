import { HOME } from "@/lib/content";
import Hero from "@/components/sections/Hero";
import Legacy from "@/components/sections/Legacy";
import StoryScroll from "@/components/sections/StoryScroll";
import HorizontalWork from "@/components/sections/HorizontalWork";
import ServicesList from "@/components/sections/ServicesList";
import Philosophy from "@/components/sections/Philosophy";
import FilmStrip from "@/components/sections/FilmStrip";
import Stats from "@/components/sections/Stats";
import Marquee from "@/components/primitives/Marquee";

export default function HomePage() {
  return (
    <>
      <Hero />

      <div className="border-y border-ink/12 py-4">
        <Marquee
          items={HOME.ticker}
          className="u-display text-[clamp(1.4rem,3.4vw,2.6rem)]"
          speed={34}
        />
      </div>

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
