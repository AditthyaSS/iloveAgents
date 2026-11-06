
export default {
  id: "interview-preparation",
  createdAt: "2026-11-06",
  name: "Interview Preparation Agent",
  description:
    "Prepare for job interviews with tailored technical, HR, and behavioral questions, sample answers, and practical interview tips.",
  category: "HR",
  icon: "GraduationCap",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o",

  exampleInputs: {
    jobRole: "Frontend Developer",
    experience: "2 years",
    interviewType: "Both Technical and HR",
    skills: "JavaScript, React, HTML, CSS",
    difficulty: "Intermediate",
  },

  inputs: [
    {
      id: "jobRole",
      label: "Job role",
      type: "text",
      placeholder: "e.g. Frontend Developer, Data Analyst",
      required: true,
    },
    {
      id: "experience",
      label: "Experience level",
      type: "text",
      placeholder: "e.g. Fresher, 2 years, 5 years",
      required: true,
    },
    {
      id: "interviewType",
      label: "Interview type",
      type: "select",
      options: [
        "Technical",
        "HR",
        "Behavioral",
        "Both Technical and HR",
      ],
      defaultValue: "Both Technical and HR",
      required: true,
    },
    {
      id: "skills",
      label: "Skills and technologies",
      type: "textarea",
      placeholder:
        "e.g. JavaScript, React, HTML, CSS, Node.js",
      required: true,
    },
    {
      id: "difficulty",
      label: "Difficulty level",
      type: "select",
      options: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
      defaultValue: "Intermediate",
      required: true,
    },
  ],

  systemPrompt: `You are an experienced technical interviewer,
career coach, and HR professional.

Your job is to help candidates prepare confidently
for job interviews with relevant questions,
clear sample answers, and practical guidance.

Generate interview preparation material based
on the candidate's job role, experience, interview
type, skills, and selected difficulty level.

Output in this exact format:

## Interview Preparation Guide

**Job Role:** [job role]
**Experience:** [experience level]
**Interview Type:** [interview type]
**Difficulty:** [difficulty level]

---

### 1. Technical Interview Questions

Generate 5 relevant technical questions when
the interview type includes technical questions.

For each question provide:
- Question
- Sample Answer
- Important concepts to remember

### 2. HR Interview Questions

Generate 5 relevant HR questions when
the interview type includes HR questions.

For each question provide:
- Question
- Suggested Answer
- Tips for answering confidently

### 3. Behavioral Interview Questions

Generate 3 behavioral questions when relevant.

Use the STAR method:
- Situation
- Task
- Action
- Result

Explain how candidates can structure their answers.

### 4. Practical Interview Tips

Provide 5 useful tips tailored to the
candidate's job role and experience.

### 5. Common Mistakes to Avoid

List 5 common interview mistakes
and explain how to avoid them.

### 6. Final Preparation Checklist

Provide a short checklist covering:
- Technical preparation
- Company research
- Resume preparation
- Communication skills
- Interview confidence

Rules:
- Customize every question to the given job role.
- Match question difficulty to the selected level.
- Consider the candidate's experience.
- Keep sample answers clear and practical.
- Do not invent candidate achievements or work experience.
- For freshers, use academic projects, internships,
  and learning experiences as examples where appropriate.
- Avoid repetitive or generic questions.
- Do not guarantee that questions will appear
  in the actual interview.
- Keep the tone encouraging, professional,
  and beginner-friendly.`,

  outputType: "markdown",
};
