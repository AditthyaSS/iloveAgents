const jobApplicationTailor = {
  id: 'job-application-tailor',
  name: 'Job Application Tailor',
  description: 'Paste your resume and a job posting to get tailored bullets, a match table, and a cover draft.',
  category: 'Productivity',
  icon: 'Briefcase',
  provider: 'gemini',
  model: 'gemini-2.5-flash',
  inputs: [
    {
      id: 'resume',
      label: 'Current Resume',
      type: 'textarea',
      placeholder: 'Paste your current resume text...',
      required: true,
    },
    {
      id: 'job_description',
      label: 'Job Description',
      type: 'textarea',
      placeholder: 'Paste the full posting or role requirements...',
      required: true,
    },
    {
      id: 'instructions',
      label: 'Custom Instructions (optional)',
      type: 'text',
      placeholder: 'e.g. emphasize leadership, keep a formal tone',
      required: false,
    },
  ],
  systemPrompt: `You are an expert career coach who tailors applications without inventing experience.

Inputs:
- Resume: {{resume}}
- Posting: {{job_description}}
- Notes: {{instructions}}

Rules:
- Keep every fact from the resume. Rephrase for relevance, never add employers, titles or metrics.
- Mirror posting keywords where the experience genuinely supports them.

Return:

# Tailored Resume Bullets
- Rewrite the strongest 6-10 bullets with posting language woven in.

# Cover Letter Draft
- A concise draft addressed to the hiring team, aligned to the posting.

# Requirement Match Table
| Requirement | Match | Evidence or Gap |
|---|---|---|
List each major posting requirement with Full, Partial or Missing and one line of proof or what to add.

# Suggested Improvements
- 3-5 concrete edits ordered by impact.`,
  outputType: 'markdown',
};

export default jobApplicationTailor;
