export default {
  id: "ai-quiz-generator",
  createdAt: "2025-06-07",
  name: "AI Quiz Generator",
  description:
    "Generate customized quizzes from any topic, text, or subject area. Choose question type, difficulty, and number of questions. Includes answer key and score guidelines.",
  category: "Education",
  icon: "ClipboardList",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",
  exampleInputs: {
    topic: "Photosynthesis",
    sourceContent: "",
    difficulty: "Intermediate",
    questionCount: "5",
    questionType: "MCQ",
    targetAudience: "High School Students",
    subjectArea: "Biology",
  },
  inputs: [
    {
      id: "topic",
      label: "Quiz Topic",
      type: "text",
      placeholder: "e.g. Photosynthesis, World War 2, React Hooks",
      required: true,
    },
    {
      id: "sourceContent",
      label: "Source Content (Optional)",
      type: "textarea",
      placeholder: "Paste any notes, paragraphs, or text to base the quiz on",
      required: false,
    },
    {
      id: "difficulty",
      label: "Difficulty Level",
      type: "select",
      options: ["Beginner", "Intermediate", "Advanced", "Mixed"],
      defaultValue: "Mixed",
      required: true,
    },
    {
      id: "questionCount",
      label: "Number of Questions",
      type: "select",
      options: ["5", "10", "15", "20"],
      defaultValue: "10",
      required: true,
    },
    {
      id: "questionType",
      label: "Question Type",
      type: "select",
      options: ["MCQ", "True/False", "Short Answer", "Mixed"],
      defaultValue: "MCQ",
      required: true,
    },
    {
      id: "targetAudience",
      label: "Target Audience",
      type: "text",
      placeholder: "e.g. High School Students, College Students, Professionals",
      required: true,
    },
    {
      id: "subjectArea",
      label: "Subject Area",
      type: "text",
      placeholder: "e.g. Biology, History, Programming",
      required: true,
    },
  ],
  systemPrompt: `You are an expert educator who creates high-quality quizzes for knowledge assessment.

Generate a quiz based on the topic and settings provided.

Output format:

# [Quiz Title]

**Subject:** [subject area] | **Difficulty:** [difficulty] | **Audience:** [target audience]

---

## Questions

For MCQ:
**Q1.** [Question]
- A) [option]
- B) [option]
- C) [option]
- D) [option]

For True/False:
**Q1.** [Statement]
- A) True
- B) False

For Short Answer:
**Q1.** [Question]
*(Short answer expected)*

[Repeat for all questions]

---

## Answer Key

| # | Answer | Explanation |
|---|--------|-------------|
| 1 | [answer] | [brief reason] |
[repeat for all]

---

## Difficulty Summary
- Beginner questions: [count]
- Intermediate questions: [count]
- Advanced questions: [count]

## Score Guidelines
- 90-100%: Excellent
- 70-89%: Good
- 50-69%: Needs Review
- Below 50%: Study more before retrying

## Confidence Level
[Brief note on how well this quiz covers the topic]

Rules:
- Only generate the exact number of questions requested
- Match difficulty to the audience level
- If source content is provided, base questions strictly on it
- Every question must have one clear correct answer
- Explanations in the answer key should teach, not just confirm`,
  outputType: "markdown",
};
