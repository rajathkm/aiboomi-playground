"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAMES } from "@/lib/constants";

export function GameNav() {
  const pathname = usePathname();

  const currentIndex = GAMES.findIndex((g) => g.href === pathname);
  const nextGame = GAMES[(currentIndex + 1) % GAMES.length];

  return (
    <nav className="nav-row py-3 sm:py-2.5">
      <Link
        href="/"
        className="btn-secondary w-full px-5 py-3 text-center text-sm sm:w-auto"
      >
        &larr; Hub
      </Link>
      <Link
        href={nextGame.href}
        className="btn-secondary w-full px-5 py-3 text-center text-sm sm:w-auto"
      >
        <span className="max-w-[210px] truncate sm:max-w-none">
          Next: {nextGame.title}
        </span>{" "}
        &rarr;
      </Link>
    </nav>
  );
}
