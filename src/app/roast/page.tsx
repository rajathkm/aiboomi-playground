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
    <div className="flex gap-1">
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
          className="text-3xl"
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
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(180deg, #050510 0%, #1a0a00 100%)",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20 max-w-2xl mx-auto w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-3xl sm:text-4xl mr-2">{"\uD83D\uDD25"}</span>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, #f97316, #ef4444, #f59e0b)",
              }}
            >
              AI Founder Roast Bot
            </span>
          </h1>
          <p
            className="text-base sm:text-lg"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}
          >
            Type your startup pitch. Get brutally honest feedback.
          </p>
        </motion.div>

        {/* Input Area */}
        <AnimatePresence mode="wait">
          {!result && !isLoading && (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSubmit}
              className="w-full"
            >
              <div className="relative">
                <textarea
                  value={pitch}
                  onChange={(e) => setPitch(e.target.value)}
                  placeholder="Describe your startup in one line..."
                  rows={4}
                  className="w-full rounded-xl px-5 py-4 text-lg resize-none outline-none transition-all duration-300 placeholder:text-white/30"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "2px solid rgba(249, 115, 22, 0.2)",
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                    boxShadow: "0 0 20px rgba(249, 115, 22, 0.05)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(249, 115, 22, 0.6)";
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(249, 115, 22, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(249, 115, 22, 0.2)";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(249, 115, 22, 0.05)";
                  }}
                />
                <span
                  className="absolute bottom-3 right-4 text-xs font-mono transition-colors duration-200"
                  style={{
                    color: isOverLimit
                      ? "#ef4444"
                      : isNearLimit
                      ? "#f97316"
                      : "rgba(255,255,255,0.3)",
                    fontFamily: "var(--font-mono)",
                  }}
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
                className="mt-5 w-full py-4 rounded-xl text-lg font-bold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: canSubmit
                    ? "linear-gradient(135deg, #f97316, #ef4444)"
                    : "rgba(255,255,255,0.08)",
                  color: canSubmit ? "#fff" : "rgba(255,255,255,0.3)",
                  boxShadow: canSubmit ? "0 0 40px rgba(249, 115, 22, 0.3)" : "none",
                  fontFamily: "var(--font-body)",
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
              className="w-full flex flex-col items-center gap-6 py-12"
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
                  className="text-lg text-center"
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
              className="w-full flex flex-col items-center gap-8"
            >
              {/* Roast Text */}
              <div
                className="w-full rounded-xl p-6 sm:p-8"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(249, 115, 22, 0.2)",
                }}
              >
                <p
                  className="text-lg sm:text-xl leading-relaxed text-white/90"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <TypewriterText text={result.roast} />
                </p>
              </div>

              {/* Severity Meter */}
              <div className="flex flex-col items-center gap-2">
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}
                >
                  Severity
                </span>
                <SeverityFlames severity={result.severity} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 w-full">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRoastAgain}
                  className="flex-1 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #f97316, #ef4444)",
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                    boxShadow: "0 0 30px rgba(249, 115, 22, 0.2)",
                  }}
                >
                  Roast Me Again {"\uD83D\uDD25"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl font-semibold cursor-pointer transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Try Another Pitch
                </motion.button>
              </div>

              {/* Share Card */}
              <div className="mt-4">
                <ShareCard gameName="roast">
                  <p
                    className="text-lg italic text-white/90"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    &ldquo;{result.roast}&rdquo;
                  </p>
                  <p className="text-sm text-orange-400 mt-2">
                    Severity: {"\uD83D\uDD25".repeat(result.severity)}
                  </p>
                </ShareCard>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-center mt-4 px-4"
              >
                <p
                  className="text-sm mb-2"
                  style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)" }}
                >
                  Want 200 founders this honest?
                </p>
                <a
                  href="https://annual.aiboomi.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #e8a530, #f0b84a)",
                    color: "#0a0a2e",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  AIBoomi Annual, March 18-20, Chennai
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-auto pt-12">
          <GameNav />
        </div>
      </div>

      <FloatingCTA />
    </div>
  );
}
