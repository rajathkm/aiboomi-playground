import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // uses ANTHROPIC_API_KEY env var

// ---------- Rate limiting ----------
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;

const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];

  // Remove timestamps outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  rateLimitMap.set(ip, recent);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// Periodically clean up stale entries (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recent);
    }
  }
}, 10 * 60 * 1000);

// ---------- Route ----------

const SYSTEM_PROMPT = `You are a brutally honest AI founder friend at an unconference table. Roast this startup pitch in 2-3 sentences. Be specific to their pitch — reference exact words they used. Funny but not mean-spirited. Channel the energy of a candid late-night founder conversation — the kind of real talk that only happens at events like AIBoomi. End with a wry observation that's actually insightful. Never be generic. Never be cruel. Be the friend who tells you the truth over drinks.

Respond in JSON: { "roast": "the roast text", "severity": 1-5, "tagline": "short quip for share card" }`;

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate body
    let body: { pitch?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { pitch } = body;

    if (!pitch || typeof pitch !== "string" || pitch.trim().length === 0) {
      return NextResponse.json(
        { error: "Pitch is required." },
        { status: 400 }
      );
    }

    if (pitch.length > 280) {
      return NextResponse.json(
        { error: "Pitch must be 280 characters or less." },
        { status: 400 }
      );
    }

    // Call Claude
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: pitch.trim(),
        },
      ],
    });

    // Extract text content
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude.");
    }

    // Parse JSON from response
    const raw = textBlock.text.trim();
    // Handle cases where Claude wraps JSON in markdown code fences
    const jsonString = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");

    let parsed: { roast: string; severity: number; tagline: string };
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error("Failed to parse roast response.");
    }

    // Validate and clamp severity
    const severity = Math.min(5, Math.max(1, Math.round(parsed.severity ?? 3)));

    return NextResponse.json({
      roast: parsed.roast,
      severity,
      tagline: parsed.tagline ?? "",
    });
  } catch (err) {
    console.error("Roast API error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating your roast. Please try again." },
      { status: 500 }
    );
  }
}
