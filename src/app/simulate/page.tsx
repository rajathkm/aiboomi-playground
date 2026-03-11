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
      className="page-shell"
      style={{
        background: "linear-gradient(180deg, #08060f 0%, #100c22 42%, #1e1640 100%)",
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

      <div className="safe-floating-space page-container page-container-narrow page-stack">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header"
        >
          <h1
            className="page-title"
            style={{ fontSize: "clamp(2rem, 6.6vw, 3.7rem)" }}
          >
            <span className="mr-2">💬</span>
            <span
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #e6dbff 60%, #bba0ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Unconference Table
            </span>
          </h1>
          <p className="page-subtitle">
            Sit at a simulated roundtable with AI founder personas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="panel p-8 sm:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(154, 119, 255, 0.16), rgba(154, 119, 255, 0.04) 60%)",
            borderColor: "rgba(154,119,255,0.3)",
          }}
        >
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgba(154,119,255,0.95)",
            }}
          >
            {selectedPrompt.topic}
          </p>
          <p
            className="text-[1.03rem] font-semibold leading-relaxed sm:text-xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-primary)",
            }}
          >
            &ldquo;{selectedPrompt.question}&rdquo;
          </p>
          {selectedPrompt.subQuestion && (
            <p
              className="mt-3 text-sm leading-relaxed sm:text-[0.96rem]"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-muted)",
              }}
            >
              {selectedPrompt.subQuestion}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {AI_PERSONAS.map((persona) => (
            <div
              key={persona.name}
              className="panel-soft flex min-h-[88px] items-center gap-4 rounded-2xl px-6 py-5 transition-all duration-300"
              style={{
                background:
                  activeSpeaker === persona.name
                    ? `${persona.color}1f`
                    : "var(--surface-mid)",
                borderColor:
                  activeSpeaker === persona.name
                    ? `${persona.color}40`
                    : "rgba(255,255,255,0.09)",
              }}
            >
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
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
                  className="text-sm font-semibold leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: persona.color,
                  }}
                >
                  {persona.name}
                </p>
                <p
                  className="text-xs leading-snug"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  {persona.stage}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        <div
          ref={chatContainerRef}
          className="panel chat-scroll flex-1 overflow-y-auto p-8 sm:p-10"
          style={{
            borderColor: "rgba(255,255,255,0.11)",
            background: "rgba(12, 8, 22, 0.7)",
            maxHeight: "54vh",
            minHeight: "320px",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(154, 119, 255, 0.3) transparent",
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
                className={`mb-6 flex items-start gap-3.5 last:mb-0 sm:gap-4 ${
                  msg.isUser ? "flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                {!msg.isUser && (
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
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
                  className="min-w-0 max-w-[calc(100%-5.8rem)] rounded-2xl px-5 py-4 sm:max-w-[78%] sm:px-6"
                  style={{
                    background: msg.isUser
                      ? "rgba(154, 119, 255, 0.2)"
                      : "rgba(255, 255, 255, 0.06)",
                    borderLeft: msg.isUser
                      ? "none"
                      : `3px solid ${msg.color}60`,
                    borderRight: msg.isUser
                      ? "3px solid rgba(154, 119, 255, 0.5)"
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
                    className="break-words whitespace-pre-wrap text-[0.95rem] leading-relaxed"
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
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: "rgba(154, 119, 255, 0.25)",
                      color: "#e0d2ff",
                      border: "2px solid rgba(154, 119, 255, 0.5)",
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
                className="mb-4 flex items-center gap-3.5"
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
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
                  className="flex items-center gap-1.5 rounded-xl px-4 py-3.5"
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex items-center gap-3.5 sm:gap-4"
        >
          <div
            className="panel-soft flex min-h-[62px] flex-1 items-center rounded-2xl border-white/20 px-5 py-4 transition-all duration-200 focus-within:border-white/40 sm:px-6"
            style={{
              background: "rgba(255, 255, 255, 0.05)",
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
                    : "Jump in with your take..."
              }
              disabled={isLoading || showReveal}
              className="min-w-0 flex-1 border-none bg-transparent pr-2 text-[15px] outline-none placeholder:text-white/30 sm:text-base"
              style={{
                fontFamily: "var(--font-body)",
                color: "var(--text-primary)",
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={isLoading || showReveal || !userInput.trim()}
            className="flex h-[54px] w-[54px] min-h-[54px] min-w-[54px] flex-shrink-0 items-center justify-center rounded-2xl border border-white/20 p-0 transition-all duration-200 hover:scale-105 hover:border-white/35 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 sm:h-[56px] sm:w-[56px] sm:min-h-[56px] sm:min-w-[56px]"
            style={{
              background: "rgba(154, 119, 255, 0.22)",
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

        <div className="flex w-full flex-col items-stretch justify-between gap-4 pb-8 pt-10 sm:flex-row sm:items-center">
          <button
            onClick={handleRestart}
            className="min-h-[48px] w-full rounded-xl px-5 py-3 text-sm transition-all duration-200 hover:bg-white/5 hover:text-white/80 sm:w-auto"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--text-muted)",
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
              className="panel max-w-lg w-full rounded-2xl border-white/20 p-8 text-center sm:p-10"
              style={{
                borderRadius: 24,
                background:
                  "linear-gradient(135deg, rgba(154, 119, 255, 0.18), rgba(47, 34, 80, 0.28))",
                boxShadow:
                  "0 0 60px rgba(154, 119, 255, 0.2), 0 0 120px rgba(154, 119, 255, 0.1)",
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
                  color: "var(--text-secondary)",
                }}
              >
                {EVENT.founderCount} founders. 0 slides. Just real talk.
                <br />
                <span style={{ color: "var(--text-muted)" }}>
                  {EVENT.name} &middot; {EVENT.dates} &middot; {EVENT.location}
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
                    background: "linear-gradient(135deg, #f2b544, #ffd07a)",
                    color: "#201306",
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
                    color: "var(--text-muted)",
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
