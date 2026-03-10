import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build vs Buy Speed Game",
  description:
    "30 seconds. 7 rounds. Real AI infrastructure decisions. Choose Build or Buy under pressure and discover your founder archetype. AIBoomi Playground.",
  openGraph: {
    title: "Build vs Buy Speed Game — AIBoomi Playground",
    description:
      "Real AI infrastructure decisions under time pressure. What's your founder archetype?",
  },
};

export default function BuildVsBuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
