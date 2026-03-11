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
      className="page-shell"
      style={{
        background: "linear-gradient(180deg, #08060f 0%, #0b1b16 42%, #090612 100%)",
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

      <div className="safe-floating-space page-container page-container-narrow relative z-[1] !pb-[18rem] sm:!pb-[17rem]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="page-header mb-6"
        >
          <h1
            className="page-title"
            style={{ fontSize: "clamp(2rem, 6.6vw, 3.7rem)" }}
          >
            <span role="img" aria-label="brick">
              🧱
            </span>{" "}
            The Anti-Pitch Wall
          </h1>
          <p className="page-subtitle">
            Every AI event tells you what&apos;s working. We built a wall for
            what&apos;s NOT.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            color: "var(--accent-mint)",
          }}
        >
          🧱 {totalCount} confessions on the wall
        </motion.div>

        <AnimatePresence>
          {hasSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="panel-soft mx-auto mb-7 max-w-lg p-4 text-center"
              style={{
                background: "rgba(45,208,143,0.12)",
                borderColor: "rgba(45,208,143,0.28)",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              Raw. Real. That&apos;s the AIBoomi way.{" "}
              <span style={{ color: "var(--accent-mint)", fontWeight: 600 }}>
                March 18-20, Chennai.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4">
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
                  className="panel-soft rounded-2xl p-6"
                  style={{
                    background: "rgba(18, 14, 30, 0.7)",
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
                      className="btn-secondary inline-flex min-h-[44px] min-w-[44px] justify-center gap-2 rounded-full px-4 py-2"
                      style={{
                        border: isUpvoted
                          ? "1px solid rgba(45,208,143,0.4)"
                          : "1px solid rgba(255,255,255,0.1)",
                        background: isUpvoted
                          ? "rgba(45,208,143,0.14)"
                          : "transparent",
                        color: isUpvoted ? "var(--accent-mint)" : "rgba(255,255,255,0.6)",
                        fontSize: "0.8rem",
                        fontFamily: "var(--font-mono)",
                        cursor: isUpvoted ? "default" : "pointer",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill={isUpvoted ? "var(--accent-mint)" : "none"}
                      stroke={isUpvoted ? "var(--accent-mint)" : "currentColor"}
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

        <div className="flex justify-center pb-4 pt-8">
          <GameNav />
        </div>
      </div>

      <div
        className="safe-bottom fixed bottom-0 left-0 right-0 z-40 px-4 py-4 sm:px-6 lg:px-8"
        style={{
          background: "rgba(9, 8, 16, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="panel mx-auto max-w-[700px] rounded-2xl px-4 py-4 sm:px-5 sm:py-5">
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

          <div className="mb-3 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const config = CATEGORY_CONFIG[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="min-h-[40px] rounded-full px-4 py-2 font-semibold uppercase transition-all duration-200"
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

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
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
                className="field-control w-full rounded-xl border-white/20 pr-16"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-primary)",
                }}
              />
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
              className="btn-primary min-h-[52px] w-full rounded-xl px-6 text-sm font-bold whitespace-nowrap sm:w-auto"
              style={{
                background:
                  !text.trim() || isSubmitting
                    ? "rgba(45,208,143,0.2)"
                    : "linear-gradient(135deg, #2dd08f, #58e2a8)",
                color:
                  !text.trim() || isSubmitting
                    ? "rgba(255,255,255,0.4)"
                    : "#05160f",
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
