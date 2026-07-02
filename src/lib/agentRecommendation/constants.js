import { BarChart3, BookOpen, Briefcase, Code2, Image, PenLine, Search, Workflow } from 'lucide-react'

export const RESULT_LIMIT = 10
export const MIN_CONFIDENT_SCORE = 12

export const DEFAULT_RECOMMENDATION_WEIGHTS = {
  exactCategory: 30,
  goalCategory: 20,
  taskType: 18,
  providerExact: 8,
  providerAny: 4,
  freeTextName: 10,
  freeTextDescription: 5,
  experience: 3,
  urgency: 3,
  capabilityKeyword: 6,
}

export const GOAL_OPTIONS = [
  { id: 'coding-development', label: 'Coding & Development', description: 'Build, debug, review, and document software.', icon: Code2, categories: ['Engineering', 'DevOps', 'Developer Tools', 'Web3'], taskTypes: ['code', 'debug', 'review', 'technical'] },
  { id: 'research-analysis', label: 'Research & Analysis', description: 'Find, compare, summarize, and evaluate information.', icon: Search, categories: ['Research', 'Data Science', 'Business', 'Productivity'], taskTypes: ['research', 'summarize', 'analyze'] },
  { id: 'writing-content', label: 'Writing & Content', description: 'Create and improve copy, posts, scripts, and documents.', icon: PenLine, categories: ['Marketing', 'Productivity', 'Sales'], taskTypes: ['write', 'rewrite', 'generate', 'optimize'] },
  { id: 'automation', label: 'Automation', description: 'Streamline workflows, pipelines, schedules, and operations.', icon: Workflow, categories: ['DevOps', 'Engineering', 'Productivity'], taskTypes: ['automation', 'technical', 'plan'] },
  { id: 'data-analysis', label: 'Data Analysis', description: 'Clean, query, explain, and model data.', icon: BarChart3, categories: ['Data Science', 'Engineering'], taskTypes: ['data', 'analyze', 'technical'] },
  { id: 'image-generation', label: 'Image Generation', description: 'Create image prompts and visual assets.', icon: Image, categories: ['Design'], taskTypes: ['image', 'creative', 'generate'] },
  { id: 'learning', label: 'Learning', description: 'Study, practice, prepare, and understand concepts.', icon: BookOpen, categories: ['Education'], taskTypes: ['explain', 'quiz', 'practice', 'plan'] },
  { id: 'business-productivity', label: 'Business & Productivity', description: 'Plan work, improve operations, and grow outcomes.', icon: Briefcase, categories: ['Business', 'Product', 'Productivity', 'Sales', 'HR', 'Finance', 'Real Estate'], taskTypes: ['strategy', 'plan', 'write', 'analyze'] },
]

export const EXPERIENCE_OPTIONS = [
  { id: 'beginner', label: 'Beginner', description: 'Explain and guide me step by step.' },
  { id: 'intermediate', label: 'Intermediate', description: 'Give practical structure and examples.' },
  { id: 'advanced', label: 'Advanced', description: 'Be concise, technical, and direct.' },
  { id: 'any', label: 'Any level is fine', description: 'Prioritize the best fit overall.' },
]

export const PROVIDER_OPTIONS = [
  { id: 'any', label: 'Any provider', description: 'Recommend across all providers.' },
  { id: 'openai', label: 'OpenAI', description: 'Prefer OpenAI-backed agents.' },
  { id: 'anthropic', label: 'Anthropic', description: 'Prefer Anthropic-backed agents.' },
  { id: 'gemini', label: 'Gemini', description: 'Prefer Gemini-backed agents.' },
]

export const BUDGET_OPTIONS = [
  { id: 'fast', label: 'Fast & lightweight', description: 'Prefer focused agents for direct tasks.' },
  { id: 'balanced', label: 'Balanced', description: 'Balance focus with depth.' },
  { id: 'capable', label: 'Most capable', description: 'Prefer agents suited to detailed work.' },
  { id: 'any', label: 'No preference', description: 'Do not adjust ranking for this.' },
]

export const EXTRA_PREFERENCE_OPTIONS = [
  { id: 'tool-calling', label: 'Tool Calling', capability: 'toolCalling' },
  { id: 'fast-responses', label: 'Fast Responses', capability: 'fastResponses' },
  { id: 'vision-support', label: 'Vision Support', capability: 'visionSupport' },
  { id: 'structured-output', label: 'Structured Output', capability: 'structuredOutput' },
  { id: 'open-source', label: 'Open Source', capability: 'openSource' },
  { id: 'frequently-updated', label: 'Frequently Updated', capability: 'frequentlyUpdated' },
]

export const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'your', 'you', 'into', 'about', 'need', 'needs', 'help', 'agent', 'agents', 'please', 'would'])
