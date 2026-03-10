import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unconference Table Simulator",
  description:
    "Sit at a simulated unconference roundtable with 4 AI founder personas. Debate real AI adoption topics. AIBoomi Playground.",
  openGraph: {
    title: "Unconference Table Simulator — AIBoomi Playground",
    description:
      "AI founders debating real topics. That was AI pretending. Imagine the real thing at AIBoomi Annual.",
  },
};

export default function SimulateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
