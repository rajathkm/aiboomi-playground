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
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      <div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 w-full ${className}`}
        style={{
          background: "linear-gradient(135deg, #0a0a2e 0%, #2d1b69 50%, #6b4fa0 100%)",
          maxWidth: 500,
        }}
      >
        {/* AIBoomi branding */}
        <div className="flex items-center gap-2 mb-6">
          <span
            className="text-sm font-bold px-2.5 py-1 rounded"
            style={{ background: "#e8a530", color: "#0a0a2e", fontFamily: "var(--font-body)" }}
          >
            AI
          </span>
          <span className="text-sm font-bold text-white" style={{ fontFamily: "var(--font-body)" }}>
            Boomi Playground
          </span>
        </div>

        {/* Game content */}
        {children}

        {/* Footer */}
        <div
          className="mt-6 pt-4 flex items-center justify-between text-xs"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <span>{EVENT.name} | {EVENT.dates}</span>
          <span>{EVENT.hashtag}</span>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center justify-center gap-2 px-7 py-3.5 min-h-[48px] text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/15 active:scale-[0.97] cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(255,255,255,0.15)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8m0 0L5 7m3 3l3-3M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Download & Share
      </button>
    </div>
  );
}
