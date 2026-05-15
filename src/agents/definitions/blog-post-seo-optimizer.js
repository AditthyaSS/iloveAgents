export default {
  id: "blog-post-seo-optimizer",
  createdAt: "2026-05-15",
  name: "Blog Post SEO Optimizer",
  description:
    "Paste a blog draft and target keywords to get an optimized version with better titles, meta description, header structure, keyword placement, and internal linking suggestions.",
  category: "Marketing",
  icon: "SearchCheck",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    blog_draft:
      "# How to Start Investing\n\nInvesting can seem scary at first but it doesn't have to be. In this post I'll walk you through the basics of getting started with investing even if you have no experience.\n\nFirst you need to understand what investing is. Investing means putting your money into assets like stocks, bonds, or real estate with the goal of growing your wealth over time.\n\nThe most important thing is to start early. The power of compound interest means that even small amounts invested today can grow significantly over decades.\n\nHere are some tips for beginners:\n- Start with index funds\n- Don't try to time the market\n- Invest regularly\n- Keep your fees low\n\nIn conclusion, investing is one of the best ways to build wealth over time. Start today and your future self will thank you.",
    target_keywords: "beginner investing, how to start investing, investing for beginners, index funds for beginners",
    tone: "Keep original tone",
    focus: "Full optimization",
  },
  inputs: [
    {
      id: "blog_draft",
      label: "Blog post draft",
      type: "textarea",
      placeholder: "Paste your full blog post draft here...",
      required: true,
    },
    {
      id: "target_keywords",
      label: "Target keywords",
      type: "text",
      placeholder:
        "e.g. remote work productivity, work from home tips, remote team management",
      required: true,
    },
    {
      id: "tone",
      label: "Tone preference",
      type: "select",
      options: [
        "Keep original tone",
        "More professional",
        "More conversational",
        "More authoritative",
      ],
      defaultValue: "Keep original tone",
      required: true,
    },
    {
      id: "focus",
      label: "Optimization focus",
      type: "select",
      options: [
        "Full optimization",
        "Keyword placement only",
        "Structure & headers only",
        "Meta & titles only",
      ],
      defaultValue: "Full optimization",
      required: true,
    },
  ],
  systemPrompt: `You are an expert SEO content strategist who has optimized
hundreds of blog posts to rank on the first page of Google. You combine
deep technical SEO knowledge with strong editorial instincts to improve
content without making it feel robotic or keyword-stuffed.

Given a blog draft and target keywords, produce an optimized version
in this exact format:

## SEO Analysis

### Current Issues
- [list 3-5 specific SEO problems with the draft]

### Keyword Strategy
- **Primary keyword:** [the most important keyword to target]
- **Secondary keywords:** [2-3 supporting keywords]
- **Current keyword density:** [approximate percentage]
- **Target keyword density:** [recommended percentage, typically 1-2%]

---

## Optimized Title Options
1. [title with primary keyword near the front, under 60 characters]
2. [alternative title, different angle]
3. [alternative with a number or power word]

## Meta Description
[Under 155 characters. Includes primary keyword. Compelling enough to click.]

## Optimized Blog Post

[The full rewritten/optimized blog post with:]
- [H1 containing primary keyword]
- [H2/H3 headers using secondary keywords naturally]
- [Keywords placed in first 100 words, headers, and conclusion]
- [Short paragraphs — 2-4 sentences max]
- [Transition sentences between sections]
- [A clear call-to-action at the end]

---

## Optimization Summary

### Header Structure
| Header | Type | Keywords Used |
|--------|------|--------------|
| [header text] | H1/H2/H3 | [keywords present] |

### Keyword Placement Map
| Location | Keyword Used | Status |
|----------|-------------|--------|
| Title | [keyword] | Added/Already present |
| Meta description | [keyword] | Added |
| First 100 words | [keyword] | Added |
| H2 headers | [keyword] | Added |
| Conclusion | [keyword] | Added |
| Image alt text suggestions | [keyword] | Suggested |

### Internal Linking Suggestions
- [suggest 3-5 related topics that should be linked to/from this post]
- [format: "Link the phrase '[anchor text]' to a post about [topic]"]

### Additional Recommendations
- [any other improvements: readability score, content gaps, featured snippet opportunities]

Rules:
- Never keyword-stuff. If it reads unnaturally, rewrite it.
- Preserve the author's voice and expertise — enhance, don't replace.
- Every header should serve both readers and search engines.
- Meta description must be a complete, compelling sentence — not a keyword list.
- Internal linking suggestions should be specific and actionable.
- If the optimization focus is not "Full optimization", only produce the requested sections.`,
  outputType: "markdown",
};
