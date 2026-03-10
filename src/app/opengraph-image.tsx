import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "AIBoomi Playground — 4 AI Games for Founders";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a2e 0%, #2d1b69 50%, #6b4fa0 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              background: "#e8a530",
              color: "#0a0a2e",
              fontSize: "28px",
              fontWeight: 800,
              padding: "6px 14px",
              borderRadius: "8px",
            }}
          >
            AI
          </div>
          <span
            style={{ color: "#ffffff", fontSize: "28px", fontWeight: 700 }}
          >
            Boomi Playground
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          4 AI-Powered Games
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "#e8a530",
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          0 slides. This is what real talk looks like.
        </div>

        {/* Game icons */}
        <div
          style={{
            display: "flex",
            gap: "32px",
            marginBottom: "40px",
          }}
        >
          {["🔥 Roast Bot", "💬 Roundtable", "🧱 Anti-Pitch Wall", "⚡ Build vs Buy"].map(
            (game) => (
              <div
                key={game}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  color: "#ffffff",
                  fontSize: "20px",
                  fontWeight: 600,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {game}
              </div>
            )
          )}
        </div>

        {/* Event info */}
        <div
          style={{
            fontSize: "20px",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
          }}
        >
          AIBoomi Annual &apos;26 | March 18-20, 2026 | Chennai | 200+ AI Founders
        </div>
      </div>
    ),
    { ...size }
  );
}
