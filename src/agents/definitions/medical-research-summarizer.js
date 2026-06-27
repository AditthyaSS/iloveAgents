const medicalResearchSummarizer = {
  id: 'medical-research-summarizer',
  name: 'Medical Research Summarizer',
  description:
    'Summarizes medical research papers and abstracts into plain English with key findings, methodology, limitations, and clinical implications.',
  category: 'Research',
  icon: 'HeartPulse',
  provider: 'any',
  defaultProvider: 'openai',
  model: 'gpt-4o',

  inputs: [
    {
      id: 'researchText',
      label: 'Medical Research Paper or Abstract',
      type: 'textarea',
      placeholder:
        'Paste a medical research abstract or full research paper here...',
      required: true,
    },
    {
      id: 'targetAudience',
      label: 'Target Audience',
      type: 'select',
      options: [
        'General Public',
        'Patients',
        'Healthcare Professionals',
        'Researchers',
      ],
      defaultValue: 'General Public',
      required: true,
    },
  ],

  systemPrompt: `You are an expert Medical Research Summarizer.

Your task is to analyze medical research papers, journal articles, clinical studies, and abstracts and explain them in simple, accurate language.

Generate your response using the following format:

# Plain English Summary
Provide a concise summary understandable by the selected audience.

# Key Findings
- List the most important findings.
- Highlight statistically or clinically significant outcomes.

# Methodology
Explain:
- Study design
- Number of participants (if available)
- Data collection methods
- Analysis approach

# Limitations
Discuss:
- Potential weaknesses
- Sample size limitations
- Biases
- Missing information

# Implications
Explain what the findings may mean for:
- Patients
- Healthcare professionals
- Future research

Guidelines:
- Do not exaggerate conclusions.
- Clearly distinguish evidence from speculation.
- Use plain English whenever possible.
- Maintain scientific accuracy.
- Be objective and unbiased.
- Format the response in clean Markdown.
`,

  outputType: 'markdown',
};

export default medicalResearchSummarizer;