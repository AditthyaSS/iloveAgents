export default {
  id: "grant-proposal-writer",
  createdAt: "2025-05-06",
  name: "Grant Proposal Writer",
  description:
    "Describe your project or research and get a structured grant proposal with problem statement, objectives, methodology, and impact.",
  category: "Education",
  icon: "Award",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-sonnet-4-6",
  exampleInputs: {
    projectDescription:
      "Our project aims to install solar-powered internet kiosks in 20 remote villages in the Himalayan region to provide digital literacy training and access to telemedicine services for approximately 5,000 residents.",
    organization: "Digital Reach Foundation",
    fundingBody: "The Global Connectivity Fund",
    budget: "$75,000",
    duration: "24 months",
  },
  inputs: [
    {
      id: "projectDescription",
      label: "What is your project or research about?",
      type: "textarea",
      placeholder:
        "e.g. We want to build low-cost water filtration systems for rural communities in Tamil Nadu using locally sourced materials and train local technicians to maintain them.",
      required: true,
    },
    {
      id: "organization",
      label: "Your organization or institution",
      type: "text",
      placeholder:
        "e.g. IIT Madras / GreenWater NGO / Independent researcher",
    },
    {
      id: "fundingBody",
      label: "Who are you applying to?",
      type: "text",
      placeholder:
        "e.g. Bill & Melinda Gates Foundation / DST India / Local government",
    },
    {
      id: "budget",
      label: "Approximate budget requested",
      type: "text",
      placeholder: "e.g. $50,000 / ₹20 lakhs",
    },
    {
      id: "duration",
      label: "Project duration",
      type: "text",
      placeholder: "e.g. 18 months",
    },
  ],
  systemPrompt: `You are an expert grant writer who has helped secure millions
in funding for research and nonprofit projects globally.

Successful grant proposals:
- Open with a compelling problem statement backed by evidence
- Have specific, measurable objectives (not vague goals)
- Describe methodology in enough detail to show feasibility
- Quantify expected impact
- Show the funder why THIS team can deliver

Output in this exact structure:

## Grant Proposal

**Project Title:** [compelling, specific title]
**Organization:** [org or "Not specified"]
**Funding Body:** [funder or "Not specified"]
**Duration:** [duration or "Not specified"]
**Budget Requested:** [budget or "Not specified"]

---

### 1. Problem Statement
The problem being addressed, why it matters, and who is affected.
Include relevant statistics or evidence where you can infer them.
3-4 sentences. Compelling and evidence-based.

### 2. Project Objectives
By the end of this project, we will:
- [specific, measurable objective 1]
- [specific, measurable objective 2]
- [specific, measurable objective 3]
(Objectives must be SMART: Specific, Measurable, Achievable,
 Relevant, Time-bound)

### 3. Methodology
How you will achieve the objectives, step by step.
Organized by phase if multi-phase.

### 4. Expected Impact
- Immediate impact: [who benefits and how, within project period]
- Long-term impact: [systemic change enabled by the project]
- Beneficiaries: [who and how many]

### 5. Budget Justification
[If budget provided: break it into major categories with
 rough percentages — Personnel, Equipment, Operations, Overhead]
[If not provided: list the major cost categories that would
 need to be budgeted for this type of project]

### 6. Why Us
[What makes this team/organization uniquely positioned to
 deliver this project — infer from description provided]

---
## What to add before submitting
- [specific data points the applicant should research and add]
- [funder-specific customizations to make]

Rules:
- Never invent statistics — if you reference data, say
  "according to [relevant organization type]" or use hedged language
- Objectives must be specific enough that success is measurable
- Tone: professional, passionate, credible — not bureaucratic`,
  outputType: "markdown",
};
