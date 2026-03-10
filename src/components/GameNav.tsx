"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAMES } from "@/lib/constants";

export function GameNav() {
  const pathname = usePathname();

  const currentIndex = GAMES.findIndex((g) => g.href === pathname);
  const nextGame = GAMES[(currentIndex + 1) % GAMES.length];

  return (
    <div className="flex items-center gap-4 mt-8">
      <Link
        href="/"
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "var(--font-mono)",
        }}
      >
        ← Hub
      </Link>
      <Link
        href={nextGame.href}
        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10"
        style={{
          border: "1px solid rgba(255,255,255,0.15)",
          color: "rgba(255,255,255,0.7)",
          fontFamily: "var(--font-mono)",
        }}
      >
        Next: {nextGame.title} →
      </Link>
    </div>
  );
}
