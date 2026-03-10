import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Anti-Pitch Wall",
  description:
    "Every AI event tells you what's working. We built a wall for what's NOT. Post your biggest AI failure, doubt, or hot take anonymously. AIBoomi Playground.",
  openGraph: {
    title: "The Anti-Pitch Wall — AIBoomi Playground",
    description:
      "Anonymous confessions from AI founders. Failures, doubts, and hot takes. Real talk only.",
  },
};

export default function WallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
