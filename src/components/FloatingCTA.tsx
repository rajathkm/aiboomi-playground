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
      className="floating-register btn-primary px-4 py-3 text-[11px] font-semibold sm:px-7 sm:py-3.5 sm:text-sm"
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
