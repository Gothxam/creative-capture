"use client";

import { useState } from "react";
import { MEDIA, type MediaCategory } from "@/lib/media.generated";
import GalleryWall from "@/components/sections/GalleryWall";

const TABS: { label: string; value: MediaCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Weddings", value: "weddings" },
  { label: "Pre-Wedding", value: "pre-wedding" },
  { label: "Portraits", value: "portraits" },
];

export default function GalleryFilter() {
  const [filter, setFilter] = useState<MediaCategory | "all">("all");

  return (
    // Narrow side margins: the wall runs almost edge to edge, which is what
    // makes it read as an archive rather than a page of thumbnails.
    <section className="overflow-clip px-1.5 pb-[clamp(3rem,7vw,6rem)]">
      {/* The filter bar keeps the page gutter; only the wall below bleeds. */}
      <div className="u-rule mx-[calc(var(--gutter)-0.375rem)] flex flex-wrap items-center gap-x-7 gap-y-3 py-5">
        {TABS.map((tab) => {
          const active = filter === tab.value;
          const count =
            tab.value === "all"
              ? MEDIA.length
              : MEDIA.filter((m) => m.category === tab.value).length;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              aria-pressed={active}
              className={`u-mono group relative py-1 transition-colors ${
                active ? "text-ink" : "text-ink-faint hover:text-ink"
              }`}
            >
              {tab.label}
              <sup className="ml-1 opacity-60">{count}</sup>
              <span
                className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-ember transition-transform duration-500 ${
                  active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* `key` remounts the wall on filter change so the columns redistribute
          and replay their entrance rather than re-flowing in place. */}
      <div className="mt-[clamp(1.5rem,3vw,2.5rem)]">
        <GalleryWall key={filter} filter={filter} />
      </div>
    </section>
  );
}
