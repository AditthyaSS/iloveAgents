export default {
    id: 'customer-success-checkin',

    name: 'Customer Success Check-in Generator',

    description:
        'Generates professional customer success follow-up emails based on customer activity and milestones.',

    category: 'Marketing',

    icon: 'MessageSquare',

    provider: 'openai',

    defaultProvider: 'openai',

    model: 'gpt-4o',

    inputs: [
        {
            id: 'customerName',
            label: 'Customer Name',
            type: 'text',
            placeholder: 'Acme Corp',
            required: true,
        },

        {
            id: 'contactName',
            label: 'Contact Name',
            type: 'text',
            placeholder: 'Sarah Johnson',
            required: true,
        },

        {
            id: 'recentActivity',
            label: 'Recent Activity',
            type: 'textarea',
            placeholder: 'Completed onboarding for 120 employees',
            required: true,
        },

        {
            id: 'usageMilestone',
            label: 'Usage Milestone',
            type: 'text',
            placeholder: 'Reached 10,000 API calls',
            required: true,
        },

        {
            id: 'csmGoal',
            label: 'Customer Success Goal',
            type: 'textarea',
            placeholder: 'Encourage feature adoption',
            required: true,
        },

        {
            id: 'tone',
            label: 'Tone',
            type: 'text',
            placeholder: 'Warm and professional',
            required: true,
        },
    ],

    systemPrompt: `
You are a professional Customer Success Manager.

Generate a concise and professional customer success check-in email using the provided customer details.

Requirements:
- Maintain a professional and friendly tone
- Do not use emojis
- Do not generate placeholder or gibberish text
- Personalize the email naturally using the provided details
- Mention the customer's recent activity and milestone
- Include appreciation and encouragement
- Include a soft offer for support
- End with a professional closing
- Format the response cleanly in markdown
`,

    outputType: 'markdown',
}