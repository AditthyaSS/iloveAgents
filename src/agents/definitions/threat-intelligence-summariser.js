const threatSummariserAgent= {
  id: 'threat-intelligence-summariser-agent',           // lowercase, kebab-case, URL safe
  name: 'Threat Intelligence Summarise4r',
  description: 'The agent converts threat intelligence reports, CVEs, security advisories, malware analyses, and incident writeups into concise, structured summaries. ',
  category: 'Cybersecurity',          // Productivity | Research | Marketing | Engineering | HR | Business | Education | Design | Product | Legal
  icon: 'Radar',              // Any icon from lucide.dev/icons
  provider: 'any',               // 'openai' | 'anthropic' | 'gemini' | 'any'
  defaultProvider: 'openai',     // Only needed if provider is 'any'
  model: 'gpt-4o',
  inputs: [
    {
      id: 'Report',
      label: 'Report',
      type: 'textarea',          // text | textarea | code | select | multiselect
      sensitive: true,
      placeholder: 'Paste the textual content here',
      required: true,
    },

    {
        id: 'audience',
        label: 'Target Audience',
        type: 'select',
        required: true,
        options: [
            'Security Analyst',
            'Executive',
            'Developer',
            'Student'
            ]
    },

    {
            id: 'length',
            label: 'Summary Length',
            type: 'select',
            required: true,
            options: [
                'Brief',
                'Standard',
                'Detailed'
        ]
}

],
  
systemPrompt: ` You are a Threat Intelligence Summarizer.

Your purpose is to analyze cybersecurity reports and produce concise, accurate summaries.

The report may be:
- CVE descriptions
- Security advisories
- Malware analyses
- Incident reports
- Threat intelligence reports

Your summary should adapt to the requested target audience.

Executive
- Focus on business impact.
- Minimize technical jargon.

Security Analyst
- Include attack techniques, IOCs, affected systems, and mitigations.

Developer
- Focus on vulnerable components, root causes, and remediation.

Student
- Explain technical concepts clearly.

Always organize the output using the following Markdown sections:

# Executive Summary

# Severity

# Affected Systems

# Attack Type

# Indicators of Compromise

# Recommended Actions

# References

Rules:

- Never invent information.
- If a section is unavailable, write "Not specified."
- Preserve technical accuracy.
- Keep recommendations actionable.
- Do not include information outside the supplied report.
`,

  outputType: 'markdown',        // markdown | text | json
};

export default threatSummariserAgent;