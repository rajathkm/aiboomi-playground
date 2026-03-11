"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ShareCard } from "@/components/ShareCard";
import { GameNav } from "@/components/GameNav";
import { FloatingCTA } from "@/components/FloatingCTA";
import { ARCHETYPES } from "@/lib/constants";

// ─── Types ───────────────────────────────────────────────────────────

interface Scenario {
  id: string;
  title: string;
  context: string;
  description: string;
}

interface RoundResult {
  scenario_id: string;
  expert_answer: string;
  build_outcome: string;
  buy_outcome: string;
  community_build_pct: number;
  points_earned: number;
}

interface PlayerChoice {
  scenario_id: string;
  choice: "build" | "buy" | "timeout";
  time_ms: number;
}

interface GameResults {
  score: number;
  archetype: keyof typeof ARCHETYPES;
  results: RoundResult[];
}

type Phase = "intro" | "playing" | "round-result" | "final";

const ROUND_TIME_MS = 30000;
const TOTAL_ROUNDS = 7;

// ─── Components ──────────────────────────────────────────────────────

function Timer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = timeLeft / total;
  const isUrgent = timeLeft < 10000;
  const isCritical = timeLeft < 5000;
  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative w-24 h-24 sm:w-28 sm:h-28"
        animate={isCritical ? { scale: [1, 1.05, 1] } : {}}
        transition={isCritical ? { repeat: Infinity, duration: 0.5 } : {}}
      >
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke={
              isCritical
                ? "#ef4444"
                : isUrgent
                ? "#f97316"
                : "url(#timerGradient)"
            }
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct)}`}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
          <defs>
            <linearGradient
              id="timerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-3xl sm:text-4xl font-bold tabular-nums"
            style={{
              color: isCritical
                ? "#ef4444"
                : isUrgent
                ? "#f97316"
                : "#e2e8f0",
              fontFamily: "var(--font-mono)",
            }}
          >
            {seconds}
          </span>
        </div>
      </motion.div>
      {/* Timer bar underneath */}
      <div
        className="w-full max-w-xs h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: isCritical
              ? "#ef4444"
              : isUrgent
              ? "#f97316"
              : "linear-gradient(90deg, #8b5cf6, #a78bfa)",
            transition: "width 0.3s linear",
          }}
        />
      </div>
    </div>
  );
}

function CommunityBar({
  buildPct,
  animate,
}: {
  buildPct: number;
  animate: boolean;
}) {
  const buyPct = 100 - buildPct;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "rgba(139,92,246,0.9)" }}>Build {buildPct}%</span>
        <span style={{ color: "rgba(34,197,94,0.9)" }}>Buy {buyPct}%</span>
      </div>
      <div
        className="w-full h-3 rounded-full overflow-hidden flex"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          className="h-full rounded-l-full"
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${buildPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{
            background: "linear-gradient(90deg, #7c3aed, #8b5cf6)",
          }}
        />
        <motion.div
          className="h-full rounded-r-full"
          initial={animate ? { width: 0 } : false}
          animate={{ width: `${buyPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          style={{
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
          }}
        />
      </div>
    </div>
  );
}

function CountUpScore({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);

  return <span>{current}</span>;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 w-full max-w-sm">
      <span
        className="text-xs whitespace-nowrap"
        style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)" }}
      >
        Round {current} / {total}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────

export default function BuildVsBuyPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_MS);
  const [choices, setChoices] = useState<PlayerChoice[]>([]);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [currentRoundResult, setCurrentRoundResult] = useState<RoundResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roundStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch scenarios ────────────────────────────────────────────

  const fetchScenarios = useCallback(async (): Promise<Scenario[] | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/buildvsbuy/scenarios");
      if (!res.ok) throw new Error("Failed to load scenarios");
      const data = await res.json();
      setScenarios(data.scenarios);
      return data.scenarios;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Timer logic ────────────────────────────────────────────────

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    roundStartRef.current = Date.now();
    setTimeLeft(ROUND_TIME_MS);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - roundStartRef.current;
      const remaining = Math.max(0, ROUND_TIME_MS - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        stopTimer();
      }
    }, 50);
  }, [stopTimer]);

  // Auto-timeout when timer hits 0
  useEffect(() => {
    if (phase === "playing" && timeLeft <= 0) {
      handleChoice("timeout");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  // ─── Game flow ──────────────────────────────────────────────────

  const startGame = async () => {
    const loaded = await fetchScenarios();
    if (!loaded || loaded.length === 0) return;
    setChoices([]);
    setGameResults(null);
    setCurrentRound(0);
    setCurrentRoundResult(null);
    setPhase("playing");
    startTimer();
  };

  const handleChoice = useCallback(
    (choice: "build" | "buy" | "timeout") => {
      if (phase !== "playing") return;
      stopTimer();

      const elapsed = Date.now() - roundStartRef.current;
      const scenario = scenarios[currentRound];
      if (!scenario) return;

      const playerChoice: PlayerChoice = {
        scenario_id: scenario.id,
        choice,
        time_ms: choice === "timeout" ? ROUND_TIME_MS : elapsed,
      };

      setChoices((prev) => [...prev, playerChoice]);

      // Submit to API to get round result
      const allChoices = [...choices, playerChoice];

      fetch("/api/buildvsbuy/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choices: [playerChoice] }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.results && data.results[0]) {
            setCurrentRoundResult(data.results[0]);
          }
          setPhase("round-result");

          // If this is the last round, also fetch full results
          if (currentRound === TOTAL_ROUNDS - 1) {
            fetch("/api/buildvsbuy/stats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ choices: allChoices }),
            })
              .then((res) => res.json())
              .then((fullData) => setGameResults(fullData))
              .catch(() => {});
          }
        })
        .catch(() => {
          // Fallback — still show round result phase
          setPhase("round-result");
        });
    },
    [phase, scenarios, currentRound, choices, stopTimer]
  );

  const nextRound = () => {
    if (currentRound >= TOTAL_ROUNDS - 1) {
      setPhase("final");
      return;
    }
    setCurrentRound((prev) => prev + 1);
    setCurrentRoundResult(null);
    setPhase("playing");
    startTimer();
  };

  const playAgain = () => {
    setPhase("intro");
    setScenarios([]);
    setChoices([]);
    setGameResults(null);
    setCurrentRound(0);
    setCurrentRoundResult(null);
  };

  // ─── Derived state ─────────────────────────────────────────────

  const currentScenario = scenarios[currentRound];
  const lastChoice = choices[choices.length - 1];
  const archetype = gameResults
    ? ARCHETYPES[gameResults.archetype]
    : null;

  // ─── Render ─────────────────────────────────────────────────────

  return (
    <main
      className="flex min-h-screen flex-col items-center overflow-x-hidden"
      style={{
        background:
          "linear-gradient(180deg, #050510 0%, #0d0525 40%, #1a0a3e 100%)",
      }}
    >
      <div className="safe-floating-space flex w-full max-w-lg mx-auto flex-col px-5 pt-10 pb-8 sm:max-w-3xl sm:px-6 sm:pt-14 sm:pb-12 lg:px-8">
        <div className="mb-4 flex w-full items-center justify-start">
          <Link href="/" className="btn-text">
            &larr; Back to Hub
          </Link>
        </div>
        <AnimatePresence mode="wait">
          {/* ─── INTRO SCREEN ─────────────────────────────────── */}
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center text-center"
            >
              <motion.h1
                className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <span className="mr-3 text-3xl sm:text-4xl lg:text-5xl">&#9889;</span>
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #8b5cf6, #a78bfa, #c4b5fd)",
                  }}
                >
                  Build vs Buy
                </span>
              </motion.h1>

              <motion.p
                className="mb-8 max-w-md text-balance text-lg sm:text-xl"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--font-body)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                30 seconds. 7 rounds. Real AI infrastructure decisions.
              </motion.p>

              <motion.div
                className="w-full max-w-lg mb-10"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(139,92,246,0.35)",
                  borderRadius: 20,
                  padding: "clamp(28px, 5vw, 40px) clamp(24px, 5vw, 44px)",
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-4"
                  style={{
                    color: "rgba(139,92,246,0.8)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  How It Works
                </h3>
                <ul
                  className="list-disc space-y-3 pl-4 text-left text-sm leading-relaxed marker:text-white/35 [&>li]:pl-1"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <li>You get a real AI infrastructure scenario each round</li>
                  <li>
                    Choose <strong className="text-purple-400">Build</strong> or{" "}
                    <strong className="text-green-400">Buy</strong> before time runs out
                  </li>
                  <li>
                    Score points for speed and alignment with expert consensus
                  </li>
                  <li>Discover your founder archetype at the end</li>
                </ul>
              </motion.div>

              {error && (
                <p
                  className="text-sm text-red-400 mb-4"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {error}
                </p>
              )}

              <motion.button
                onClick={startGame}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary w-full min-h-[56px] rounded-2xl px-10 py-5 text-lg sm:w-auto sm:px-14"
                style={{
                  background: isLoading
                    ? "rgba(255,255,255,0.08)"
                    : "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                  color: isLoading ? "rgba(255,255,255,0.3)" : "#fff",
                  boxShadow: isLoading
                    ? "none"
                    : "0 0 40px rgba(139,92,246,0.35)",
                  fontFamily: "var(--font-body)",
                }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  boxShadow: [
                    "0 0 20px rgba(139,92,246,0.2)",
                    "0 0 40px rgba(139,92,246,0.4)",
                    "0 0 20px rgba(139,92,246,0.2)",
                  ],
                }}
                transition={{
                  opacity: { delay: 0.5 },
                  boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                }}
              >
                {isLoading ? "Loading..." : "Start Game"}
              </motion.button>
            </motion.div>
          )}

          {/* ─── PLAYING PHASE ────────────────────────────────── */}
          {phase === "playing" && currentScenario && (
            <motion.div
              key={`round-${currentRound}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center w-full gap-6"
            >
              {/* Progress */}
              <ProgressBar current={currentRound + 1} total={TOTAL_ROUNDS} />

              {/* Timer */}
              <Timer timeLeft={timeLeft} total={ROUND_TIME_MS} />

              {/* Scenario Card */}
              <motion.div
                className="w-full rounded-2xl p-6 sm:p-8"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  boxShadow: "0 0 30px rgba(139,92,246,0.08)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2
                  className="text-xl sm:text-2xl font-bold text-white mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {currentScenario.title}
                </h2>
                <p
                  className="text-xs sm:text-sm font-medium mb-4 px-3 py-1 rounded-full inline-block"
                  style={{
                    background: "rgba(139,92,246,0.15)",
                    color: "rgba(167,139,250,0.9)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {currentScenario.context}
                </p>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {currentScenario.description}
                </p>
              </motion.div>

              {/* Build / Buy Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                <motion.button
                  onClick={() => handleChoice("build")}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 40px rgba(139,92,246,0.4)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary min-h-[56px] w-full py-4 text-lg sm:min-h-[64px] sm:flex-1 sm:py-5 sm:text-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)",
                    color: "#fff",
                    boxShadow: "0 0 25px rgba(139,92,246,0.2)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  BUILD &#128296;
                </motion.button>
                <motion.button
                  onClick={() => handleChoice("buy")}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 0 40px rgba(34,197,94,0.4)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-primary min-h-[56px] w-full py-4 text-lg sm:min-h-[64px] sm:flex-1 sm:py-5 sm:text-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #15803d, #16a34a, #22c55e)",
                    color: "#fff",
                    boxShadow: "0 0 25px rgba(34,197,94,0.2)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  BUY &#128722;
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ─── ROUND RESULT PHASE ───────────────────────────── */}
          {phase === "round-result" && currentScenario && (
            <motion.div
              key={`result-${currentRound}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center w-full gap-5"
            >
              {/* Progress */}
              <ProgressBar current={currentRound + 1} total={TOTAL_ROUNDS} />

              {/* Scenario title reminder */}
              <h2
                className="text-lg sm:text-xl font-bold text-white/80 text-center"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {currentScenario.title}
              </h2>

              {/* Your choice */}
              <motion.div
                className="w-full rounded-2xl p-6 sm:p-8"
                style={{
                  background:
                    lastChoice?.choice === "timeout"
                      ? "rgba(239,68,68,0.1)"
                      : lastChoice?.choice === "build"
                      ? "rgba(139,92,246,0.1)"
                      : "rgba(34,197,94,0.1)",
                  border: `1px solid ${
                    lastChoice?.choice === "timeout"
                      ? "rgba(239,68,68,0.3)"
                      : lastChoice?.choice === "build"
                      ? "rgba(139,92,246,0.3)"
                      : "rgba(34,197,94,0.3)"
                  }`,
                }}
              >
                <p
                  className="text-sm mb-1"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  You chose:
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    color:
                      lastChoice?.choice === "timeout"
                        ? "#ef4444"
                        : lastChoice?.choice === "build"
                        ? "#a78bfa"
                        : "#22c55e",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {lastChoice?.choice === "timeout"
                    ? "Time's Up! No Decision"
                    : lastChoice?.choice === "build"
                    ? "BUILD \uD83D\uDD28"
                    : "BUY \uD83D\uDED2"}
                </p>
                {lastChoice?.choice !== "timeout" && (
                  <p
                    className="text-xs mt-1"
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    in {((lastChoice?.time_ms ?? 0) / 1000).toFixed(1)}s
                  </p>
                )}
              </motion.div>

              {/* Results details */}
              {currentRoundResult && (
                <motion.div
                  className="w-full space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Community split */}
                  <div
                    className="rounded-2xl p-5 sm:p-6"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      className="text-xs uppercase tracking-wider mb-3"
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      Community Split
                    </p>
                    <CommunityBar
                      buildPct={currentRoundResult.community_build_pct}
                      animate={true}
                    />
                  </div>

                  {/* Outcomes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div
                      className="rounded-2xl p-5 sm:p-6"
                      style={{
                        background:
                          currentRoundResult.expert_answer === "build"
                            ? "rgba(139,92,246,0.12)"
                            : "rgba(255,255,255,0.03)",
                        border: `1px solid ${
                          currentRoundResult.expert_answer === "build"
                            ? "rgba(139,92,246,0.3)"
                            : "rgba(255,255,255,0.08)"
                        }`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold" style={{ color: "#a78bfa" }}>
                          Build Outcome
                        </span>
                        {currentRoundResult.expert_answer === "build" && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                            &#10003; Expert Pick
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {currentRoundResult.build_outcome}
                      </p>
                    </div>

                    <div
                      className="rounded-2xl p-5 sm:p-6"
                      style={{
                        background:
                          currentRoundResult.expert_answer === "buy"
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(255,255,255,0.03)",
                        border: `1px solid ${
                          currentRoundResult.expert_answer === "buy"
                            ? "rgba(34,197,94,0.3)"
                            : "rgba(255,255,255,0.08)"
                        }`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                          Buy Outcome
                        </span>
                        {currentRoundResult.expert_answer === "buy" && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">
                            &#10003; Expert Pick
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs sm:text-sm leading-relaxed"
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        {currentRoundResult.buy_outcome}
                      </p>
                    </div>
                  </div>

                  {/* Points earned */}
                  <div className="text-center">
                    <motion.p
                      className="text-2xl font-bold"
                      style={{
                        color:
                          currentRoundResult.points_earned > 0
                            ? "rgba(255,255,255,0.92)"
                            : "rgba(255,255,255,0.3)",
                        fontFamily: "var(--font-mono)",
                      }}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        delay: 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      +{currentRoundResult.points_earned} pts
                    </motion.p>
                  </div>
                </motion.div>
              )}

              {/* Next button */}
              <motion.button
                onClick={nextRound}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary mt-2 w-full min-h-[56px] px-10 py-4 text-base"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                  color: "#fff",
                  boxShadow: "0 0 25px rgba(139,92,246,0.2)",
                  fontFamily: "var(--font-body)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {currentRound >= TOTAL_ROUNDS - 1
                  ? "See Results \u2794"
                  : "Next Round \u2794"}
              </motion.button>
            </motion.div>
          )}

          {/* ─── FINAL SCORE SCREEN ───────────────────────────── */}
          {phase === "final" && gameResults && archetype && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center w-full gap-6"
            >
              {/* Score */}
              <motion.div
                className="text-center"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
              >
                <p
                  className="text-sm uppercase tracking-widest mb-2"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Your Score
                </p>
                <p
                  className="text-6xl sm:text-7xl font-extrabold"
                  style={{
                    color: "rgba(255,255,255,0.92)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  <CountUpScore target={gameResults.score} />
                </p>
                <p
                  className="text-sm mt-1"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  out of {TOTAL_ROUNDS * 150} possible
                </p>
              </motion.div>

              {/* Archetype */}
              <motion.div
                className="w-full text-center rounded-2xl p-8 sm:p-10 md:p-12"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(139,92,246,0.25)",
                  boxShadow: "0 0 40px rgba(139,92,246,0.1)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-5xl mb-3">{archetype.emoji}</p>
                <h2
                  className="text-2xl font-bold text-white mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {archetype.name}
                </h2>
                <p
                  className="text-sm"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {archetype.description}
                </p>
              </motion.div>

              {/* Round-by-round breakdown */}
              <motion.div
                className="w-full space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3
                  className="text-xs uppercase tracking-wider mb-3"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  Round Breakdown
                </h3>
                {gameResults.results.map((result, idx) => {
                  const choice = choices[idx];
                  const scenario = scenarios[idx];
                  const isCorrect =
                    choice?.choice === result.expert_answer;
                  return (
                    <motion.div
                      key={result.scenario_id}
                      className="flex items-center gap-3 rounded-xl p-3.5 sm:p-4"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + idx * 0.08 }}
                    >
                      <span
                        className="text-xs font-mono w-5 text-center shrink-0"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                      >
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium text-white/80 truncate"
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {scenario?.title ?? "Unknown"}
                        </p>
                      </div>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded shrink-0"
                        style={{
                          background:
                            choice?.choice === "timeout"
                              ? "rgba(239,68,68,0.15)"
                              : choice?.choice === "build"
                              ? "rgba(139,92,246,0.15)"
                              : "rgba(34,197,94,0.15)",
                          color:
                            choice?.choice === "timeout"
                              ? "#ef4444"
                              : choice?.choice === "build"
                              ? "#a78bfa"
                              : "#22c55e",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {choice?.choice === "timeout"
                          ? "TIMEOUT"
                          : choice?.choice?.toUpperCase()}
                      </span>
                      <span
                        className="text-xs shrink-0"
                        style={{
                          color: isCorrect ? "#22c55e" : "rgba(255,255,255,0.3)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {choice?.choice === "timeout"
                          ? ""
                          : isCorrect
                          ? "\u2713"
                          : "\u2717"}
                      </span>
                      <span
                        className="text-xs font-bold w-12 text-right shrink-0"
                        style={{
                          color:
                            result.points_earned > 0
                              ? "rgba(255,255,255,0.92)"
                              : "rgba(255,255,255,0.2)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        +{result.points_earned}
                      </span>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Share Card */}
              <motion.div
                className="mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <ShareCard gameName="buildvsbuy">
                  <p className="text-4xl mb-2">{archetype.emoji}</p>
                  <p className="text-xl font-bold text-white">
                    {archetype.name}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    {archetype.description}
                  </p>
                  <p className="mt-4 text-2xl font-bold text-white/90">
                    {gameResults.score} pts
                  </p>
                </ShareCard>
              </motion.div>

              {/* CTA */}
              <motion.div
                className="text-center mt-4 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <p
                  className="text-sm mb-3"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Debate Build vs Buy with 200 founders IRL. No timer. Just
                  real talk.
                </p>
                <a
                  href="https://annual.aiboomi.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm sm:px-6"
                  style={{
                    background: "linear-gradient(135deg, #e8a530, #f0b84a)",
                    color: "#0a0a2e",
                    fontFamily: "var(--font-body)",
                    boxShadow: "0 0 26px rgba(232,165,48,0.28)",
                  }}
                >
                  AIBoomi Annual, March 18-20, Chennai
                </a>
              </motion.div>

              {/* Play Again */}
              <motion.button
                onClick={playAgain}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="btn-secondary w-full max-w-sm min-h-[56px] rounded-2xl px-10 py-3.5 font-semibold"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  fontFamily: "var(--font-body)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                Play Again
              </motion.button>

              {/* Nav */}
              <GameNav />
            </motion.div>
          )}

          {/* Loading fallback for final screen if results haven't arrived */}
          {phase === "final" && !gameResults && (
            <motion.div
              key="loading-final"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
              />
              <p
                className="text-sm"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Calculating your archetype...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FloatingCTA />
    </main>
  );
}
