import { NextRequest, NextResponse } from "next/server";
import {
  getEntries,
  addEntry,
  checkContentModeration,
  checkRateLimit,
  type WallEntry,
} from "@/lib/wall-store";

export async function GET() {
  const entries = getEntries();
  return NextResponse.json({
    entries,
    total_count: entries.length,
  });
}

const VALID_CATEGORIES: WallEntry["category"][] = [
  "failure",
  "doubt",
  "hot-take",
  "confession",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, category } = body;

    // Validate text
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length > 200) {
      return NextResponse.json(
        { error: "Text must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be: failure, doubt, hot-take, or confession" },
        { status: 400 }
      );
    }

    // Content moderation
    if (!checkContentModeration(text)) {
      return NextResponse.json(
        { error: "Content contains inappropriate language" },
        { status: 400 }
      );
    }

    // Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 3 posts per 10 minutes." },
        { status: 429 }
      );
    }

    const entry = addEntry(text.trim(), category);

    return NextResponse.json({
      id: entry.id,
      approved: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
