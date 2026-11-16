import type { Metadata } from "next";
import CollectionPage from "@/components/sections/CollectionPage";

export const metadata: Metadata = {
  title: "Portrait Sessions in Bengaluru",
  description:
    "Bridal portraiture, family sittings and personal work — timeless imagery for individuals, couples and families, in studio or on location.",
};

const CAPTIONS = [
  "Mehndi, framed",
  "Rose hour",
  "Twirl",
  "Red and gold",
  "Chamundeshwari",
  "In motion",
  "Black and white",
  "A quiet smile",
  "Eyes closed",
];

export default function PortraitsPage() {
  return <CollectionPage category="portraits" captions={CAPTIONS} />;
}
