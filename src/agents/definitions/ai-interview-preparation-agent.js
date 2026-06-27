const aiInterviewPreparationAgent = {
  id: 'ai-interview-preparation-agent',
  name: 'InterviewAI',
  description: 'Simulates real software engineering interviews and provides comprehensive performance feedback.',
  category: 'Engineering',
  icon: 'MonitorPlay',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'name',
      label: 'Candidate Name',
      type: 'text',
      placeholder: 'e.g., John Doe',
      required: true,
    },
    {
      id: 'experienceLevel',
      label: 'Experience Level',
      type: 'select',
      options: ['Intern', 'Junior', 'Mid-Level', 'Senior', 'Staff'],
      defaultValue: 'Junior',
      required: true,
    },
    {
      id: 'difficultyLevel',
      label: 'Difficulty Level',
      type: 'select',
      options: ['Easy', 'Medium', 'Hard'],
      defaultValue: 'Medium',
      required: true,
    },
    {
      id: 'interviewDuration',
      label: 'Interview Duration',
      type: 'select',
      options: ['15 minutes', '30 minutes', '45 minutes', '60 minutes'],
      defaultValue: '45 minutes',
      required: true,
    },
    {
      id: 'targetCompany',
      label: 'Target Company / Industry',
      type: 'text',
      placeholder: 'e.g., Google, FinTech startup',
      required: true,
    },
    {
      id: 'interviewType',
      label: 'Interview Type',
      type: 'select',
      options: ['DSA (Data Structures & Algorithms)', 'System Design', 'Behavioral / HR'],
      defaultValue: 'DSA (Data Structures & Algorithms)',
      required: true,
    },
    {
      id: 'programmingLanguage',
      label: 'Preferred Programming Language',
      type: 'text',
      placeholder: 'e.g., Python, JavaScript, Java',
      required: false,
    },
    {
      id: 'resumeUpload',
      label: 'Resume (Paste text or details)',
      type: 'textarea',
      placeholder: 'Paste resume details to tailor the questions...',
      required: false,
    },
    {
      id: 'weakTopics',
      label: 'Weak Topics',
      type: 'textarea',
      placeholder: 'e.g., Concurrency, Dynamic Programming, SQL...',
      required: false,
    },
    {
      id: 'previousInterviewHistory',
      label: 'Previous Interview History',
      type: 'textarea',
      placeholder: 'Describe any relevant past interview history or challenges...',
      required: false,
    },
    {
      id: 'focusTopics',
      label: 'Topics to Focus On',
      type: 'textarea',
      placeholder: 'e.g., Dynamic Programming, Graphs, Microservices...',
      required: false,
    },
    {
      id: 'jobDescription',
      label: 'Job Description (Optional)',
      type: 'textarea',
      placeholder: 'Paste the job description for a more tailored interview...',
      required: false,
    },
  ],
  systemPrompt: `You are an expert technical interviewer at a top-tier tech company.
Your task is to simulate an interview based on the parameters provided in the user message below, which include:
- Candidate Name
- Experience Level
- Difficulty Level
- Interview Duration
- Target Company / Industry
- Interview Type
- Preferred Programming Language (if provided)
- Resume Details (if provided)
- Weak Topics (if provided)
- Previous Interview History (if provided)
- Focus Topics (if provided)
- Job Description (if provided)

Read each parameter from the user message and use it to tailor the interview simulation.

Tailor your questions, expected approaches, and code examples to the target company's style, candidate's experience level, and difficulty level. If coding is involved, provide snippets or templates in the preferred programming language. Align questions to the responsibilities and tech stack in the job description, and prioritize focus topics and weak topics when generating questions, hints, evaluation criteria, and the learning plan.

To support an interactive, multi-turn interview flow (handled by the system runner or frontend):
1. Act as a live interviewer: ask a single context-aware question at a time and await candidate input.
2. Provide progressive, incremental hints on request or if the candidate stalls.
3. Ask targeted follow-up questions to probe candidate's depth of understanding.
4. Emit explicit realtime feedback markers for the system runner to process turns:
   - Use '[ASK]' when presenting a new question.
   - Use '[HINT]' when providing assistance.
   - Use '[FOLLOWUP]' when asking a follow-up query.
   - Use '[END]' when the simulation is ready to close or when receiving an explicit end command.
5. Only produce the final feedback and evaluation upon an end signal or concluding command.

For single-session runs or when summarizing/concluding:
1. **Interview Simulation:** Present realistic questions with expected approaches and step-by-step hints for the candidate.
2. **Evaluation Framework:** Outline the criteria used to evaluate candidate responses (e.g., Time/Space complexity, Scalability, Communication, Leadership Principles/Core Values).
3. **Mock Feedback & Learning Plan:** Provide a detailed feedback report tailored to the candidate, including a performance scorecard breakdown, weak area analysis, and a personalized improvement roadmap/plan.

Always be encouraging but maintain a high standard. Format your output beautifully in Markdown.`,
  outputType: 'markdown',
};

export default aiInterviewPreparationAgent;
