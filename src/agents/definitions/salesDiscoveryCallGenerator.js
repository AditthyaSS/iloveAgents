const salesDiscoveryCallGenerator = {
  id: 'sales-discovery-call-generator',

  name: 'Sales Discovery Call Script Generator',

  description:
    'Generates a complete discovery call script for sales reps with opening, qualification questions, pain point exploration, objection handling, and next steps — tailored to your product, industry, and ideal customer profile.',

  category: 'Sales',

  icon: 'Phone',

  provider: 'any',

  defaultProvider: 'gemini',

  model: 'gemini-1.5-pro',

  inputs: [
    {
      id: 'product_name',
      label: 'Product / Service Name',
      type: 'text',
      placeholder: 'e.g. Salesforce CRM, HubSpot, Slack',
      required: true,
    },
    {
      id: 'product_description',
      label: 'What does your product do?',
      type: 'textarea',
      placeholder: 'e.g. A CRM platform that helps sales teams track leads, manage pipelines, and close deals faster.',
      required: true,
    },
    {
      id: 'target_industry',
      label: 'Target Industry',
      type: 'text',
      placeholder: 'e.g. SaaS, Healthcare, E-commerce, Finance',
      required: true,
    },
    {
      id: 'ideal_customer_profile',
      label: 'Ideal Customer Profile (ICP)',
      type: 'textarea',
      placeholder: 'e.g. VP of Sales at a 50-200 person B2B SaaS company struggling with pipeline visibility',
      required: true,
    },
    {
      id: 'call_duration',
      label: 'Call Duration',
      type: 'select',
      required: true,
      options: ['15 minutes', '30 minutes', '45 minutes', '60 minutes'],
    },
    {
      id: 'sales_rep_experience',
      label: 'Sales Rep Experience Level',
      type: 'select',
      required: true,
      options: ['New (< 1 year)', 'Intermediate (1-3 years)', 'Senior (3+ years)'],
    },
    {
      id: 'key_pain_points',
      label: 'Known Pain Points to Explore',
      type: 'textarea',
      placeholder: 'e.g. Manual reporting, missed follow-ups, poor lead tracking',
      required: false,
    },
    {
      id: 'competitors',
      label: 'Main Competitors (optional)',
      type: 'text',
      placeholder: 'e.g. HubSpot, Pipedrive, Zoho CRM',
      required: false,
    },
  ],

  systemPrompt: `
You are an expert sales coach and discovery call strategist.

Your task is to generate a complete, professional discovery call script tailored to:
- The product/service
- The target industry
- The ideal customer profile (ICP)
- The call duration
- The sales rep's experience level

Requirements:
- Make the script conversational and natural, not robotic
- Include exact suggested phrases and questions the rep can use word-for-word
- Tailor qualification questions to the specific industry and ICP
- Include transition phrases between sections
- Add [TIMING] markers showing how many minutes to spend on each section
- Add [REP NOTE] tips for the sales rep throughout
- Cover objection handling relevant to the product and industry
- End with clear next steps and call-to-action
- Format everything in clean, readable markdown

Output Format:

# Discovery Call Script
## Product: {product_name} | Duration: {call_duration}

---

## 📋 Pre-Call Checklist
- List 3-5 things to prepare before the call

---

## 🎯 Call Objectives
- List the 3 main goals of this discovery call

---

## 1. Opening & Rapport Building [X min]
**Script:**
> "Exact words to say..."

[REP NOTE: tip for the rep]

---

## 2. Agenda Setting [X min]
**Script:**
> "Exact words to say..."

---

## 3. Discovery & Qualification Questions [X min]

### Company & Role Questions
- Question 1?
- Question 2?

### Current Situation Questions
- Question 1?
- Question 2?

### Pain Point Exploration
- Question 1?
- Question 2?

### Budget & Timeline (BANT)
- Question 1?
- Question 2?

[REP NOTE: Listen more than you talk in this section]

---

## 4. Product Positioning [X min]
**Script:**
> "Based on what you've shared... [connect pain points to product value]"

---

## 5. Objection Handling

| Common Objection | Suggested Response |
|---|---|
| "We already have a solution" | Response... |
| "It's not the right time" | Response... |
| "It's too expensive" | Response... |

---

## 6. Next Steps & Close [X min]
**Script:**
> "Exact closing words..."

**Call-to-Action Options:**
- Option 1
- Option 2

---

## 📝 Post-Call Actions
- List 3-4 things to do immediately after the call

---

## 💡 Power Tips for This Call
- 3-5 advanced tips specific to this industry/ICP
`,

  outputType: 'markdown',
};

export default salesDiscoveryCallGenerator;