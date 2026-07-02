# Smart Agent Recommendation Wizard: Feature Architecture

## Goal

Help users choose useful agents from the current registry by answering a short guided wizard. The first implementation should be local, deterministic, and rule-based. It should not change agent definitions, routes, suites, favorites, collections, or runner behavior unless the user takes an existing explicit action such as opening/favoriting/collecting an agent.

## Integration principles

- Use the current agent registry from `src/agents/registry.js` / `src/lib/useAgents.jsx` as the only source of agent data.
- Return recommendations as references to existing agent IDs plus scoring metadata.
- Keep wizard state separate from Favorites (`src/lib/useFavorites.js`), Suites (`src/suites/suitesData.js`), Collections (`src/lib/useCollections.js`), and Agent Runner state (`src/components/AgentRunner.jsx`).
- Do not require an API key for v1 recommendations.
- Do not persist wizard answers in v1 unless implementation requirements change.

## Preference model

Recommended in-memory shape:

```js
{
  primaryGoal: 'write-content' | 'build-software' | 'learn' | 'research' | 'sell' | 'design' | 'operate' | 'other',
  categories: ['Engineering', 'Marketing'],
  taskTypes: ['generate', 'review', 'summarize', 'plan', 'analyze', 'debug'],
  outputFormat: 'document' | 'code' | 'checklist' | 'strategy' | 'email' | 'data' | 'any',
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'any',
  urgency: 'quick' | 'thorough' | 'any',
  providerPreference: 'openai' | 'anthropic' | 'gemini' | 'any',
  freeTextGoal: ''
}
```

Notes:

- `categories` should use category strings currently present on loaded agents, not only `src/agents/categories.js`, because the homepage also derives categories from loaded data.
- `freeTextGoal` should be optional in the rule-based version. It can be tokenized against agent name/description/category, but should not call an LLM.
- Keep answer IDs stable and display labels separate so copy can change without changing scoring rules.

## Recommendation result model

Recommended result shape:

```js
{
  agentId: 'code-reviewer',
  score: 84,
  matchPercentage: 92,
  reasons: [
    'Matches your Engineering focus',
    'Strong fit for review/debug tasks',
    'Supports your provider preference'
  ],
  matchedSignals: {
    category: true,
    taskType: ['review', 'debug'],
    provider: true,
    textTerms: ['code', 'review']
  }
}
```

Rules:

- `agentId` is the only durable reference.
- `score` can be raw weighted score.
- `matchPercentage` should be normalized relative to the maximum possible score or top score so users get stable, explainable percentages.
- `reasons` should be short human-readable explanations for “Why this agent?” UI.
- Results should be sorted by score descending, then by exact category/provider matches, then by agent name for deterministic ordering.

## Wizard state model

Use a dedicated hook in implementation, for example `src/hooks/useRecommendationWizard.js` or `src/features/agent-recommendation-wizard/useRecommendationWizard.js` if a feature folder is introduced:

```js
{
  isOpen: false,
  currentStepIndex: 0,
  preferences: {},
  results: [],
  hasCompleted: false,
  errors: {},
  setPreference,
  nextStep,
  previousStep,
  resetWizard,
  completeWizard
}
```

State should remain component-local for v1. A hook is useful for testability and for keeping the UI component thin, but it should not become a global app store.

## Recommendation engine architecture

Create pure utilities that can be tested without React:

- `src/lib/agentRecommendation/constants.js`
  - Wizard option IDs/labels.
  - Scoring weights.
  - Stop words or text token settings if needed.
- `src/lib/agentRecommendation/scoring.js`
  - `scoreAgent(agent, preferences, weights)`.
  - `recommendAgents(agents, preferences, options)`.
  - `normalizeScore(score, maxScore)`.
- `src/lib/agentRecommendation/explanations.js`
  - `buildRecommendationReasons(agent, preferences, matchedSignals)`.
- Optional `src/lib/agentRecommendation/rules.js`
  - Category/task/output/provider mapping tables.

Keep the engine independent of React, localStorage, router, and UI components.

## Rule-based scoring

Suggested signals:

1. **Category match**: strong weight when selected categories include `agent.category`.
2. **Goal-to-category match**: map `primaryGoal` to likely categories, e.g. software → Engineering/DevOps/Developer Tools, content → Marketing/Productivity, learn → Education.
3. **Task type match**: match task verbs against curated terms from agent names/descriptions and optional agent IDs.
4. **Output format match**: map requested output to agent descriptions/known agent IDs, e.g. checklist → checklist/planner/runbook, code → code/API/SQL/regex/unit test.
5. **Provider preference**: if user selects a provider, reward exact provider or `any`; do not exclude otherwise useful agents unless a strict filter is added.
6. **Free-text terms**: tokenize `freeTextGoal` and match against `name`, `description`, `category`, and `id`.
7. **Experience/urgency fit**: light weights only, because current agent definitions do not encode complexity or runtime depth explicitly.

Avoid making recommendations depend on mutable user data such as favorites/history in v1. If used later, keep those as low-weight personalization signals.

## Configurable weights

Recommended default weights in a constants file:

```js
export const DEFAULT_RECOMMENDATION_WEIGHTS = {
  exactCategory: 30,
  goalCategory: 20,
  taskType: 18,
  outputFormat: 12,
  providerExact: 8,
  providerAny: 4,
  freeTextName: 10,
  freeTextDescription: 5,
  experience: 3,
  urgency: 3,
}
```

Expose weights as a parameter to `recommendAgents()` so tests and future experiments can override them without editing scoring code.

## “Why this agent?” explanation generation

Generate explanations from the scoring signals, not from a separate LLM prompt:

- Category: `Matches your selected Engineering category.`
- Goal: `Fits your goal of writing or reviewing code.`
- Task: `Strong match for review and debugging tasks.`
- Output: `Produces checklist-style or structured outputs.`
- Provider: `Works with your selected provider preference.`
- Text: `Matched terms from your goal: SEO, blog, keywords.`

Limit the UI to the top 2–4 reasons per result to keep cards readable. Store all `matchedSignals` internally for debugging/test assertions.

## Components required

Suggested new components, all feature-specific:

- `src/components/recommendation/RecommendationWizardEntry.jsx`
  - CTA button/card for homepage hero/search area.
- `src/components/recommendation/RecommendationWizardModal.jsx`
  - Modal shell and step orchestration, using current modal conventions from `CollectionModal.jsx` / `KeyboardShortcutsModal.jsx`.
- `src/components/recommendation/RecommendationWizardStep.jsx`
  - Reusable step renderer for single-choice/multi-choice/free-text questions.
- `src/components/recommendation/RecommendationResults.jsx`
  - Results section with ranked recommendations, no-result state, reset/back controls.
- `src/components/recommendation/RecommendationResultCard.jsx`
  - Compact agent card showing rank, match percentage, explanation bullets, and actions (`Open agent`, optional existing favorite/collection affordances later).

Do not modify `AgentRunner.jsx` for v1. Do not replace existing `AgentCard.jsx` in the homepage grid.

## Entry point

Best v1 entry point: `src/pages/HomePage.jsx` near the hero CTA and search/filter area.

Recommended UX:

- Add a secondary CTA like “Find my agent” next to or below “Enter Battle Mode.”
- Open a modal wizard on the homepage.
- Show results inside the modal or a homepage inline panel after completion.
- Each result links to `/agent/:id` using current router behavior.

This keeps the wizard discoverable without changing global navigation or route structure.

## Routing vs modal decision

Recommended: **modal/panel on `/` for v1**.

Reasons:

- `HomePage.jsx` already owns agent discovery.
- No route changes are required, respecting the constraint to avoid route behavior changes until implementation.
- The app already uses modal patterns and local UI state.
- Users can complete the wizard and immediately open existing agent pages.

Dedicated route is a future option if the wizard becomes deep-linkable or needs shareable results. If implemented later, add `/recommend` under `MainLayout` in `src/App.jsx` and consider adding a `Navbar`/`Sidebar` link deliberately.

## Integration with homepage

Implementation should:

- Reuse the loaded `agents` state from `HomePage.jsx` or migrate the page to `useAgents()` only if done as a small, safe refactor.
- Disable or show loading state for the wizard CTA while `agentsLoading` is true.
- Pass the current `agents` array into recommendation utilities.
- Keep current search/category state unchanged.
- Keep Favorites, Recently Used, Agent Grid, Recent Runs, and workflow CTA rendering unchanged.

## Separation from existing features

- **Favorites**: users can favorite a recommended agent after opening it or if result cards explicitly reuse favorite controls. The recommendation engine should not mutate favorites.
- **Collections**: result cards may later offer “Add to collection” by reusing `CollectionPicker`, but v1 can simply link to agents.
- **Suites**: do not write to `suitesData.js`; recommendation wizard is a cross-registry discovery flow, not a suite quiz.
- **Agent Runner**: recommendations navigate to runner pages; they do not prefill runner inputs.
- **Workflows/Battle/Scheduler**: no integration for v1.

## Future AI-powered extensibility

The rule-based engine should remain the fallback even if AI recommendations are added later.

Future extension path:

- Add an optional `src/lib/agentRecommendation/aiAdapter.js` that receives sanitized agent summaries and preferences.
- Use `llmAdapter.js` only when the user has provided an API key and explicitly asks for AI-powered matching.
- Return the same `RecommendationResult` model so UI does not care whether results are rule-based or AI-assisted.
- Keep AI explanations grounded in agent IDs and registry data; never recommend IDs that do not exist in `loadAllAgents()`.
- Include timeout/fallback behavior to deterministic scoring.

## Assumptions

- Current agent definitions do not include tags beyond category/name/description/provider/icon, so task matching must use curated mappings plus text matching.
- No automated test framework is configured in `package.json`; validation will initially rely on `npm run build` and manual QA.
- Recommendations should be deterministic and privacy-preserving in v1.
