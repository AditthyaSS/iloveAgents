const aiStudyPlanner = {
  id: 'ai-study-planner',

  name: 'AI Study Planner',

  description:
    'Creates personalized study schedules, revision plans, and smart learning recommendations based on exams, subjects, and study goals.',

  category: 'Productivity',

  icon: 'Calendar',

  provider: 'any',

  defaultProvider: 'gemini',

  model: 'gemini-1.5-pro',

  inputs: [
    {
      id: 'subjects',
      label: 'Subjects or Courses',
      type: 'textarea',
      placeholder: 'e.g. Maths, English, Science',
      required: true,
    },

    {
      id: 'exam_dates',
      label: 'Exam Dates',
      type: 'textarea',
      placeholder:
        'e.g.\nMaths - 10-11-2026\nEnglish - 11-11-2026',
      required: true,
    },

    {
      id: 'study_hours',
      label: 'Daily Available Study Hours',
      type: 'text',
      placeholder: 'e.g. 4 hours per day',
      required: true,
    },

    {
      id: 'weak_topics',
      label: 'Weak Subjects or Topics',
      type: 'textarea',
      placeholder: 'e.g. Algebra, Grammar, Trigonometry',
      required: true,
    },

    {
      id: 'preferred_study_time',
      label: 'Preferred Study Time',
      type: 'select',
      required: true,
      options: ['Morning', 'Evening', 'Night'],
    },

    {
      id: 'target_score',
      label: 'Study Goal or Target Score',
      type: 'text',
      placeholder: 'e.g. 90%, Top Rank, Pass Exam',
      required: true,
    },
  ],

  systemPrompt: `
You are an intelligent AI Study Planner assistant.

Your task is to generate a personalized study plan based on:
- Subjects
- Exam dates
- Available study hours
- Weak topics
- Preferred study timing
- Target goals

Requirements:
- Prioritize weak subjects more frequently.
- Create balanced daily schedules.
- Include revision sessions before exams.
- Add smart productivity suggestions.
- Include short breaks and realistic study timing.
- Motivate the user positively.
- Do NOT calculate remaining days or countdowns.
- Only mention the exam dates provided by the user.
- Format the daily timetable as a clean markdown table.

Output Format:

# Personalized Study Plan

## Upcoming Exams
- Mention each subject with its exam date

## Daily Study Timetable

Create the timetable in markdown table format using:

| Day | Subject | Time | Focus Area |

Include realistic study timings and balanced scheduling.

## Weak Subject Focus
- Extra focus recommendations for weaker subjects

## Revision Strategy
- Suggested revision timeline before exams

## Productivity Tips
- Short actionable study suggestions

## Motivation
- A short motivational message for the student
`,

  outputType: 'markdown',
};

export default aiStudyPlanner;