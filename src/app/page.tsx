"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FloatingCTA } from "@/components/FloatingCTA";
import { EVENT, GAMES } from "@/lib/constants";

const CARD_THEME: Record<
  string,
  { border: string; glow: string; bg: string; iconBg: string }
> = {
  roast: {
    border: "#ff954d",
    glow: "rgba(255, 123, 66, 0.3)",
    bg: "linear-gradient(155deg, rgba(255,123,66,0.16), rgba(255,123,66,0.03) 62%)",
    iconBg: "rgba(255, 123, 66, 0.18)",
  },
  simulate: {
    border: "#9a77ff",
    glow: "rgba(154, 119, 255, 0.3)",
    bg: "linear-gradient(155deg, rgba(154,119,255,0.18), rgba(154,119,255,0.03) 62%)",
    iconBg: "rgba(154, 119, 255, 0.2)",
  },
  wall: {
    border: "#2dd08f",
    glow: "rgba(45, 208, 143, 0.28)",
    bg: "linear-gradient(155deg, rgba(45,208,143,0.16), rgba(45,208,143,0.03) 62%)",
    iconBg: "rgba(45, 208, 143, 0.2)",
  },
  buildvsbuy: {
    border: "#f2b544",
    glow: "rgba(242, 181, 68, 0.3)",
    bg: "linear-gradient(155deg, rgba(242,181,68,0.17), rgba(242,181,68,0.03) 62%)",
    iconBg: "rgba(242, 181, 68, 0.22)",
  },
};

export default function HomePage() {
  const router = useRouter();

  function handleRandomize() {
    const random = GAMES[Math.floor(Math.random() * GAMES.length)];
    router.push(random.href);
  }

  return (
    <main className="page-shell">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -left-[16rem] -top-[16rem] h-[38rem] w-[38rem] rounded-full blur-3xl"
          style={{ background: "rgba(154, 119, 255, 0.26)", animation: "orbFloat 24s ease-in-out infinite" }}
        />
        <div
          className="absolute -right-[10rem] top-[8%] h-[27rem] w-[27rem] rounded-full blur-3xl"
          style={{ background: "rgba(242, 181, 68, 0.18)", animation: "orbFloat 30s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute bottom-[3%] left-[38%] h-[22rem] w-[22rem] rounded-full blur-3xl"
          style={{ background: "rgba(45, 208, 143, 0.12)", animation: "orbFloat 20s ease-in-out infinite" }}
        />
      </div>

      <div className="safe-floating-space page-container page-stack page-container-narrow">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58 }}
          className="page-header"
        >
          <p className="page-kicker">Play Before You Attend</p>
          <h1
            className="page-title"
            style={{
              background:
                "linear-gradient(125deg, #ffffff 0%, #f7f0dc 34%, #dfc8ff 72%, #9a77ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AIBoomi Playground
          </h1>
          <p className="page-subtitle">
            4 AI-powered games. 0 slides. What your LinkedIn audience actually wants:
            a fast, replayable founder challenge with opinions and stakes.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="token-chip">{EVENT.name}</span>
            <span className="token-chip">{EVENT.dates}</span>
            <span className="token-chip">{EVENT.location}</span>
            <span className="token-chip">{EVENT.founderCount} Founders</span>
          </div>
        </motion.header>

        <div className="game-grid">
          {GAMES.map((game, index) => {
            const theme = CARD_THEME[game.id];
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 32, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.48, delay: 0.2 + index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={game.href} className="group block">
                  <article
                    className="game-card"
                    style={{
                      borderLeftColor: theme.border,
                      borderLeftWidth: "3px",
                      boxShadow: `0 16px 38px rgba(4,2,12,0.5), 0 0 0 1px rgba(255,255,255,0.08), 0 0 26px ${theme.glow}`,
                      ["--card-bg" as string]: theme.bg,
                      ["--card-border" as string]: theme.border,
                      ["--card-icon-bg" as string]: theme.iconBg,
                      ["--card-glow" as string]: theme.glow,
                    }}
                  >
                    <div className="relative z-10 flex items-start gap-3.5">
                      <div className="game-card-icon">{game.icon}</div>
                      <div className="min-w-0 flex-1">
                        <h2 className="game-card-title">{game.title}</h2>
                        <p className="game-card-desc">{game.description}</p>
                        <p className="game-card-play">
                          Play now <span aria-hidden="true">&rarr;</span>
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.86 }}
          className="panel-soft mt-3 flex w-full flex-col items-center gap-5 px-8 py-7 text-center sm:flex-row sm:justify-between sm:px-12 sm:py-7 sm:text-left"
        >
          <p className="w-full pl-0.5 text-sm leading-relaxed text-[var(--text-secondary)] sm:pl-1 sm:text-[0.95rem]">
            Want to keep it unpredictable for social shares?
          </p>
          <button
            onClick={handleRandomize}
            className="btn-secondary min-h-[48px] rounded-full px-6 py-3 text-sm"
            aria-label="Open a random game"
          >
            <span className="text-base" aria-hidden="true">
              🎲
            </span>
            Surprise Me
          </button>
        </motion.div>

        <p className="pb-8 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)] sm:text-xs">
          No login required · Built for LinkedIn virality · Powered by founder opinions
        </p>
      </div>

      <FloatingCTA />
    </main>
  );
}
