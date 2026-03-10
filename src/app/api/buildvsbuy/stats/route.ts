import { NextResponse } from "next/server";
import { BUILD_VS_BUY_SCENARIOS, ARCHETYPES } from "@/lib/constants";

interface PlayerChoice {
  scenario_id: string;
  choice: "build" | "buy" | "timeout";
  time_ms: number;
}

function calculateScore(
  choice: "build" | "buy" | "timeout",
  expertAnswer: string,
  timeMs: number
): number {
  if (choice === "timeout") return 0;
  let score = choice === expertAnswer ? 100 : 25;
  if (timeMs < 10000) score += 50;
  else if (timeMs < 20000) score += 25;
  return score;
}

function getArchetype(
  choices: PlayerChoice[],
  totalScore: number,
  scenarioMap: Map<string, (typeof BUILD_VS_BUY_SCENARIOS)[number]>
): keyof typeof ARCHETYPES {
  const builds = choices.filter((c) => c.choice === "build").length;
  const buys = choices.filter((c) => c.choice === "buy").length;
  const timeouts = choices.filter((c) => c.choice === "timeout").length;

  // Count times player went against the community majority
  const againstMajority = choices.filter((c) => {
    if (c.choice === "timeout") return false;
    const scenario = scenarioMap.get(c.scenario_id);
    if (!scenario) return false;
    const majorityIsBuild = scenario.community_build_pct > 50;
    return (
      (majorityIsBuild && c.choice === "buy") ||
      (!majorityIsBuild && c.choice === "build")
    );
  }).length;

  if (timeouts >= 3) return "overthinker";
  if (builds >= 5) return "builder";
  if (buys >= 5) return "buyer";
  if (againstMajority >= 4) return "maverick";
  return "pragmatist";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const choices: PlayerChoice[] = body.choices;

    if (!Array.isArray(choices) || choices.length === 0) {
      return NextResponse.json(
        { error: "Invalid choices array" },
        { status: 400 }
      );
    }

    const scenarioMap = new Map<string, (typeof BUILD_VS_BUY_SCENARIOS)[number]>(
      BUILD_VS_BUY_SCENARIOS.map((s) => [s.id, s])
    );

    let totalScore = 0;
    const results = choices.map((choice) => {
      const scenario = scenarioMap.get(choice.scenario_id);
      if (!scenario) {
        return {
          scenario_id: choice.scenario_id,
          expert_answer: "unknown",
          build_outcome: "",
          buy_outcome: "",
          community_build_pct: 50,
          points_earned: 0,
        };
      }

      const points = calculateScore(
        choice.choice,
        scenario.expert_answer,
        choice.time_ms
      );
      totalScore += points;

      return {
        scenario_id: choice.scenario_id,
        expert_answer: scenario.expert_answer,
        build_outcome: scenario.build_outcome,
        buy_outcome: scenario.buy_outcome,
        community_build_pct: scenario.community_build_pct,
        points_earned: points,
      };
    });

    const archetype = getArchetype(choices, totalScore, scenarioMap);

    return NextResponse.json({
      score: totalScore,
      archetype,
      results,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
