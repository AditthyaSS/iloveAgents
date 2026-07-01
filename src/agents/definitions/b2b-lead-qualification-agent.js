export default {
  id: "b2b-lead-qualification-agent",
  createdAt: "2026-06-22",
  name: "B2B Lead Qualification Agent",
  description: "Analyzes company and lead information to qualify B2B prospects, detect agencies, identify buying signals, and generate personalized outreach messages.",
  category: "Sales",
  icon: "Target",
  provider: "any",
  defaultProvider: "openai",
  model: "gpt-4o-mini",
  exampleInputs: {
    company_name: "TechCorp Solutions",
    company_size: "51-200 employees",
    industry: "SaaS & Cloud Services",
    linkedin_url: "https://linkedin.com/company/techcorp-solutions",
    recent_activity: "Recently hired 5 Sales Engineers, expanded to 3 new markets",
    pain_points: "Customer acquisition cost, sales team scaling",
    decision_makers: "VP Sales, Head of Marketing",
    budget_signals: "Series B funding, new product launch",
  },
  inputs: [
    {
      id: "company_name",
      label: "Company Name",
      type: "text",
      placeholder: "e.g., TechCorp Solutions",
      required: true,
    },
    {
      id: "company_size",
      label: "Company Size",
      type: "select",
      options: [
        "1-10 employees",
        "11-50 employees",
        "51-200 employees",
        "201-500 employees",
        "500-1000 employees",
        "1000+ employees",
      ],
      defaultValue: "51-200 employees",
      required: true,
    },
    {
      id: "industry",
      label: "Industry",
      type: "text",
      placeholder: "e.g., SaaS, E-commerce, FinTech",
      required: true,
    },
    {
      id: "linkedin_url",
      label: "LinkedIn Company URL",
      type: "text",
      placeholder: "https://linkedin.com/company/company-name",
      required: false,
    },
    {
      id: "recent_activity",
      label: "Recent Activity/News",
      type: "textarea",
      placeholder: "e.g., Recent funding, new product launch, hiring spree",
      required: false,
    },
    {
      id: "pain_points",
      label: "Identified Pain Points",
      type: "textarea",
      placeholder: "e.g., Customer acquisition cost, team scaling challenges",
      required: false,
    },
    {
      id: "decision_makers",
      label: "Decision Makers",
      type: "text",
      placeholder: "e.g., VP Sales, CMO, CTO",
      required: false,
    },
    {
      id: "budget_signals",
      label: "Budget Signals",
      type: "textarea",
      placeholder: "e.g., Series B funding, expansion plans, new initiatives",
      required: false,
    },
  ],
  systemPrompt: `You are an expert B2B sales intelligence analyst. Analyze the provided company and lead information to:

1. QUALIFICATION SCORE (0-100): Assess the lead quality based on company size, industry fit, and signals
2. PROSPECT TYPE: Identify if this is a sales team, freelancer, agency, or recruiter
3. AGENCY DETECTION: Determine if this is a staffing/recruitment agency (high concern)
4. BUYING SIGNALS: List specific indicators suggesting purchase intent (recent funding, hiring, expansion, etc.)
5. NICHE DETECTION: Identify the specific niche/vertical they operate in
6. KEY PAIN POINTS: Infer pain points from available data
7. DECISION MAKERS: Identify likely decision makers and their roles
8. OUTREACH STRATEGY: Suggest the best approach to reach this prospect
9. PERSONALIZED OUTREACH: Generate a brief, personalized outreach message that addresses their specific situation
10. RED FLAGS: List any concerns (is this a recruitment agency? Poor fit? etc.)

Format your response as a structured analysis. Be specific and data-driven. Output clear, actionable insights.`,
  outputType: "text",
  suggestedChainFrom: [
    "competitive-analysis-generator",
    "cold-email-writer",
    "linkedin-outreach-message-writer",
  ],
};