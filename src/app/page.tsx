"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GAMES, EVENT } from "@/lib/constants";
import { FloatingCTA } from "@/components/FloatingCTA";

const GLOW_COLORS: Record<string, string> = {
  roast: "rgba(232, 165, 48, 0.4)",
  simulate: "rgba(107, 79, 160, 0.4)",
  wall: "rgba(0, 204, 102, 0.4)",
  buildvsbuy: "rgba(212, 184, 255, 0.4)",
};

const BORDER_COLORS: Record<string, string> = {
  roast: "#e8a530",
  simulate: "#6b4fa0",
  wall: "#00cc66",
  buildvsbuy: "#d4b8ff",
};

const BG_GRADIENTS: Record<string, string> = {
  roast: "linear-gradient(135deg, rgba(232, 165, 48, 0.08), rgba(239, 68, 68, 0.06))",
  simulate: "linear-gradient(135deg, rgba(107, 79, 160, 0.08), rgba(79, 70, 229, 0.06))",
  wall: "linear-gradient(135deg, rgba(0, 204, 102, 0.08), rgba(20, 184, 166, 0.06))",
  buildvsbuy: "linear-gradient(135deg, rgba(212, 184, 255, 0.08), rgba(139, 92, 246, 0.06))",
};

export default function HomePage() {
  const router = useRouter();

  function handleRandomize() {
    const random = GAMES[Math.floor(Math.random() * GAMES.length)];
    router.push(random.href);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Animated gradient mesh background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(45, 27, 105, 0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 10%, rgba(107, 79, 160, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 70% 80%, rgba(232, 165, 48, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 40% 40% at 10% 90%, rgba(0, 204, 102, 0.08) 0%, transparent 50%),
            var(--navy-deep)
          `,
        }}
      />

      {/* Floating orbs — pure CSS animated ambience */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 600,
            height: 600,
            top: "-10%",
            left: "-5%",
            background: "rgba(45, 27, 105, 0.25)",
            animation: "orbFloat 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 400,
            height: 400,
            bottom: "5%",
            right: "-5%",
            background: "rgba(232, 165, 48, 0.12)",
            animation: "orbFloat 25s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 300,
            height: 300,
            top: "50%",
            left: "60%",
            background: "rgba(0, 204, 102, 0.08)",
            animation: "orbFloat 18s ease-in-out infinite 5s",
          }}
        />
      </div>

      {/* Scanline overlay for terminal feel */}
      <div
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)",
        }}
      />

      <div className="safe-floating-space relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* Code comment — terminal aesthetic */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 text-xs tracking-widest sm:text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--gray-500)",
          }}
        >
          {"// play before you attend"}
        </motion.p>

        {/* Main title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mb-6 text-center text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #ffffff 0%, #ebe3ff 60%, #d4b8ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AIBoomi Playground
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mb-5 max-w-xs text-balance text-center text-base leading-relaxed sm:max-w-2xl sm:text-lg md:text-xl"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--gray-200)",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.9)" }}>
            4 AI-powered games. 0 slides. This is what real talk looks like.
          </span>
        </motion.p>

        {/* Event context */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mb-14 flex flex-wrap items-center justify-center gap-2.5 text-center"
          style={{
            fontFamily: "var(--font-body)",
          }}
        >
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/80 sm:text-sm">
            {EVENT.name}
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/80 sm:text-sm">
            Mar 18-20
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/80 sm:text-sm">
            {EVENT.location}
          </span>
          <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-white/90 sm:text-sm">
            {EVENT.founderCount} Founders
          </span>
        </motion.div>

        {/* Game cards grid */}
        <div className="mb-14 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.8 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={game.href}
                className="group block cursor-pointer transition-transform duration-200 active:scale-[0.98]"
              >
                <div
                  className="relative overflow-hidden p-7 transition-all duration-300 ease-out group-hover:scale-[1.03] group-active:scale-[0.99] sm:p-9"
                  style={{
                    borderRadius: 20,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: BG_GRADIENTS[game.id],
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderLeft: `3px solid ${BORDER_COLORS[game.id]}`,
                    boxShadow: `0 4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)`,
                  }}
                >
                  {/* Hover glow effect */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      borderRadius: 20,
                      boxShadow: `0 0 40px ${GLOW_COLORS[game.id]}, inset 0 0 40px ${GLOW_COLORS[game.id]}`,
                    }}
                  />

                  {/* Top shimmer on hover */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${BORDER_COLORS[game.id]}44, transparent)`,
                    }}
                  />

                  <div className="relative z-10 flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center rounded-2xl text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `${BORDER_COLORS[game.id]}15`,
                        border: `1px solid ${BORDER_COLORS[game.id]}30`,
                      }}
                    >
                      {game.icon}
                    </div>
                    <div className="flex-1">
                      <h2
                        className="mb-2 text-lg font-bold tracking-tight sm:text-xl"
                        style={{
                          fontFamily: "var(--font-display)",
                          color: "var(--white)",
                        }}
                      >
                        {game.title}
                      </h2>
                      <p
                        className="text-sm leading-relaxed sm:text-base"
                        style={{
                          fontFamily: "var(--font-body)",
                          color: "var(--gray-400)",
                        }}
                      >
                        {game.description}
                      </p>
                    </div>
                  </div>

                  {/* Play arrow indicator */}
                  <div
                    className="absolute bottom-5 right-5 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white/85 transition-all duration-300 group-hover:translate-x-0.5"
                    style={{
                      background: `${BORDER_COLORS[game.id]}1f`,
                      borderColor: `${BORDER_COLORS[game.id]}55`,
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <span>Play</span>
                    <span aria-hidden="true">&rarr;</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Randomize button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.35 }}
          onClick={handleRandomize}
          className="btn-secondary group relative mb-10 w-full min-h-[52px] overflow-hidden rounded-2xl px-8 py-4 tracking-wide transition-all duration-300 sm:w-auto"
          style={{
            fontFamily: "var(--font-body)",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(10px)",
            color: "rgba(255,255,255,0.92)",
          }}
        >
          {/* Animated shimmer on hover */}
          <div
            className="pointer-events-none absolute inset-0 -translate-x-full transition-transform duration-700 group-hover:translate-x-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(212, 184, 255, 0.08), transparent)",
            }}
          />
          <span
            className="inline-block text-lg transition-transform duration-300 group-hover:rotate-180"
            role="img"
            aria-label="dice"
          >
            🎲
          </span>
          <span className="relative z-10">Surprise Me</span>
        </motion.button>

        {/* Bottom tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.55 }}
          className="pb-12 text-center text-xs"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--gray-500)",
          }}
        >
          no login required &middot; built with claude &middot; powered by
          opinions
        </motion.p>
      </div>

      <FloatingCTA />
    </main>
  );
}
