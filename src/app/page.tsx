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
    <main className="relative min-h-screen overflow-hidden">
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

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-20 sm:px-8 lg:px-12">
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
          className="mb-6 text-center text-4xl font-bold leading-none tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #ffffff 0%, #d4b8ff 50%, #e8a530 100%)",
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
          className="mb-5 max-w-2xl text-center text-base leading-relaxed sm:text-lg md:text-xl"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--gray-200)",
          }}
        >
          4 AI-powered games. 0 slides.{" "}
          <span style={{ color: "var(--orange)" }}>
            This is what real talk looks like.
          </span>
        </motion.p>

        {/* Event context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mb-14 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center text-xs tracking-[0.15em] sm:text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--gray-400)",
          }}
        >
          <span>{EVENT.name}</span>
          <span style={{ color: "var(--violet)" }}>|</span>
          <span>{EVENT.dates}</span>
          <span style={{ color: "var(--violet)" }}>|</span>
          <span>{EVENT.location}</span>
          <span style={{ color: "var(--violet)" }}>|</span>
          <span>
            <span style={{ color: "var(--orange)" }}>{EVENT.founderCount}</span>{" "}
            AI Founders
          </span>
        </motion.p>

        {/* Game cards grid */}
        <div className="mb-14 grid w-full max-w-4xl grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
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
              <Link href={game.href} className="group block">
                <div
                  className="relative overflow-hidden transition-all duration-300 ease-out group-hover:scale-[1.03] p-6 sm:p-8"
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
                    className="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2"
                    style={{
                      background: `${BORDER_COLORS[game.id]}20`,
                      border: `1px solid ${BORDER_COLORS[game.id]}40`,
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      style={{ color: BORDER_COLORS[game.id] }}
                    >
                      <path
                        d="M2 7h10m0 0L8 3m4 4L8 11"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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
          className="group relative mb-10 flex min-h-[52px] cursor-pointer items-center gap-3 overflow-hidden rounded-full border border-white/10 px-8 py-4 text-sm font-semibold tracking-wide transition-all duration-300 hover:border-white/20 hover:scale-105 active:scale-95"
          style={{
            fontFamily: "var(--font-mono)",
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(10px)",
            color: "var(--lavender)",
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
