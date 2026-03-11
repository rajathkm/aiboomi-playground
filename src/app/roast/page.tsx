"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShareCard } from "@/components/ShareCard";
import { GameNav } from "@/components/GameNav";
import { FloatingCTA } from "@/components/FloatingCTA";

const LOADING_MESSAGES = [
  "Warming up the roast...",
  "Analyzing your pitch with zero mercy...",
  "Channeling 200 brutally honest founders...",
];

const MAX_CHARS = 280;

interface RoastResult {
  roast: string;
  severity: number;
  tagline: string;
}

function TypewriterText({ text }: { text: string }) {
  const [displayedWords, setDisplayedWords] = useState(0);
  const words = text.split(" ");

  useEffect(() => {
    setDisplayedWords(0);
    const interval = setInterval(() => {
      setDisplayedWords((prev) => {
        if (prev >= words.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [text, words.length]);

  return (
    <span>
      {words.slice(0, displayedWords).join(" ")}
      {displayedWords < words.length && (
        <span className="inline-block w-0.5 h-5 bg-orange-400 ml-0.5 animate-pulse align-middle" />
      )}
    </span>
  );
}

function SeverityFlames({ severity }: { severity: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0, y: 10 }}
          animate={
            i < severity
              ? { opacity: 1, scale: 1, y: 0 }
              : { opacity: 0.2, scale: 0.8, y: 0 }
          }
          transition={{ delay: i * 0.15, duration: 0.4, type: "spring" }}
          className="text-2xl sm:text-3xl"
        >
          {"\uD83D\uDD25"}
        </motion.span>
      ))}
    </div>
  );
}

export default function RoastPage() {
  const [pitch, setPitch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cycle loading messages
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const submitRoast = useCallback(
    async (pitchText: string) => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setLoadingMsgIndex(0);

      try {
        const res = await fetch("/api/roast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pitch: pitchText }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Request failed (${res.status})`);
        }

        const data: RoastResult = await res.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitch.trim() || pitch.length > MAX_CHARS) return;
    submitRoast(pitch.trim());
  };

  const handleRoastAgain = () => {
    submitRoast(pitch.trim());
  };

  const handleReset = () => {
    setPitch("");
    setResult(null);
    setError(null);
  };

  const charCount = pitch.length;
  const isNearLimit = charCount > MAX_CHARS * 0.85;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = pitch.trim().length > 0 && !isOverLimit && !isLoading;

  return (
    <main
      className="page-shell"
      style={{ background: "linear-gradient(180deg, #08060f 0%, #1a1018 46%, #2d150f 100%)" }}
    >
      <div className="safe-floating-space page-container page-container-narrow page-stack">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header mb-6"
        >
          <h1
            className="page-title"
            style={{ fontSize: "clamp(2rem, 7vw, 3.8rem)" }}
          >
            <span className="mr-2 text-2xl sm:text-3xl">{"\uD83D\uDD25"}</span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(128deg, #ff7b42, #ff8f51, #ffd07a)",
              }}
            >
              AI Founder Roast Bot
            </span>
          </h1>
          <p className="page-subtitle">
            Type your startup pitch. Get brutally honest feedback.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!result && !isLoading && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="panel w-full p-8 sm:p-10"
            >
              <div className="field-shell">
                <textarea
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="Describe your startup in one line..."
                  rows={4}
                  className="field-textarea min-h-[180px] rounded-2xl px-5 py-4 leading-relaxed sm:min-h-[200px]"
                  style={{
                    borderColor: "rgba(255, 123, 66, 0.36)",
                    boxShadow: "0 0 0 1px rgba(255,123,66,0.08)",
                  }}
                />
              </div>
              <div className="mt-4 pr-1">
                <span
                  className={`field-counter ${isOverLimit ? "error" : isNearLimit ? "warning" : ""}`}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-sm text-red-400"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {error}
                </motion.p>
              )}

                <motion.button
                  type="submit"
                  disabled={!canSubmit}
                  whileHover={canSubmit ? { scale: 1.03 } : {}}
                  whileTap={canSubmit ? { scale: 0.97 } : {}}
                  className="btn-primary mt-8 min-h-[54px] w-full rounded-full py-4 text-sm font-bold disabled:cursor-not-allowed"
                  style={{
                    background: canSubmit
                      ? "linear-gradient(135deg, #ff7b42, #f2b544)"
                      : "rgba(255,255,255,0.08)",
                    color: canSubmit ? "#201306" : "rgba(255,255,255,0.4)",
                    boxShadow: canSubmit ? "0 14px 30px rgba(255,123,66,0.33)" : "none",
                  }}
                >
                  Roast Me {"\uD83D\uDD25"}
                </motion.button>
            </motion.form>
          )}

          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center gap-6 py-16"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-6xl"
              >
                {"\uD83D\uDD25"}
              </motion.div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-base sm:text-lg text-center"
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {LOADING_MESSAGES[loadingMsgIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}

          {/* Results Area */}
          {result && !isLoading && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex w-full flex-col items-center gap-5"
            >
              <div
                className="panel w-full p-6 sm:p-8"
                style={{
                  borderColor: "rgba(255,123,66,0.28)",
                  background: "linear-gradient(135deg, rgba(255,123,66,0.11), rgba(255,123,66,0.03) 58%)",
                }}
              >
                <p
                  className="break-words text-base leading-relaxed text-white/90 sm:text-lg md:text-xl"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <TypewriterText text={result.roast} />
                </p>
              </div>

              {/* Severity Meter */}
              <div className="flex flex-col items-center gap-2 py-2">
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                >
                  Severity
                </span>
                <SeverityFlames severity={result.severity} />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRoastAgain}
                  className="btn-primary flex-1 min-h-[52px] rounded-full px-6 py-3.5 text-sm font-semibold sm:text-base"
                  style={{
                    background: "linear-gradient(135deg, #ff7b42, #d9534f)",
                    color: "#fff7ee",
                    boxShadow: "0 14px 30px rgba(255,123,66,0.3)",
                  }}
                >
                  Roast Me Again {"\uD83D\uDD25"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="btn-secondary flex-1 min-h-[52px] rounded-full px-6 py-3.5 text-sm font-semibold sm:text-base"
                >
                  Try Another Pitch
                </motion.button>
              </div>

              <div className="mt-6 w-full">
                <ShareCard gameName="roast">
                  <p
                    className="break-words text-base italic text-white/90 sm:text-lg"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    &ldquo;{result.roast}&rdquo;
                  </p>
                  <p className="text-sm text-orange-400 mt-3">
                    Severity: {"\uD83D\uDD25".repeat(result.severity)}
                  </p>
                </ShareCard>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="panel-soft mt-4 w-full px-4 py-5 text-center sm:px-6"
              >
                <p
                  className="mb-3 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Want 200 founders this honest?
                </p>
                <a
                  href="https://annual.aiboomi.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex min-h-[44px] px-6 py-3 text-sm font-semibold"
                  style={{
                    background: "linear-gradient(135deg, #f2b544, #ffd07a)",
                    color: "#201306",
                  }}
                >
                  AIBoomi Annual, March 18-20, Chennai
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 pb-8 pt-12">
          <GameNav />
        </div>
      </div>

      <FloatingCTA />
    </main>
  );
}
