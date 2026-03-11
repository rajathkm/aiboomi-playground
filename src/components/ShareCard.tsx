"use client";

import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { EVENT } from "@/lib/constants";

interface ShareCardProps {
  gameName: string;
  children: React.ReactNode;
  className?: string;
}

export function ShareCard({ gameName, children, className = "" }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0a0a2e",
      });
      const link = document.createElement("a");
      link.download = `aiboomi-${gameName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
  }, [gameName]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 sm:gap-5">
      <div
        ref={cardRef}
        className={`panel relative w-full max-w-[500px] overflow-hidden rounded-[22px] p-6 sm:p-8 ${className}`}
        style={{ background: "linear-gradient(135deg, #120e21 0%, #231842 46%, #3e2d65 100%)" }}
      >
        <div className="mb-6 flex items-center gap-2">
          <span
            className="rounded px-2.5 py-1 text-sm font-bold"
            style={{ background: "var(--accent-saffron)", color: "#1b1203", fontFamily: "var(--font-body)" }}
          >
            AI
          </span>
          <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-body)" }}>
            Boomi Playground
          </span>
        </div>

        {children}

        <div
          className="mt-6 flex items-center justify-between border-t border-white/20 pt-4 text-xs"
          style={{
            color: "rgba(255,255,255,0.6)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>{EVENT.name} | {EVENT.dates}</span>
          <span>{EVENT.hashtag}</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="btn-secondary min-h-[48px] rounded-full px-6 py-3 text-sm font-semibold"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8m0 0L5 7m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Download & Share
      </button>
    </div>
  );
}
