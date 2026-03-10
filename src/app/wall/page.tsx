"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameNav } from "@/components/GameNav";
import { FloatingCTA } from "@/components/FloatingCTA";

interface WallEntry {
  id: string;
  text: string;
  category: "failure" | "doubt" | "hot-take" | "confession";
  upvotes: number;
  created_at: string;
}

type Category = WallEntry["category"];

const CATEGORY_CONFIG: Record<
  Category,
  { label: string; color: string; bg: string }
> = {
  failure: { label: "Failure", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  doubt: { label: "Doubt", color: "#eab308", bg: "rgba(234,179,8,0.15)" },
  "hot-take": {
    label: "Hot Take",
    color: "#f97316",
    bg: "rgba(249,115,22,0.15)",
  },
  confession: {
    label: "Confession",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.15)",
  },
};

const CATEGORIES: Category[] = ["failure", "doubt", "hot-take", "confession"];

function getGlowIntensity(upvotes: number): string {
  if (upvotes >= 40) return "0 0 20px rgba(0,204,102,0.4)";
  if (upvotes >= 20) return "0 0 12px rgba(0,204,102,0.25)";
  if (upvotes >= 10) return "0 0 8px rgba(0,204,102,0.15)";
  return "none";
}

function getBorderColor(upvotes: number): string {
  if (upvotes >= 40) return "rgba(0,204,102,0.5)";
  if (upvotes >= 20) return "rgba(0,204,102,0.3)";
  if (upvotes >= 10) return "rgba(0,204,102,0.2)";
  return "rgba(255,255,255,0.08)";
}

export default function WallPage() {
  const [entries, setEntries] = useState<WallEntry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [text, setText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("failure");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/wall");
      if (!res.ok) return;
      const data = await res.json();
      setEntries(data.entries);
      setTotalCount(data.total_count);
    } catch {
      // Silently fail on poll errors
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Poll every 15 seconds
  useEffect(() => {
    pollRef.current = setInterval(fetchEntries, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchEntries]);

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    // Optimistic entry
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticEntry: WallEntry = {
      id: optimisticId,
      text: text.trim(),
      category: selectedCategory,
      upvotes: 0,
      created_at: new Date().toISOString(),
    };

    setEntries((prev) => [optimisticEntry, ...prev]);
    setTotalCount((prev) => prev + 1);

    const submittedText = text.trim();
    const submittedCategory = selectedCategory;
    setText("");

    try {
      const res = await fetch("/api/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: submittedText,
          category: submittedCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Remove optimistic entry on failure
        setEntries((prev) => prev.filter((e) => e.id !== optimisticId));
        setTotalCount((prev) => prev - 1);
        setError(data.error || "Failed to submit");
        setText(submittedText);
      } else {
        // Replace optimistic entry with real one
        setEntries((prev) =>
          prev.map((e) => (e.id === optimisticId ? { ...e, id: data.id } : e))
        );
        setHasSubmitted(true);
      }
    } catch {
      setEntries((prev) => prev.filter((e) => e.id !== optimisticId));
      setTotalCount((prev) => prev - 1);
      setError("Network error. Please try again.");
      setText(submittedText);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (entryId: string) => {
    if (upvotedIds.has(entryId) || entryId.startsWith("optimistic-")) return;

    // Optimistic upvote
    setUpvotedIds((prev) => new Set(prev).add(entryId));
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId ? { ...e, upvotes: e.upvotes + 1 } : e
      )
    );

    try {
      const res = await fetch("/api/wall/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_id: entryId }),
      });

      if (!res.ok) {
        // Revert on failure
        setUpvotedIds((prev) => {
          const next = new Set(prev);
          next.delete(entryId);
          return next;
        });
        setEntries((prev) =>
          prev.map((e) =>
            e.id === entryId ? { ...e, upvotes: e.upvotes - 1 } : e
          )
        );
      }
    } catch {
      // Revert on error
      setUpvotedIds((prev) => {
        const next = new Set(prev);
        next.delete(entryId);
        return next;
      });
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId ? { ...e, upvotes: e.upvotes - 1 } : e
        )
      );
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          "linear-gradient(180deg, #050510 0%, #0a1a10 40%, #050510 100%)",
      }}
    >
      {/* Brick texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 48px,
            rgba(0,204,102,0.03) 48px,
            rgba(0,204,102,0.03) 50px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 98px,
            rgba(0,204,102,0.02) 98px,
            rgba(0,204,102,0.02) 100px
          )`,
        }}
      />

      <div className="relative z-[1] max-w-[1200px] mx-auto px-6 sm:px-8 pt-10 pb-[280px] sm:pb-[260px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1
            className="font-extrabold text-white mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
            }}
          >
            <span role="img" aria-label="brick">
              🧱
            </span>{" "}
            The Anti-Pitch Wall
          </h1>
          <p
            className="mx-auto leading-relaxed"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(0.95rem, 2vw, 1.15rem)",
              color: "rgba(255,255,255,0.6)",
              maxWidth: 560,
              lineHeight: 1.6,
            }}
          >
            Every AI event tells you what&apos;s working. We built a wall for
            what&apos;s NOT.
          </p>
        </motion.div>

        {/* Live counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            color: "#00cc66",
          }}
        >
          🧱 {totalCount} confessions on the wall
        </motion.div>

        {/* CTA after submitting */}
        <AnimatePresence>
          {hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-8 mx-auto max-w-lg rounded-xl p-4"
              style={{
                background: "rgba(0,204,102,0.1)",
                border: "1px solid rgba(0,204,102,0.2)",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Raw. Real. That&apos;s the AIBoomi way.{" "}
              <span style={{ color: "#00cc66", fontWeight: 600 }}>
                March 18-20, Chennai.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Masonry Wall */}
        <div
          className="wall-masonry"
          style={{ columnCount: 1, columnGap: 16 }}
        >
          <style>{`
            @media (min-width: 640px) {
              .wall-masonry { column-count: 2 !important; }
            }
            @media (min-width: 1024px) {
              .wall-masonry { column-count: 3 !important; }
            }
          `}</style>
          <AnimatePresence mode="popLayout">
            {entries.map((entry) => {
              const cat = CATEGORY_CONFIG[entry.category];
              const isUpvoted = upvotedIds.has(entry.id);

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl p-6"
                  style={{
                    breakInside: "avoid",
                    marginBottom: 16,
                    background: "#18181b",
                    border: `1px solid ${getBorderColor(entry.upvotes)}`,
                    boxShadow: getGlowIntensity(entry.upvotes),
                    cursor: "default",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                  }}
                >
                  {/* Category badge */}
                  <div className="mb-3">
                    <span
                      className="inline-block px-3 py-1 rounded-full font-semibold uppercase tracking-wider"
                      style={{
                        fontSize: "0.7rem",
                        fontFamily: "var(--font-mono)",
                        color: cat.color,
                        background: cat.bg,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {cat.label}
                    </span>
                  </div>

                  {/* Entry text */}
                  <p
                    className="mb-4"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.88)",
                      wordBreak: "break-word",
                    }}
                  >
                    &ldquo;{entry.text}&rdquo;
                  </p>

                  {/* Upvote button */}
                  <button
                    onClick={() => handleUpvote(entry.id)}
                    disabled={isUpvoted}
                    aria-label={`Upvote${isUpvoted ? "d" : ""} (${entry.upvotes})`}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full transition-all duration-200"
                    style={{
                      border: isUpvoted
                        ? "1px solid rgba(0,204,102,0.3)"
                        : "1px solid rgba(255,255,255,0.1)",
                      background: isUpvoted
                        ? "rgba(0,204,102,0.1)"
                        : "transparent",
                      color: isUpvoted ? "#00cc66" : "rgba(255,255,255,0.5)",
                      fontSize: "0.8rem",
                      fontFamily: "var(--font-mono)",
                      cursor: isUpvoted ? "default" : "pointer",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={isUpvoted ? "#00cc66" : "none"}
                      stroke={isUpvoted ? "#00cc66" : "currentColor"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    {entry.upvotes}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="flex justify-center pt-8 pb-4">
          <GameNav />
        </div>
      </div>

      {/* Fixed bottom submit area */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: "rgba(5,5,16,0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "20px 24px",
        }}
      >
        <div className="max-w-[700px] mx-auto">
          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-2 text-center"
                style={{
                  fontSize: "0.8rem",
                  color: "#ef4444",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Category pills */}
          <div className="flex gap-2 mb-3 justify-center flex-wrap">
            {CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="min-h-[40px] px-4 py-2 rounded-full font-semibold uppercase transition-all duration-200"
                  style={{
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-mono)",
                    border: `1px solid ${isSelected ? config.color : "rgba(255,255,255,0.1)"}`,
                    background: isSelected ? config.bg : "transparent",
                    color: isSelected ? config.color : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    letterSpacing: "0.03em",
                  }}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Input row */}
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                value={text}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    setText(e.target.value);
                    setError(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="What's your AI truth?"
                maxLength={200}
                className="w-full min-h-[52px] rounded-xl border border-white/10 outline-none transition-colors duration-200 focus:border-green-500/40"
                style={{
                  padding: "14px 60px 14px 20px",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-mono)",
                }}
              />
              {/* Character counter */}
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  color:
                    text.length > 180
                      ? "#ef4444"
                      : "rgba(255,255,255,0.3)",
                }}
              >
                {text.length}/200
              </span>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isSubmitting}
              className="min-h-[52px] px-6 rounded-xl font-bold whitespace-nowrap transition-all duration-200"
              style={{
                border: "none",
                background:
                  !text.trim() || isSubmitting
                    ? "rgba(0,204,102,0.2)"
                    : "#00cc66",
                color:
                  !text.trim() || isSubmitting
                    ? "rgba(255,255,255,0.4)"
                    : "#050510",
                fontSize: "0.85rem",
                fontFamily: "var(--font-mono)",
                cursor:
                  !text.trim() || isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Adding..." : "Add to the Wall"}
            </button>
          </div>
        </div>
      </div>

      <FloatingCTA />
    </div>
  );
}
