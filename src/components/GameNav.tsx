"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAMES } from "@/lib/constants";

export function GameNav() {
  const pathname = usePathname();

  const currentIndex = GAMES.findIndex((g) => g.href === pathname);
  const nextGame = GAMES[(currentIndex + 1) % GAMES.length];

  return (
    <nav className="flex w-full flex-col items-stretch justify-center gap-3 py-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Link
        href="/"
        className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-[0.97] sm:w-auto"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        &larr; Hub
      </Link>
      <Link
        href={nextGame.href}
        className="flex min-h-[48px] w-full items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-medium text-white/70 transition-all duration-200 hover:border-white/25 hover:bg-white/10 hover:text-white active:scale-[0.97] sm:w-auto"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span className="max-w-[210px] truncate sm:max-w-none">
          Next: {nextGame.title}
        </span>{" "}
        &rarr;
      </Link>
    </nav>
  );
}
