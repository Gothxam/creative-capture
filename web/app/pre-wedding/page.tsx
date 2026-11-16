import type { Metadata } from "next";
import CollectionPage from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "Pre-Wedding Photography in Bengaluru",
  description:
    "Creative pre-wedding shoots across Karnataka and Kerala — backwaters, banyan trees, monsoon rain and long grass at the end of the day.",
};

const CAPTIONS = [
  "Long grass",
  "At rest",
  "Monsoon",
  "Under one umbrella",
  "Garden",
  "Beneath the banyan",
  "Riverbed",
  "The bullock cart",
  "Teal stairs",
  "Backwaters",
  "The creek",
  "On the rocks",
  "Forehead to forehead",
  "Red silk",
  "Close",
];

export default function PreWeddingPage() {
  return <CollectionPage category="pre-wedding" captions={CAPTIONS} />;
}
