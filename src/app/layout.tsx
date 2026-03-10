import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = "https://aiboomi-playground.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "AIBoomi Playground | 4 AI Games for Founders",
    template: "%s | AIBoomi Playground",
  },
  description:
    "Play before you attend. 4 AI-powered mini-games built for AI founders — get your pitch roasted, simulate an unconference table, post to the anti-pitch wall, and play Build vs Buy. AIBoomi Annual '26, March 18-20, Chennai.",
  keywords: [
    "AIBoomi",
    "AI founders",
    "startup games",
    "unconference",
    "Chennai",
    "SaaS",
    "AI adoption",
    "build vs buy",
    "founder community",
    "AIBoomi Annual 2026",
  ],
  authors: [{ name: "AIBoomi Community" }],
  creator: "AIBoomi",
  publisher: "AIBoomi",
  openGraph: {
    title: "AIBoomi Playground — 4 AI Games for Founders",
    description:
      "4 AI-powered games. 0 slides. This is what real talk looks like. Play the Roast Bot, simulate a founder roundtable, or take on Build vs Buy.",
    siteName: "AIBoomi Playground",
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "AIBoomi Playground — 4 AI Games for Founders",
    description:
      "4 AI-powered games. 0 slides. This is what real talk looks like.",
    creator: "@aiboomi",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AIBoomi Playground",
    description:
      "4 AI-powered interactive games for founders attending AIBoomi Annual 2026",
    url: BASE_URL,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    event: {
      "@type": "Event",
      name: "AIBoomi Annual 2026",
      startDate: "2026-03-18",
      endDate: "2026-03-20",
      location: {
        "@type": "Place",
        name: "Chennai",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Chennai",
          addressCountry: "IN",
        },
      },
      url: "https://annual.aiboomi.org/",
    },
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
