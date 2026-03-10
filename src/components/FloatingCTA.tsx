"use client";

import { motion } from "framer-motion";
import { EVENT } from "@/lib/constants";

export function FloatingCTA() {
  return (
    <motion.a
      href={EVENT.registerUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(232,165,48,0.4)]"
      style={{
        background: "linear-gradient(135deg, #e8a530, #f0b84a)",
        color: "#0a0a2e",
        fontFamily: "var(--font-body)",
        boxShadow: "0 4px 20px rgba(232, 165, 48, 0.3)",
      }}
    >
      <span className="hidden sm:inline">Register for</span>{" "}
      <span className="font-bold">{EVENT.name}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-1">
        <path
          d="M3 8h10m0 0L9 4m4 4L9 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.a>
  );
}
