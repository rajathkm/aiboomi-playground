import { NextResponse } from "next/server";
import { BUILD_VS_BUY_SCENARIOS } from "@/lib/constants";

export async function GET() {
  // Shuffle and pick 7 random scenarios
  const shuffled = [...BUILD_VS_BUY_SCENARIOS].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 7);

  // Only send safe fields — no expert_answer, outcomes, or community_build_pct
  const scenarios = selected.map(({ id, title, context, description }) => ({
    id,
    title,
    context,
    description,
  }));

  return NextResponse.json({ scenarios });
}
