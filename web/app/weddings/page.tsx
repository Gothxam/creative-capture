import type { Metadata } from "next";
import CollectionPage from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "Wedding Photography in Bengaluru",
  description:
    "South Indian and destination wedding photography in Bengaluru — candid, emotional and everlasting imagery from one of the city's longest-standing studios.",
};

const CAPTIONS = [
  "The mandap",
  "Bride, unseen moment",
  "Garland exchange",
  "Blessing, rice and silk",
  "The kalash",
  "Tying the knot",
  "Mangalsutra",
  "Sindoor",
  "Haldi",
  "Sehra tying",
  "Ritual hands",
  "The wide view",
  "Seated, between rites",
  "Doorway portrait",
  "The temple",
  "Henna and ring",
  "Beneath the veil",
  "Window light",
  "Stairwell",
];

export default function WeddingsPage() {
  return <CollectionPage category="weddings" captions={CAPTIONS} />;
}
