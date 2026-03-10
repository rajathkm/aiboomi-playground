"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameNav } from "@/components/GameNav";
import { FloatingCTA } from "@/components/FloatingCTA";
import {
  UNCONFERENCE_PROMPTS,
  AI_PERSONAS,
  EVENT,
} from "@/lib/constants";

type Message = {
  speaker: string;
  text: string;
  color: string;
  isUser?: boolean;
};

const PERSONA_MAP = AI_PERSONAS.reduce(
  (acc, p) => {
    acc[p.name] = p;
    return acc;
  },
  {} as Record<string, (typeof AI_PERSONAS)[number]>
);

function getPersonaColor(name: string): string {
  return PERSONA_MAP[name]?.color ?? "#888888";
}

function getPersonaInitial(name: string): string {
  return PERSONA_MAP[name]?.avatar ?? name.charAt(0);
}

export default function SimulatePage() {
  const [selectedPrompt, setSelectedPrompt] = useState<(typeof UNCONFERENCE_PROMPTS)[number]>(UNCONFERENCE_PROMPTS[0]);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized) {
      const idx = Math.floor(Math.random() * UNCONFERENCE_PROMPTS.length);
      setSelectedPrompt(UNCONFERENCE_PROMPTS[idx]);
      setHasInitialized(true);
    }
  }, [hasInitialized]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [showReveal, setShowReveal] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const fetchResponses = useCallback(
    async (userMessage: string | null = null) => {
      setIsLoading(true);

      const history = messages.map((m) => ({
        speaker: m.isUser ? "User" : m.speaker,
        text: m.text,
      }));

      try {
        const res = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt_id: selectedPrompt.id,
            conversation_history: history,
            user_message: userMessage,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "API error");
        }

        const data = await res.json();
        const responses: { speaker: string; text: string }[] = data.responses;

        // Add responses one by one with delays
        for (let i = 0; i < responses.length; i++) {
          const r = responses[i];
          setActiveSpeaker(r.speaker);

          // Wait for typing effect
          await new Promise((resolve) =>
            setTimeout(resolve, 1200 + Math.random() * 1000)
          );

          setMessages((prev) => [
            ...prev,
            {
              speaker: r.speaker,
              text: r.text,
              color: getPersonaColor(r.speaker),
            },
          ]);
          setExchangeCount((prev) => prev + 1);
        }

        setActiveSpeaker(null);
      } catch (err) {
        console.error("Failed to fetch responses:", err);
        setActiveSpeaker(null);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, selectedPrompt.id]
  );

  // Start the conversation on mount
  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      // Small delay before first AI responses
      const timer = setTimeout(() => {
        fetchResponses(null);
      }, 800);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check for reveal trigger
  useEffect(() => {
    if (exchangeCount >= 6 && !showReveal) {
      const timer = setTimeout(() => setShowReveal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [exchangeCount, showReveal]);

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || isLoading || showReveal) return;

    const userMsg: Message = {
      speaker: "You",
      text,
      color: "#ffffff",
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");

    await fetchResponses(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [restartKey, setRestartKey] = useState(0);

  const handleRestart = () => {
    const idx = Math.floor(Math.random() * UNCONFERENCE_PROMPTS.length);
    setSelectedPrompt(UNCONFERENCE_PROMPTS[idx]);
    setMessages([]);
    setExchangeCount(0);
    setShowReveal(false);
    setUserInput("");
    setIsLoading(false);
    setActiveSpeaker(null);
    setHasStarted(false);
    // Bump key to trigger the restart effect after state has settled
    setRestartKey((k) => k + 1);
  };

  // Effect that fires after restart state has settled
  useEffect(() => {
    if (restartKey === 0) return; // skip initial mount
    const timer = setTimeout(() => {
      setHasStarted(true);
      fetchResponses(null);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restartKey]);

  return (
    <main
      className="relative min-h-screen overflow-hidden flex flex-col items-center"
      style={{
        background:
          "linear-gradient(180deg, #050510 0%, #0a0a2e 50%, #1a1055 100%)",
      }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 500,
            height: 500,
            top: "-8%",
            left: "-5%",
            background: "rgba(107, 79, 160, 0.2)",
            animation: "orbFloat 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 350,
            height: 350,
            bottom: "5%",
            right: "-3%",
            background: "rgba(232, 165, 48, 0.1)",
            animation: "orbFloat 26s ease-in-out infinite reverse",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen w-full max-w-3xl flex-col gap-5 px-6 py-8 sm:gap-6 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1
            className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl"
            style={{
              fontFamily: "var(--font-display)",
              background:
                "linear-gradient(135deg, #ffffff 0%, #d4b8ff 60%, #6b4fa0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            <span className="mr-2">💬</span>Unconference Table
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--gray-400)",
            }}
          >
            Sit at a simulated roundtable with AI founder personas.
          </p>
        </motion.div>

        {/* Topic card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl p-6 sm:p-7"
          style={{
            background:
              "linear-gradient(135deg, rgba(107, 79, 160, 0.12), rgba(45, 27, 105, 0.08))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--violet)",
            }}
          >
            {selectedPrompt.topic}
          </p>
          <p
            className="text-base font-semibold sm:text-lg"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--white)",
            }}
          >
            &ldquo;{selectedPrompt.question}&rdquo;
          </p>
          {selectedPrompt.subQuestion && (
            <p
              className="mt-2 text-xs sm:text-sm"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--gray-500)",
              }}
            >
              {selectedPrompt.subQuestion}
            </p>
          )}
        </motion.div>

        {/* Persona cards row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="persona-scroll flex gap-3 overflow-x-auto pb-1 -mx-1 px-1"
          style={{ scrollbarWidth: "none" }}
        >
          {AI_PERSONAS.map((persona) => (
            <div
              key={persona.name}
              className="flex flex-shrink-0 items-center gap-2.5 rounded-xl border border-white/[0.06] transition-all duration-300 min-h-[48px]"
              style={{
                padding: "10px 14px",
                background:
                  activeSpeaker === persona.name
                    ? `${persona.color}15`
                    : "rgba(255,255,255,0.02)",
                borderColor:
                  activeSpeaker === persona.name
                    ? `${persona.color}40`
                    : "rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{
                  backgroundColor: `${persona.color}25`,
                  color: persona.color,
                  border: `2px solid ${persona.color}`,
                  animation:
                    activeSpeaker === persona.name
                      ? "speakerPulse 1.5s ease-in-out infinite"
                      : "none",
                }}
              >
                {persona.avatar}
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-semibold leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: persona.color,
                  }}
                >
                  {persona.name}
                </p>
                <p
                  className="truncate text-[11px] leading-tight"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--gray-500)",
                    maxWidth: "120px",
                  }}
                >
                  {persona.stage}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Chat area */}
        <div
          ref={chatContainerRef}
          className="chat-scroll flex-1 overflow-y-auto rounded-2xl p-5 sm:p-6"
          style={{
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(5, 5, 16, 0.6)",
            backdropFilter: "blur(10px)",
            maxHeight: "50vh",
            minHeight: "280px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(107, 79, 160, 0.3) transparent",
          }}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`mb-4 flex items-start gap-3 last:mb-0 ${
                  msg.isUser ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                {!msg.isUser && (
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${msg.color}20`,
                      color: msg.color,
                      border: `2px solid ${msg.color}60`,
                    }}
                  >
                    {getPersonaInitial(msg.speaker)}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    msg.isUser ? "ml-auto" : ""
                  }`}
                  style={{
                    background: msg.isUser
                      ? "rgba(107, 79, 160, 0.2)"
                      : "rgba(255, 255, 255, 0.04)",
                    borderLeft: msg.isUser
                      ? "none"
                      : `3px solid ${msg.color}60`,
                    borderRight: msg.isUser
                      ? "3px solid rgba(107, 79, 160, 0.5)"
                      : "none",
                  }}
                >
                  {!msg.isUser && (
                    <p
                      className="mb-1 text-xs font-semibold"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: msg.color,
                      }}
                    >
                      {msg.speaker}
                    </p>
                  )}
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "var(--font-body)",
                      color: msg.isUser
                        ? "var(--gray-100)"
                        : "var(--gray-200)",
                    }}
                  >
                    {msg.text}
                  </p>
                </div>

                {/* User avatar */}
                {msg.isUser && (
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "rgba(107, 79, 160, 0.25)",
                      color: "var(--lavender)",
                      border: "2px solid rgba(107, 79, 160, 0.5)",
                    }}
                  >
                    Y
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isLoading && activeSpeaker && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mb-4 flex items-center gap-3"
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: `${getPersonaColor(activeSpeaker)}20`,
                    color: getPersonaColor(activeSpeaker),
                    border: `2px solid ${getPersonaColor(activeSpeaker)}60`,
                    animation: "speakerPulse 1.5s ease-in-out infinite",
                  }}
                >
                  {getPersonaInitial(activeSpeaker)}
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderLeft: `3px solid ${getPersonaColor(activeSpeaker)}60`,
                  }}
                >
                  <span
                    className="text-xs font-semibold mr-2"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: getPersonaColor(activeSpeaker),
                    }}
                  >
                    {activeSpeaker}
                  </span>
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getPersonaColor(activeSpeaker),
                      animation: "typingBounce 1.2s ease-in-out infinite 0s",
                    }}
                  />
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getPersonaColor(activeSpeaker),
                      animation:
                        "typingBounce 1.2s ease-in-out infinite 0.2s",
                    }}
                  />
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: getPersonaColor(activeSpeaker),
                      animation:
                        "typingBounce 1.2s ease-in-out infinite 0.4s",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>

        {/* User input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <div
            className="flex min-h-[52px] flex-1 items-center rounded-xl border border-white/[0.1] transition-all duration-200 focus-within:border-white/[0.25] px-5 py-3"
            style={{
              background: "rgba(255, 255, 255, 0.04)",
              backdropFilter: "blur(10px)",
            }}
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                showReveal
                  ? "Discussion complete!"
                  : isLoading
                    ? "Founders are talking..."
                    : "Jump into the conversation..."
              }
              disabled={isLoading || showReveal}
              className="flex-1 border-none bg-transparent text-sm outline-none placeholder:text-white/20"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--white)",
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || showReveal || !userInput.trim()}
            className="flex min-h-[52px] min-w-[52px] h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-xl border border-white/[0.1] transition-all duration-200 hover:border-white/[0.2] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: "rgba(107, 79, 160, 0.2)",
              cursor:
                isLoading || showReveal || !userInput.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--lavender)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </motion.div>

        {/* Restart + Nav */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 pb-6">
          <button
            onClick={handleRestart}
            className="min-h-[48px] px-5 py-3 text-xs rounded-xl transition-all duration-200 hover:text-white/80 hover:bg-white/5"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--gray-500)",
              cursor: "pointer",
              background: "none",
              border: "none",
            }}
          >
            ↻ Try a different prompt
          </button>
          <GameNav />
        </div>
      </div>

      {/* Reveal overlay */}
      <AnimatePresence>
        {showReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{
              background: "rgba(5, 5, 16, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-lg w-full rounded-2xl border border-white/[0.1] text-center p-8 sm:p-10"
              style={{
                borderRadius: 24,
                background:
                  "linear-gradient(135deg, rgba(107, 79, 160, 0.15), rgba(45, 27, 105, 0.1))",
                boxShadow:
                  "0 0 60px rgba(107, 79, 160, 0.2), 0 0 120px rgba(107, 79, 160, 0.1)",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <p className="mb-3 text-4xl">🎭</p>
                <h2
                  className="mb-5 text-2xl font-bold tracking-tight sm:text-3xl"
                  style={{
                    fontFamily: "var(--font-display)",
                    background:
                      "linear-gradient(135deg, #ffffff, #d4b8ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  That was AI pretending to be founders.
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="mb-3 text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--orange)",
                }}
              >
                Imagine the real thing.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mb-8 text-sm leading-relaxed"
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--gray-400)",
                }}
              >
                {EVENT.founderCount} founders. 0 slides. Just real talk.
                <br />
                <span style={{ color: "var(--gray-500)" }}>
                  {EVENT.name} &middot; {EVENT.dates} &middot;{" "}
                  {EVENT.location}
                </span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9 }}
                className="flex flex-col items-center gap-4"
              >
                <a
                  href={EVENT.registerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 min-h-[48px] text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-[0.97] hover:shadow-[0_0_30px_rgba(232,165,48,0.4)]"
                  style={{
                    background:
                      "linear-gradient(135deg, #e8a530, #f0b84a)",
                    color: "#0a0a2e",
                    fontFamily: "var(--font-body)",
                    boxShadow: "0 4px 20px rgba(232, 165, 48, 0.3)",
                  }}
                >
                  Join the Real Table
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3 8h10m0 0L9 4m4 4L9 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

                <button
                  onClick={handleRestart}
                  className="text-xs min-h-[44px] px-4 py-2 rounded-lg transition-all duration-200 hover:text-white/80 hover:bg-white/5"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--gray-500)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                  }}
                >
                  ↻ Try a different prompt
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingCTA />
    </main>
  );
}
