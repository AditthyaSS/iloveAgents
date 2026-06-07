export const suites = [
  {
    id: 'developer',
    name: 'Developer Suite',
    emoji: '💻',
    description: 'Everything you need to write, review, and ship better code',
    color: '#6366f1',
    agents: [
      'code-reviewer',
      'api-doc-generator',
      'api-error-message-writer',
      'bug-report-generator',
      'changelog-generator',
      'cicd-pipeline-generator',
      'code-complexity-analyzer',
      'code-migration-guide',
      'codebase-entry-guide',
      'cron-expression-builder',
      'database-query-optimizer',
      'dsa-problem-explainer',
      'env-doc-generator',
      'git-branch-naming-generator',
      'github-issue-claim-comment-generator',
      'incident-postmortem-writer',
      'incident-runbook-generator',
      'k8s-manifest-generator',
      'mock-data-generator',
      'pr-description-generator',
      'pr-diff-reviewer',
      'regex-generator',
      'technical-debt-report-generator',
      'unit-test-generator',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What are you working on today?',
          options: [
            { label: 'Writing or reviewing code', tags: ['code-reviewer', 'pr-diff-reviewer', 'unit-test-generator'] },
            { label: 'Writing documentation', tags: ['api-doc-generator', 'env-doc-generator', 'changelog-generator'] },
            { label: 'Fixing bugs or incidents', tags: ['bug-report-generator', 'incident-postmortem-writer', 'incident-runbook-generator'] },
            { label: 'Setting up infrastructure', tags: ['cicd-pipeline-generator', 'k8s-manifest-generator', 'cron-expression-builder'] },
          ],
        },
        {
          id: 'experience',
          question: 'What is your experience level?',
          options: [
            { label: 'Beginner', tags: ['eli5-explainer', 'dsa-problem-explainer', 'codebase-entry-guide'] },
            { label: 'Intermediate', tags: ['code-complexity-analyzer', 'code-migration-guide', 'mock-data-generator'] },
            { label: 'Senior', tags: ['technical-debt-report-generator', 'database-query-optimizer', 'incident-runbook-generator'] },
          ],
        },
      ],
    },
  },
  {
    id: 'data-ai',
    name: 'Data & AI Suite',
    emoji: '📊',
    description: 'Build, analyze, and optimize your data pipelines and ML models',
    color: '#0ea5e9',
    agents: [
      'ai-project-architecture-agent',
      'data-cleaning-plan-generator',
      'data-dictionary-generator',
      'dataset-description-generator',
      'etl-pipeline-troubleshooter',
      'featureEngineeringAdvisor',
      'ml-experiment-autopsy',
      'ml-experiment-report-generator',
      'cloud-cost-estimator',
      'sql-query-generator',
      'sql-query-optimizer',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What are you working on?',
          options: [
            { label: 'Building ML models', tags: ['ml-experiment-autopsy', 'ml-experiment-report-generator', 'featureEngineeringAdvisor'] },
            { label: 'Data pipelines', tags: ['etl-pipeline-troubleshooter', 'data-cleaning-plan-generator', 'data-dictionary-generator'] },
            { label: 'SQL & databases', tags: ['sql-query-generator', 'sql-query-optimizer', 'database-query-optimizer'] },
            { label: 'Cloud & infrastructure', tags: ['cloud-cost-estimator', 'ai-project-architecture-agent'] },
          ],
        },
      ],
    },
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth Suite',
    emoji: '📈',
    description: 'Create content, grow your audience, and drive more traffic',
    color: '#f59e0b',
    agents: [
      'blog-post-seo-optimizer',
      'cold-email-writer',
      'linkedin-post-writer',
      'seo-keyword-planner',
      'social-media-thread-writer',
      'persona-generator',
      'competitive-analysis-generator',
      'tone-rewriter',
    ],
    quiz: {
      questions: [
        {
          id: 'goal',
          question: 'What is your marketing goal?',
          options: [
            { label: 'Drive more traffic', tags: ['blog-post-seo-optimizer', 'seo-keyword-planner'] },
            { label: 'Grow social media', tags: ['linkedin-post-writer', 'social-media-thread-writer'] },
            { label: 'Understand my audience', tags: ['persona-generator', 'competitive-analysis-generator'] },
            { label: 'Write better content', tags: ['tone-rewriter', 'cold-email-writer'] },
          ],
        },
      ],
    },
  },
  {
    id: 'sales',
    name: 'Sales Suite',
    emoji: '💰',
    description: 'Close more deals with better outreach, scripts, and analysis',
    color: '#10b981',
    agents: [
      'sales-discovery-call-script-generator',
      'salesDiscoveryCallGenerator',
      'sales_objection_handler',
      'linkedin-outreach-message-writer',
      'linkedin-outreach-writer',
      'win-loss-analysis-report-generator',
      'salary-negotiation-script',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What do you need help with?',
          options: [
            { label: 'Reaching out to prospects', tags: ['linkedin-outreach-message-writer', 'linkedin-outreach-writer', 'cold-email-writer'] },
            { label: 'Running discovery calls', tags: ['sales-discovery-call-script-generator', 'salesDiscoveryCallGenerator'] },
            { label: 'Handling objections', tags: ['sales_objection_handler', 'win-loss-analysis-report-generator'] },
            { label: 'Negotiating salary', tags: ['salary-negotiation-script'] },
          ],
        },
      ],
    },
  },
  {
    id: 'design-creative',
    name: 'Design & Creative Suite',
    emoji: '🎨',
    description: 'Design better products, generate worlds, and build stunning UIs',
    color: '#ec4899',
    agents: [
      'color-palette-generator',
      'font-pair-generator',
      'typography-pairer',
      'accessibility-audit-generator',
      'game_world_lore_generator',
      'npc-dialogue-lore-generator',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What are you creating?',
          options: [
            { label: 'UI / Product design', tags: ['color-palette-generator', 'font-pair-generator', 'typography-pairer'] },
            { label: 'Accessible experiences', tags: ['accessibility-audit-generator'] },
            { label: 'Game worlds & stories', tags: ['game_world_lore_generator', 'npc-dialogue-lore-generator'] },
          ],
        },
      ],
    },
  },
  {
    id: 'content-writing',
    name: 'Content & Writing Suite',
    emoji: '📝',
    description: 'Write proposals, documents, and content that gets results',
    color: '#8b5cf6',
    agents: [
      'email-reply-writer',
      'meeting-notes-summarizer',
      'pdf-summarizer',
      'proposal-document-generator',
      'grant-proposal-writer',
      'user-story-writer',
      'prd-generator',
      'research-agent',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What do you need to write?',
          options: [
            { label: 'Emails & communication', tags: ['email-reply-writer', 'meeting-notes-summarizer'] },
            { label: 'Proposals & grants', tags: ['proposal-document-generator', 'grant-proposal-writer'] },
            { label: 'Product documents', tags: ['prd-generator', 'user-story-writer'] },
            { label: 'Research & summaries', tags: ['research-agent', 'pdf-summarizer'] },
          ],
        },
      ],
    },
  },
  {
    id: 'learning-career',
    name: 'Learning & Career Suite',
    emoji: '🎓',
    description: 'Learn faster, grow your career, and land your dream job',
    color: '#f97316',
    agents: [
      'aiStudyPlanner',
      'flashcard-generator',
      'eli5-explainer',
      'mnemonic-generator',
      'skill-gap-roadmap-agent',
      'cover-letter-writer',
      'resume-screener',
      'performance-review-writer',
      'path-pilot',
    ],
    quiz: {
      questions: [
        {
          id: 'goal',
          question: 'What is your goal?',
          options: [
            { label: 'Learn something new', tags: ['aiStudyPlanner', 'flashcard-generator', 'eli5-explainer', 'mnemonic-generator'] },
            { label: 'Grow my career', tags: ['skill-gap-roadmap-agent', 'path-pilot', 'performance-review-writer'] },
            { label: 'Get a new job', tags: ['cover-letter-writer', 'resume-screener'] },
          ],
        },
      ],
    },
  },
  {
    id: 'business',
    name: 'Business Suite',
    emoji: '🏢',
    description: 'Run your business smarter with legal, finance, and operations tools',
    color: '#64748b',
    agents: [
      'employee-onboarding-planner',
      'customerSuccessCheckin',
      'invoice-description-generator',
      'privacy-policy-generator',
      'contract-explainer',
      'startup-idea-validator',
      'personal-budget-analyzer',
      'home-buying-checklist',
      'property-description-writer',
      'real-estate-listing-generator',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What do you need today?',
          options: [
            { label: 'Legal & compliance', tags: ['privacy-policy-generator', 'contract-explainer'] },
            { label: 'Finance & budgeting', tags: ['personal-budget-analyzer', 'invoice-description-generator'] },
            { label: 'Team & operations', tags: ['employee-onboarding-planner', 'customerSuccessCheckin'] },
            { label: 'Real estate', tags: ['property-description-writer', 'real-estate-listing-generator', 'home-buying-checklist'] },
            { label: 'Validate my startup', tags: ['startup-idea-validator'] },
          ],
        },
      ],
    },
  },
  {
    id: 'health',
    name: 'Health & Wellness Suite',
    emoji: '🏥',
    description: 'Tools for healthcare professionals and personal wellness',
    color: '#ef4444',
    agents: [
      'health-wellness-plan',
      'medication-interaction-explainer',
      'patient-discharge-summary-writer',
      'patient-preconsultation-note',
    ],
    quiz: {
      questions: [
        {
          id: 'role',
          question: 'Who are you?',
          options: [
            { label: 'Healthcare professional', tags: ['patient-discharge-summary-writer', 'patient-preconsultation-note'] },
            { label: 'Personal wellness', tags: ['health-wellness-plan', 'medication-interaction-explainer'] },
          ],
        },
      ],
    },
  },
  {
    id: 'security-web3',
    name: 'Security & Web3 Suite',
    emoji: '🔐',
    description: 'Audit smart contracts, detect threats, and build on Web3',
    color: '#14b8a6',
    agents: [
      'phishing-email-detector',
      'smart-contract-auditor',
      'solidity-code-reviewer',
      'web3-whitepaper-writer',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What are you working on?',
          options: [
            { label: 'Security threats', tags: ['phishing-email-detector'] },
            { label: 'Smart contracts', tags: ['smart-contract-auditor', 'solidity-code-reviewer'] },
            { label: 'Web3 project', tags: ['web3-whitepaper-writer'] },
          ],
        },
      ],
    },
  },
  {
    id: 'gaming',
    name: 'Gaming & Fun Suite',
    emoji: '🎮',
    description: 'Build game worlds, check compatibility, and explore your future',
    color: '#a855f7',
    agents: [
      'game-system-compatibility-analyser',
      'game_world_lore_generator',
      'npc-dialogue-lore-generator',
      'future-self-letter-agent',
    ],
    quiz: {
      questions: [
        {
          id: 'task',
          question: 'What sounds fun?',
          options: [
            { label: 'Check if my PC can run a game', tags: ['game-system-compatibility-analyser'] },
            { label: 'Build a game world', tags: ['game_world_lore_generator', 'npc-dialogue-lore-generator'] },
            { label: 'Write a letter to my future self', tags: ['future-self-letter-agent'] },
          ],
        },
      ],
    },
  },
]

export default suites
