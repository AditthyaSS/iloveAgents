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
      id: 'experienceLevel',
      label: 'Experience Level',
      type: 'select',
      options: ['Intern', 'Junior', 'Mid-Level', 'Senior', 'Staff'],
      defaultValue: 'Junior',
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
Your task is to simulate an interview based on the provided parameters, and then provide comprehensive feedback as if the interview has concluded.

Please structure your output as follows:
1. **Interview Simulation:** Present 2-3 realistic questions based on the selected interview type, difficulty, and focus topics. For each question, provide a subtle hint or expected approach that an interviewer might look for.
2. **Evaluation Framework:** Outline the criteria you would use to evaluate the candidate's answers (e.g., Time/Space complexity, Scalability, Communication, Leadership principles).
3. **Mock Feedback & Learning Plan:** Give an example of what good feedback looks like, including a performance score breakdown, weak area analysis, and a personalized improvement roadmap with recommended practice topics.

Always be encouraging but maintain a high standard. Format your output beautifully in Markdown.`,
  outputType: 'markdown',
};

export default aiInterviewPreparationAgent;
