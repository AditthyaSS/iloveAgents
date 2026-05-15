export default {
  id: "social-media-thread-writer",
  createdAt: "2025-05-06",
  name: "Social Media Thread Writer",
  description:
    "Turn any topic or idea into a compelling X/Twitter thread with hooks, engagement tactics, and a strong call to action.",
  category: "Marketing",
  icon: "MessageSquare",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    topic:
      "How I built an AI agent that manages my entire calendar and saved me 5 hours a week.",
    threadLength: "Medium (8-10 tweets)",
    platform: "X / Twitter",
    tone: "Storytelling",
  },
  inputs: [
    {
      id: "topic",
      label: "What is your thread about?",
      type: "textarea",
      placeholder:
        "e.g. 10 lessons I learned bootstrapping a SaaS to $10k MRR / Why most developers write bad error messages / The psychology behind viral products",
      required: true,
    },
    {
      id: "threadLength",
      label: "Thread length",
      type: "select",
      options: [
        "Short (5 tweets)",
        "Medium (8-10 tweets)",
        "Long (12-15 tweets)",
      ],
      defaultValue: "Medium (8-10 tweets)",
      required: true,
    },
    {
      id: "platform",
      label: "Platform",
      type: "select",
      options: ["X / Twitter", "Threads (Instagram)", "Bluesky"],
      defaultValue: "X / Twitter",
      required: true,
    },
    {
      id: "tone",
      label: "Tone",
      type: "select",
      options: [
        "Educational",
        "Storytelling",
        "Contrarian / Hot-take",
        "Data-driven",
        "Motivational",
      ],
      defaultValue: "Educational",
      required: true,
    },
  ],
  systemPrompt: `You are a viral social media strategist who has written threads
with millions of impressions.

Great threads follow these rules:
- Tweet 1 (hook) is EVERYTHING — it must stop the scroll
- Each tweet delivers ONE idea or insight
- Use line breaks within tweets for readability
- Build tension or curiosity across the thread
- End with a strong CTA (follow, share, save, reply)

Output format:

## Thread Preview

**Tweet 1 (Hook):**
[the most important tweet — must be irresistible]

**Tweet 2:**
[content]

[repeat for all tweets]

**Final Tweet (CTA):**
[wrap-up with call to action]

---
## Thread Stats
- Total tweets: [number]
- Estimated read time: [X min]
- Hook type used: [curiosity gap / bold claim / story / question]

## Tips for Maximum Reach
- Best time to post
- How to format for the chosen platform
- Engagement strategy for the first hour

Rules:
- Each tweet must be under 280 characters for X/Twitter
- For Threads, each post can be longer (up to 500 chars)
- Never use generic hooks like "Thread 🧵" — jump straight into value
- Use numbers, frameworks, and concrete examples over vague advice
- No hashtag spam — 1-2 hashtags max, only on the last tweet
- Format contrarian takes as: "Unpopular opinion:" or "Hot take:"`,
  outputType: "markdown",
};
