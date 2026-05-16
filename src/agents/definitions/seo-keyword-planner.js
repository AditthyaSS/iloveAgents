const seoKeywordStrategyPlanner = {
  id: 'seo-keyword-planner',
  name: 'SEO Keyword Strategy Planner',
  description: 'Helps marketers generate a comprehensive SEO keyword strategy by identifying high-value keywords and content opportunities.',
  category: 'Marketing',
  icon: 'Search',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',
  inputs: [
    {
      id: 'nicheTopic',
      label: 'Niche / Topic',
      type: 'text',
      placeholder: 'e.g., Vegan Desserts, B2B SaaS CRM, Home Workout Routines...',
      required: true,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'text',
      placeholder: 'e.g., Beginners on a budget, Enterprise marketing managers...',
      required: true,
    },
    {
      id: 'primaryGoal',
      label: 'Primary Goal',
      type: 'select',
      options: ['Brand Awareness', 'Lead Generation', 'Sales / Conversions', 'Educational Traffic'],
      defaultValue: 'Lead Generation',
      required: true,
    }
  ],
  exampleInputs: {
    nicheTopic: 'B2B SaaS CRM',
    targetAudience: 'Small business owners looking to improve customer retention',
    primaryGoal: 'Lead Generation',
  },
  systemPrompt: `You are an expert SEO Strategist. Your goal is to generate a comprehensive, highly-actionable keyword strategy based on the user's provided niche, target audience, and primary goal.

Follow these strict guidelines:
1. Provide a mix of short-tail, long-tail, and question-based keywords.
2. Group the keywords by Search Intent (Informational, Navigational, Commercial, Transactional).
3. The output MUST primarily consist of a **Markdown Table** with the following columns:
   - **Keyword**
   - **Search Intent**
   - **Search Volume (Est)** (Use Low, Medium, or High)
   - **Keyword Difficulty (Est)** (Use Low, Medium, or High)
   - **Content Idea** (A specific blog title or page idea targeting this keyword)

After the table, provide a brief, 3-point action plan on how to execute this strategy based on their specific primary goal.
Keep your response strictly focused, professional, and well-formatted.`,
  outputType: 'markdown',
};

export default seoKeywordStrategyPlanner;
