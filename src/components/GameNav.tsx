"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAMES } from "@/lib/constants";

export function GameNav() {
  const pathname = usePathname();

  const currentIndex = GAMES.findIndex((g) => g.href === pathname);
  const nextGame = GAMES[(currentIndex + 1) % GAMES.length];

  return (
    <nav className="flex flex-wrap items-center justify-center gap-3 py-2">
      <Link
        href="/"
        className="px-5 py-3 min-h-[48px] flex items-center text-sm font-medium rounded-xl border border-white/15 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/25 active:scale-[0.97]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        &larr; Hub
      </Link>
      <Link
        href={nextGame.href}
        className="px-5 py-3 min-h-[48px] flex items-center text-sm font-medium rounded-xl border border-white/15 text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white hover:border-white/25 active:scale-[0.97]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span className="truncate max-w-[200px] sm:max-w-none">Next: {nextGame.title}</span> &rarr;
      </Link>
    </nav>
  );
}
