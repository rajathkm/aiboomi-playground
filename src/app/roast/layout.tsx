import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Founder Roast Bot",
  description:
    "Type your startup pitch and get brutally honest AI feedback. The kind of real talk that only happens at an unconference table. AIBoomi Playground.",
  openGraph: {
    title: "AI Founder Roast Bot — AIBoomi Playground",
    description:
      "Get your startup pitch roasted by AI. Brutally honest. Hilariously specific. Share your roast.",
  },
};

export default function RoastLayout({ children }: { children: React.ReactNode }) {
  return children;
}
