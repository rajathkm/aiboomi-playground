import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIBoomi Playground | 4 AI Games for Founders",
  description:
    "Play before you attend. 4 AI-powered games built for founders. Get roasted, debate build vs buy, and more. AIBoomi Annual '26, March 18-20, Chennai.",
  openGraph: {
    title: "AIBoomi Playground",
    description: "4 AI-powered games. 0 slides. This is what real talk looks like.",
    siteName: "AIBoomi Playground",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AIBoomi Playground",
    description: "4 AI-powered games. 0 slides. This is what real talk looks like.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
