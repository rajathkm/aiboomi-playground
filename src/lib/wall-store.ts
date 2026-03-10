import { nanoid } from "nanoid";

export interface WallEntry {
  id: string;
  text: string;
  category: "failure" | "doubt" | "hot-take" | "confession";
  upvotes: number;
  created_at: string;
}

// In-memory store (resets on deploy — fine for MVP)
const entries = new Map<string, WallEntry>();

// Rate limiting: IP -> array of timestamps
const postTimestamps = new Map<string, number[]>();

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3;

// Basic profanity list
const PROFANITY_LIST = [
  "fuck",
  "shit",
  "ass",
  "bitch",
  "damn",
  "crap",
  "dick",
  "bastard",
  "cunt",
  "piss",
];

// Seed data
const seedEntries: Omit<WallEntry, "id">[] = [
  {
    text: "We spent $40K on fine-tuning. GPT-4 with a good prompt beat it.",
    category: "failure",
    upvotes: 24,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    text: "Our AI feature has 2% adoption. We put it on the pricing page anyway.",
    category: "confession",
    upvotes: 31,
    created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    text: "Nobody on our team actually understands how embeddings work. We shipped it anyway.",
    category: "confession",
    upvotes: 18,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    text: "I tell VCs our AI is proprietary. It's a Claude API call with a system prompt.",
    category: "confession",
    upvotes: 42,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    text: "We pivoted to AI because our SaaS was dying. The AI part is also dying, just slower.",
    category: "failure",
    upvotes: 37,
    created_at: new Date(Date.now() - 3600000 * 4.5).toISOString(),
  },
  {
    text: "Our AI chatbot sometimes tells customers to try our competitor. We haven't fixed it.",
    category: "failure",
    upvotes: 29,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    text: "I used ChatGPT to write our AI strategy doc. Nobody noticed.",
    category: "confession",
    upvotes: 15,
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    text: "We have 'AI-powered' on our landing page. The AI is an if-else statement.",
    category: "hot-take",
    upvotes: 53,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    text: "Half of 'AI startups' at the last event I went to were just wrapper apps. Including mine.",
    category: "doubt",
    upvotes: 20,
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
  },
  {
    text: "Our 'ML pipeline' is a cron job that re-runs a Python script every 6 hours.",
    category: "hot-take",
    upvotes: 26,
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

// Seed the store on first load
function ensureSeeded() {
  if (entries.size === 0) {
    for (const seed of seedEntries) {
      const id = nanoid();
      entries.set(id, { ...seed, id });
    }
  }
}

ensureSeeded();

export function getEntries(): WallEntry[] {
  return Array.from(entries.values()).sort((a, b) => b.upvotes - a.upvotes);
}

export function addEntry(
  text: string,
  category: WallEntry["category"]
): WallEntry {
  const id = nanoid();
  const entry: WallEntry = {
    id,
    text,
    category,
    upvotes: 0,
    created_at: new Date().toISOString(),
  };
  entries.set(id, entry);
  return entry;
}

export function upvoteEntry(id: string): number | null {
  const entry = entries.get(id);
  if (!entry) return null;
  entry.upvotes += 1;
  return entry.upvotes;
}

export function checkContentModeration(text: string): boolean {
  const lower = text.toLowerCase();
  return !PROFANITY_LIST.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "i");
    return regex.test(lower);
  });
}

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = postTimestamps.get(ip) || [];

  // Filter to only recent timestamps
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  postTimestamps.set(ip, recent);

  if (recent.length >= RATE_LIMIT_MAX) {
    return false;
  }

  recent.push(now);
  postTimestamps.set(ip, recent);
  return true;
}
