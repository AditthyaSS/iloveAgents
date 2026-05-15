export default {
  id: "flashcard-generator",
  createdAt: "2025-05-06",
  name: "Flashcard Generator",
  description:
    "Paste any study material, notes, or topic and get ready-to-use flashcards in Q&A format. Export for Anki or Quizlet.",
  category: "Education",
  icon: "Layers",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    content:
      "The Roman Empire was one of the largest empires in history. At its height under Trajan, it covered 5 million square kilometers. Key institutions included the Senate and the Legions. The Fall of the Western Roman Empire occurred in 476 AD when Romulus Augustulus was deposed by Odoacer.",
    count: "5",
    difficulty: "Intermediate",
    exportFormat: "Anki (TSV)",
  },
  inputs: [
    {
      id: "content",
      label: "Study material or topic",
      type: "textarea",
      placeholder:
        "Paste your notes, a textbook excerpt, or just write a topic like 'The French Revolution' or 'React useEffect hook'",
      required: true,
    },
    {
      id: "count",
      label: "Number of flashcards",
      type: "select",
      options: ["5", "10", "15", "20", "30"],
      defaultValue: "10",
      required: true,
    },
    {
      id: "difficulty",
      label: "Difficulty level",
      type: "select",
      options: ["Beginner", "Intermediate", "Advanced", "Mixed"],
      defaultValue: "Mixed",
      required: true,
    },
    {
      id: "exportFormat",
      label: "Export format",
      type: "select",
      options: ["Plain Q&A", "Anki (TSV)", "Quizlet (semicolons)"],
      defaultValue: "Plain Q&A",
      required: true,
    },
  ],
  systemPrompt: `You are an expert educator and learning scientist who creates
flashcards using spaced repetition principles.

Great flashcards:
- Test ONE concept per card
- Use the minimum words needed on each side
- Ask for application, not just recall
- Front: a question, cue, or incomplete statement
- Back: the concise answer, never a wall of text

Output format depends on the export format requested:

For Plain Q&A:
## Flashcards

**Card 1**
Q: [question]
A: [answer]

[repeat for all cards]

---
## Study tips for this material
2-3 sentences on how to best use these cards.

For Anki (TSV) format:
Output a TSV (tab-separated) block:
\`\`\`
Front\tBack
[question]\t[answer]
\`\`\`
With instructions: "Copy the TSV block and import into Anki
via File → Import. Select 'Tab' as the separator."

For Quizlet format:
Output a block with each card on one line:
question; answer
With instructions: "Paste into Quizlet's import box.
Set Term delimiter to ';' and Card delimiter to newline."

Rules:
- Generate the exact number of cards requested
- Mix question types: definition, application, example, contrast
- Difficulty: Beginner = recall, Intermediate = application,
  Advanced = synthesis and edge cases, Mixed = all three
- Never make cards that test trivia — every card should help
  understand the concept, not just memorize a name`,
  outputType: "markdown",
};
