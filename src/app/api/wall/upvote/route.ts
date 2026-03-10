import { NextRequest, NextResponse } from "next/server";
import { upvoteEntry } from "@/lib/wall-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entry_id } = body;

    if (!entry_id || typeof entry_id !== "string") {
      return NextResponse.json(
        { error: "entry_id is required" },
        { status: 400 }
      );
    }

    const upvotes = upvoteEntry(entry_id);

    if (upvotes === null) {
      return NextResponse.json(
        { error: "Entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ upvotes });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
