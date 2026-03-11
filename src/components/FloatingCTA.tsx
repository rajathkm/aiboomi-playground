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
      className="btn-primary fixed left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full px-4 py-3 text-[11px] font-semibold transition-all duration-300 hover:shadow-[0_0_30px_rgba(232,165,48,0.4)] sm:left-auto sm:right-8 sm:w-auto sm:translate-x-0 sm:px-7 sm:py-3.5 sm:text-sm"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
        background: "linear-gradient(135deg, #e8a530, #f0b84a)",
        color: "#0a0a2e",
        fontFamily: "var(--font-body)",
        boxShadow: "0 4px 24px rgba(232, 165, 48, 0.35)",
      }}
    >
      <span className="hidden sm:inline">Register for</span>{" "}
      <span className="truncate font-bold">{EVENT.name}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="ml-0.5 flex-shrink-0"
      >
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
