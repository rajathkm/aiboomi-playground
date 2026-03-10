import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Simple in-memory rate limiter (resets on server restart)
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count++;
  return true;
}

const SYSTEM_PROMPT = `You are simulating an unconference roundtable discussion between 4 AI startup founders. Generate the next 2 responses in the conversation.

The personas:
- Priya (Bootstrapped, $500K ARR): Pragmatic, cost-conscious, ships fast. Speaks from real experience of doing more with less.
- Arjun (Series A, $3M ARR): Ambitious, thinks big, VC-backed perspective. Sometimes overestimates what money can solve.
- Meera (Scaled, $15M ARR): Been through it all. Wise, slightly jaded. Drops truth bombs casually.
- Vikram (Pre-revenue, technical founder): Skeptic. Questions everything. Goes deep on technical details.

Rules:
- Each response should be 1-3 sentences, conversational, opinionated
- Personas should DISAGREE with each other sometimes
- If a user message is provided, at least one persona should directly respond to it
- Be specific — mention real tools, frameworks, numbers
- No corporate speak. This is real founder talk.
- Do NOT repeat a persona who just spoke — vary the speakers
- Keep it natural, like people actually talk in a small group

Respond in JSON: { "responses": [{ "speaker": "Name", "text": "their response" }] }`;

interface ConversationEntry {
  speaker: string;
  text: string;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in an hour." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      prompt_id,
      conversation_history,
      user_message,
    }: {
      prompt_id: 1 | 2 | 3;
      conversation_history: ConversationEntry[];
      user_message: string | null;
    } = body;

    if (!prompt_id || ![1, 2, 3].includes(prompt_id)) {
      return NextResponse.json(
        { error: "Invalid prompt_id" },
        { status: 400 }
      );
    }

    const prompts: Record<number, string> = {
      1: "What's actually working in your AI features today?",
      2: "What's holding you back from deploying AI agents in production?",
      3: "When it comes to AI, how do you decide whether to build versus buy?",
    };

    const topic = prompts[prompt_id];

    let conversationContext = `Discussion topic: "${topic}"\n\n`;

    if (conversation_history && conversation_history.length > 0) {
      conversationContext += "Conversation so far:\n";
      for (const entry of conversation_history) {
        conversationContext += `${entry.speaker}: ${entry.text}\n`;
      }
      conversationContext += "\n";
    }

    if (user_message) {
      conversationContext += `A participant (user) just said: "${user_message}"\n\nGenerate the next 2 founder responses. At least one should directly engage with what the user said.`;
    } else {
      conversationContext += `Generate the next 2 founder responses continuing this discussion.`;
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: conversationContext,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = textBlock.text;
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    if (
      !parsed.responses ||
      !Array.isArray(parsed.responses) ||
      parsed.responses.length === 0
    ) {
      throw new Error("Invalid response format");
    }

    return NextResponse.json({
      responses: parsed.responses.map(
        (r: { speaker: string; text: string }) => ({
          speaker: r.speaker,
          text: r.text,
        })
      ),
    });
  } catch (error) {
    console.error("Simulate API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 }
    );
  }
}
