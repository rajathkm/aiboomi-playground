"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { EVENT } from "@/lib/constants";

export function FloatingCTA() {
  const pathname = usePathname();
  
  // Hide on the wall page where the fixed bottom bar conflicts
  if (pathname === "/wall") return null;

  return (
    <motion.a
      href={EVENT.registerUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.6, ease: "easeOut" }}
      className="fixed right-4 sm:right-8 z-50 flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(232,165,48,0.4)] active:scale-[0.97]"
      style={{
        background: "linear-gradient(135deg, #e8a530, #f0b84a)",
        color: "#0a0a2e",
        fontFamily: "var(--font-body)",
        boxShadow: "0 4px 24px rgba(232, 165, 48, 0.35)",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
      }}
    >
      <span className="hidden sm:inline">Register for</span>{" "}
      <span className="font-bold">{EVENT.name}</span>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="ml-0.5 flex-shrink-0">
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
