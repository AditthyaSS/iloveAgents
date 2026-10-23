const jobApplicationTailor = {
  id: 'job-application-tailor',
  name: 'Job Application Tailor',
  description: 'Aligns your resume and cover letter with target job descriptions, generating tailored bullet points, keyword gap analysis, and tailored pitches.',
  category: 'Productivity',
  icon: 'Briefcase',
  provider: 'any',
  defaultProvider: 'gemini',
  model: 'gemini-1.5-flash',
  exampleInputs: {
    resume_text: `Software Engineer at Acme Corp (2022-Present):
- Developed backend microservices using Node.js and PostgreSQL.
- Improved database query performance.
- Mentored 2 junior engineers and conducted code reviews.
- Built internal analytics dashboards.`,
    job_description: `Senior Backend Engineer at TechScale Inc:
Requirements:
- 3+ years experience with distributed systems and high-throughput microservices.
- Strong proficiency with Go or TypeScript/Node.js, Docker, Kubernetes, and PostgreSQL.
- Experience with performance profiling, latency optimization, and automated testing.
- Strong cross-functional communication and technical leadership skills.`,
    custom_instructions: 'Emphasize high scale, latency reductions, and technical mentorship.'
  },
  inputs: [
    {
      id: 'resume_text',
      label: 'Current Resume / Experience Summary',
      type: 'textarea',
      placeholder: 'Paste your current resume content, experience bullets, and skills...',
      required: true
    },
    {
      id: 'job_description',
      label: 'Target Job Description',
      type: 'textarea',
      placeholder: 'Paste the target job posting, responsibilities, and requirements...',
      required: true
    },
    {
      id: 'custom_instructions',
      label: 'Custom Focus or Tone (Optional)',
      type: 'textarea',
      placeholder: 'e.g. Focus on leadership and Kubernetes experience, keep tone confident and executive...',
      required: false
    }
  ],
  systemPrompt: `You are an executive career coach and technical recruiter specializing in ATS optimization and job application alignment.
Analyze the user's current resume against the target job description and provide a tailored application package.

Provide your output using this clean, actionable structure:

## Target Role Alignment Overview
- **Match Score Assessment**: Estimated match percentage (e.g. 85%) and brief strategic appraisal.
- **Top Keyword Matches Found**: Core keywords present in both.
- **Key Missing Keywords / Qualifications**: Essential keywords from the job description missing or underemphasized in the resume.

## Qualifications Match Matrix
| Key Job Requirement | Current Evidence in Profile | Recommended Tailoring Strategy | Status |
| :--- | :--- | :--- | :--- |
| ... | ... | ... | Matched / Partial / Gap |

## Optimized Professional Summary
A compelling 3-4 sentence elevator pitch tailored directly to this job posting.

## Tailored Resume Bullet Points (XYZ Formula)
Rewrite key experience bullets using Google's XYZ formula (*Accomplished [X] as measured by [Y], by doing [Z]*):
- **Original**: "<snippet>"
  - **Tailored**: "<optimized bullet with quantifiable impact & target keywords>"
  - **Rationale**: Explain what changed and why it appeals to the recruiter.

## Skill Gaps & Interview Preparation Notes
- **Identified Gaps**: How to proactively address any missing requirements during an interview.
- **Strategic Talking Points**: 2-3 standout achievements to highlight for this specific hiring manager.

## Tailored Cover Letter Draft
A concise, high-converting 3-paragraph cover letter tailored to the company and role.`
};

export default jobApplicationTailor;
