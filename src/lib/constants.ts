export const GAMES = [
  {
    id: "roast",
    title: "AI Founder Roast Bot",
    description: "Type your startup pitch. Get brutally honest feedback.",
    icon: "🔥",
    href: "/roast",
    color: "var(--orange)",
    gradient: "from-orange-500 to-red-600",
  },
  {
    id: "simulate",
    title: "Unconference Table",
    description: "Sit at a simulated roundtable with 4 AI founder personas.",
    icon: "💬",
    href: "/simulate",
    color: "var(--violet)",
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    id: "wall",
    title: "The Anti-Pitch Wall",
    description: "Post your biggest AI failure, doubt, or hot take. Anonymously.",
    icon: "🧱",
    href: "/wall",
    color: "var(--green)",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "buildvsbuy",
    title: "Build vs Buy",
    description: "30 seconds. 7 rounds. Build or buy? Decide under pressure.",
    icon: "⚡",
    href: "/buildvsbuy",
    color: "var(--lavender)",
    gradient: "from-violet-500 to-purple-600",
  },
] as const;

export const EVENT = {
  name: "AIBoomi Annual '26",
  dates: "March 18-20, 2026",
  location: "Chennai",
  tagline: "Realities of AI Adoption",
  registerUrl: "https://annual.aiboomi.org/",
  hashtag: "#BuildWhatsNext",
  founderCount: "200+",
};

export const UNCONFERENCE_PROMPTS = [
  {
    id: 1,
    topic: "In-Product AI",
    question: "What's actually working in your AI features today?",
    subQuestion:
      "What's the biggest gap between what your customers expect from AI and what you can actually deliver?",
  },
  {
    id: 2,
    topic: "AI Agents",
    question: "What's holding you back from deploying AI agents in production?",
    subQuestion: "Overwhelmed · Unsure what use-cases · Too expensive",
  },
  {
    id: 3,
    topic: "Build vs Buy",
    question: "When it comes to AI, how do you decide whether to build versus buy?",
    subQuestion:
      "What criteria do you use? Where have you been burned by the wrong choice?",
  },
] as const;

export const AI_PERSONAS = [
  {
    name: "Priya",
    stage: "Bootstrapped, $500K ARR",
    personality: "Pragmatic, cost-conscious, ships fast",
    avatar: "P",
    color: "#e8a530",
  },
  {
    name: "Arjun",
    stage: "Series A, $3M ARR",
    personality: "Ambitious, wants to go big, VC-backed thinking",
    avatar: "A",
    color: "#6b4fa0",
  },
  {
    name: "Meera",
    stage: "Scaled, $15M ARR",
    personality: "Been through it all, wise, slightly jaded",
    avatar: "M",
    color: "#00cc66",
  },
  {
    name: "Vikram",
    stage: "Pre-revenue, technical founder",
    personality: "Skeptic, questions everything, deep technical",
    avatar: "V",
    color: "#3b82f6",
  },
] as const;

export const BUILD_VS_BUY_SCENARIOS = [
  {
    id: "vdb-rag",
    title: "Vector Database for RAG Pipeline",
    context: "Series A startup, 8 engineers, $2M runway, launching in 3 months",
    description:
      "You need a vector database for your RAG pipeline. Pinecone is $500/mo, or your senior engineer says she can build one on Postgres with pgvector in 2 weeks.",
    expert_answer: "buy" as const,
    build_outcome:
      "Teams that built spent 6 weeks (not 2) and hit scaling issues at 10M vectors. Most migrated to managed solutions within 6 months.",
    buy_outcome:
      "Teams that bought shipped 4 weeks faster and spent the saved engineering time on their core product differentiation.",
    community_build_pct: 35,
  },
  {
    id: "llm-gateway",
    title: "LLM API Gateway & Router",
    context: "Growth-stage, 20 engineers, using 3 different LLM providers",
    description:
      "You're calling Claude, GPT-4, and Gemini across different features. You need a unified gateway for routing, fallbacks, and cost tracking. Build an internal one or use LiteLLM/Portkey?",
    expert_answer: "build" as const,
    build_outcome:
      "Teams that built a thin routing layer (not a full platform) got exactly the fallback logic they needed. Took 1 week for a senior engineer.",
    buy_outcome:
      "Teams that bought got 80% of what they needed fast, but fought vendor lock-in when they needed custom routing logic later.",
    community_build_pct: 55,
  },
  {
    id: "eval-framework",
    title: "LLM Evaluation Framework",
    context: "Pre-seed, 3 engineers, building an AI writing assistant",
    description:
      "Your AI outputs are inconsistent. You need systematic evals — golden datasets, automated scoring, regression detection. Build your own or use Braintrust/Promptfoo?",
    expert_answer: "buy" as const,
    build_outcome:
      "Teams that built underestimated the complexity. Most ended up with fragile pytest scripts that nobody maintained after the initial author left.",
    buy_outcome:
      "Teams that bought had production evals running in 2 days. The structured approach caught regressions they'd been shipping to users.",
    community_build_pct: 40,
  },
  {
    id: "auth-system",
    title: "AI-Aware Auth & Permissions",
    context: "Series B, enterprise customers, SOC2 compliant, 500+ users",
    description:
      "Your AI features need granular permissions — who can access which AI models, usage quotas per team, audit logs for compliance. Extend your auth system or buy a platform like WorkOS?",
    expert_answer: "buy" as const,
    build_outcome:
      "Teams that built spent 3 months on auth plumbing instead of product. Enterprise deals slipped while they built audit logging.",
    buy_outcome:
      "Teams that bought closed enterprise deals 2 months faster. The $15K/year cost paid for itself in the first deal.",
    community_build_pct: 25,
  },
  {
    id: "prompt-mgmt",
    title: "Prompt Management System",
    context: "Growth-stage, 15 engineers, 50+ prompts across 12 features",
    description:
      "Your prompts are scattered across the codebase. You need versioning, A/B testing, and a way for non-engineers to edit them. Build an internal tool or use PromptLayer/Humanloop?",
    expert_answer: "build" as const,
    build_outcome:
      "Teams that built a simple YAML/DB-backed system with git versioning got exactly what they needed. Most solutions were under 500 lines of code.",
    buy_outcome:
      "Teams that bought got fancy dashboards but fought integration complexity. The abstraction layer between code and prompts created more problems than it solved.",
    community_build_pct: 60,
  },
  {
    id: "data-pipeline",
    title: "AI Training Data Pipeline",
    context: "Series A, building a domain-specific model, 500K documents to process",
    description:
      "You need to extract, clean, chunk, and embed 500K documents for fine-tuning. Build a custom pipeline with Airflow or use Unstructured.io + managed embeddings?",
    expert_answer: "buy" as const,
    build_outcome:
      "Teams that built spent 8 weeks on data cleaning edge cases (PDFs, tables, headers). The pipeline worked but was brittle and needed constant maintenance.",
    buy_outcome:
      "Teams that bought had clean data in 1 week. The 90% solution was good enough — they spent their time on what made their model unique.",
    community_build_pct: 30,
  },
  {
    id: "ai-observability",
    title: "AI Observability & Monitoring",
    context: "Scaled startup, $10M ARR, 100K daily AI API calls, 4 AI features in production",
    description:
      "You need to monitor latency, costs, error rates, and output quality across all AI calls. Build dashboards on your existing monitoring stack or use Helicone/LangSmith?",
    expert_answer: "buy" as const,
    build_outcome:
      "Teams that built on Datadog/Grafana got basic metrics but missed AI-specific insights like token usage trends and quality degradation patterns.",
    buy_outcome:
      "Teams that bought got purpose-built AI dashboards in a day. The cost-per-token tracking alone saved more than the subscription fee.",
    community_build_pct: 20,
  },
  {
    id: "search-engine",
    title: "Hybrid Search (Semantic + Keyword)",
    context: "B2B SaaS, 50K enterprise documents, users expect instant search",
    description:
      "Your keyword search isn't cutting it for natural language queries. You need hybrid search combining BM25 + vector similarity. Build on Elasticsearch + vectors or use Weaviate/Vespa?",
    expert_answer: "build" as const,
    build_outcome:
      "Teams that built on Elasticsearch with kNN got full control over ranking. The learning curve was steep but the customization paid off for domain-specific relevance.",
    buy_outcome:
      "Teams that bought got great results out of the box but hit limitations when they needed custom re-ranking for their specific domain.",
    community_build_pct: 50,
  },
  {
    id: "voice-ai",
    title: "Voice AI for Customer Support",
    context: "D2C startup, 5000 daily support calls, 30% AI-automatable",
    description:
      "You want AI to handle routine support calls (order status, returns, FAQs). Build on Twilio + Whisper + Claude or buy Bland.ai/Retell?",
    expert_answer: "buy" as const,
    build_outcome:
      "Teams that built underestimated the telephony complexity — echo cancellation, barge-in handling, latency. Most abandoned after 3 months and bought anyway.",
    buy_outcome:
      "Teams that bought had AI handling 30% of calls in 2 weeks. The per-minute cost was higher but total cost including engineering time was 60% lower.",
    community_build_pct: 15,
  },
  {
    id: "code-review-ai",
    title: "AI Code Review Bot",
    context: "Engineering team of 40, 50+ PRs/day, quality inconsistency",
    description:
      "You want AI to review PRs for bugs, style, and security. Build a GitHub Action with Claude or use CodeRabbit/Sourcegraph Cody?",
    expert_answer: "build" as const,
    build_outcome:
      "Teams that built a focused bot checking their specific patterns (not generic lint) got the highest developer satisfaction. A weekend project for a senior engineer.",
    buy_outcome:
      "Teams that bought got broad coverage but developers complained about noisy, generic comments. The signal-to-noise ratio was low for domain-specific codebases.",
    community_build_pct: 55,
  },
  {
    id: "content-gen",
    title: "AI Content Generation Pipeline",
    context: "Marketing SaaS, customers need to generate 100s of social posts/month",
    description:
      "Your users want AI-generated social media content with brand voice matching. Build on Claude API with custom prompts or integrate Jasper/Writer APIs?",
    expert_answer: "build" as const,
    build_outcome:
      "Teams that built with well-crafted system prompts + few-shot examples got brand voice quality that generic tools couldn't match. Core product differentiator.",
    buy_outcome:
      "Teams that bought shipped faster initially but couldn't differentiate. Every competitor used the same APIs with similar output quality.",
    community_build_pct: 65,
  },
  {
    id: "ai-billing",
    title: "AI Usage-Based Billing",
    context: "B2B AI SaaS, 200 customers, charging per AI generation",
    description:
      "You need to meter AI usage, set per-customer quotas, calculate costs with markup, and generate invoices. Build on Stripe or use a metering platform like Orb/Metronome?",
    expert_answer: "buy" as const,
    build_outcome:
      "Teams that built on Stripe's usage records got 70% of the way, then spent months on edge cases — proration, overages, credit systems, real-time quota enforcement.",
    buy_outcome:
      "Teams that bought had production billing in 1 week. The pricing flexibility let them experiment with plans that increased ARPU 40%.",
    community_build_pct: 20,
  },
] as const;

export const ARCHETYPES = {
  builder: {
    name: "The Builder",
    description: "You trust your team more than vendors. Respect — just watch the timeline.",
    emoji: "🔨",
  },
  buyer: {
    name: "The Buyer",
    description: "Speed over control. You ship fast and optimize later. Smart at this stage.",
    emoji: "🛒",
  },
  pragmatist: {
    name: "The Pragmatist",
    description: "Balanced and strategic. You pick your battles wisely. Founders love you.",
    emoji: "⚖️",
  },
  overthinker: {
    name: "The Overthinker",
    description: "Analysis paralysis is real. Sometimes the wrong choice is better than no choice.",
    emoji: "🤔",
  },
  maverick: {
    name: "The Maverick",
    description: "You zig when everyone zags. Contrarian by nature. Sometimes that's genius.",
    emoji: "🃏",
  },
} as const;
