# Smart Agent Recommendation Wizard: Practical File Map

## Existing files

| File | Why it matters | Modify for wizard? |
|---|---|---|
| `src/main.jsx` | Mounts `BrowserRouter`, `AgentsProvider`, and `App`. Confirms `useAgents()` is available globally. | No. |
| `src/App.jsx` | Central route table and `MainLayout`. Needed only if a dedicated wizard route is chosen. | Prefer no for v1 modal. |
| `src/pages/HomePage.jsx` | Primary discovery page; loads agents, manages search/category filters, renders hero, favorites, recent agents, and grid. Best wizard entry point. | Yes, add entry CTA/modal wiring in implementation. |
| `src/agents/registry.js` | Source of truth for agent loading and normalization. Recommendation engine should consume loaded agents. | No. |
| `src/agents/categories.js` | Static category list. Useful reference, but current UI derives categories from loaded agents. | No. |
| `src/agents/definitions/*.js` | Agent metadata (`id`, `name`, `description`, `category`, `provider`, inputs, prompts). Scoring reads these fields. | Avoid for v1. |
| `src/lib/useAgents.jsx` | Context-based agent loading used by Collections pages. Could provide agents to future route-level wizard. | Usually no; use from components if needed. |
| `src/components/AgentCard.jsx` | Existing full agent card with favorite and collection actions. Result UI can link to agents without changing this. | Avoid unless reusing favorite/collection controls in result cards. |
| `src/components/AgentCardSkeleton.jsx` | Existing loading skeleton for agent grids. Reference for wizard loading state. | No. |
| `src/pages/AgentPage.jsx` | Resolves `/agent/:id`, writes `recentAgents`, renders runner. Result links navigate here. | No. |
| `src/components/AgentRunner.jsx` | Runs selected agents. Recommendations should not invoke or alter runner internals. | No. |
| `src/lib/useFavorites.js` | Favorite persistence and sync pattern. Useful reference only. | No. |
| `src/lib/useCollections.js` | Collection persistence and sync pattern. Useful reference; optional future “save recommendations as collection.” | No for v1. |
| `src/pages/CollectionsPage.jsx` | Existing collections overview; should remain unaffected. | No. |
| `src/pages/CollectionDetailPage.jsx` | Existing collection detail and agent picker integration. | No. |
| `src/components/CollectionPicker.jsx` | Existing add-to-collection modal from agent cards. Optional future reuse. | No for v1. |
| `src/components/collections/CollectionAgentPicker.jsx` | Searchable collection agent picker. Reference for searchable list UI. | No. |
| `src/suites/suitesData.js` | Curated suite/quiz data. Good conceptual reference for question/tag scoring, but not a wizard source of truth. | No. |
| `src/pages/SuitesPage.jsx` | Browse/quiz page and beta custom suite generator. Reference for quiz entry/results patterns. | No. |
| `src/components/SuiteWizard.jsx` | Existing suite quiz/result flow. Useful pattern, but suite-specific logic should not be reused directly. | No. |
| `src/components/Sidebar.jsx` | Main sidebar with Suites, Collections, Scheduler, category accordions. Only needed if adding a wizard nav link. | Prefer no for v1. |
| `src/components/Navbar.jsx` | Top nav and theme/localStorage handling. Only needed if adding top-level wizard route/nav. | Prefer no for v1. |
| `src/components/KeyboardShortcutsModal.jsx` | Modal shell/focus styling reference. | No; reference only. |
| `src/components/CollectionModal.jsx` | Current form modal pattern. Strong reference for wizard modal styling. | No; reference only. |
| `src/components/CustomSelect.jsx` | Shared accessible select used by runner. Could be reused for wizard dropdown steps. | Maybe, only by importing. |
| `src/hooks/useKeyboardShortcuts.js` | Keyboard shortcut helper. Optional for Escape or wizard shortcuts, but modal can use local handlers. | Usually no. |
| `src/lib/useHistory.js` | Run history persistence. Wizard should not write to it. | No. |
| `src/lib/useApiKey.js` | Session API key handling. Rule-based v1 should not need keys. | No. |
| `src/index.css` | Global animations, focus, premium classes. Use existing classes before adding CSS. | Avoid. |
| `tailwind.config.js` | Theme tokens. Use existing colors/classes. | No. |

## Suggested new files

| New file | Purpose |
|---|---|
| `src/lib/agentRecommendation/constants.js` | Wizard options, mappings, scoring weights, result limits. |
| `src/lib/agentRecommendation/scoring.js` | Pure scoring and ranking functions. |
| `src/lib/agentRecommendation/explanations.js` | Convert matched scoring signals into “Why this agent?” reason strings. |
| `src/lib/agentRecommendation/rules.js` | Optional curated mappings from goals/task types/output formats to categories/keywords. |
| `src/hooks/useRecommendationWizard.js` | Wizard step/preference/results state. Could be colocated under `src/components/recommendation/` if preferred. |
| `src/components/recommendation/RecommendationWizardEntry.jsx` | Homepage CTA/card that opens the wizard. |
| `src/components/recommendation/RecommendationWizardModal.jsx` | Modal shell and step orchestration. |
| `src/components/recommendation/RecommendationWizardStep.jsx` | Reusable step renderer for answer cards/free-text/category selections. |
| `src/components/recommendation/RecommendationResults.jsx` | Result list, empty state, reset/back controls. |
| `src/components/recommendation/RecommendationResultCard.jsx` | One ranked recommendation with match percentage, explanation, and open-agent action. |

## Files to avoid touching

- `src/agents/definitions/*.js`: adding per-agent tags would be a large data maintenance task; v1 should score current fields.
- `src/suites/suitesData.js`: suites are a separate curated feature.
- `src/components/AgentRunner.jsx`: runner behavior should remain unchanged.
- `src/lib/useFavorites.js`: wizard should not auto-favorite recommendations.
- `src/lib/useCollections.js`: wizard should not auto-create collections.
- `src/hooks/useWorkflows.js` and `src/lib/supabase.js`: recommendations should not depend on Supabase.
- Battle mode pages under `src/pages/BattleMode*.jsx`: outside main layout and unrelated.
- Build/config files (`vite.config.js`, `postcss.config.js`, `tailwind.config.js`) unless a concrete implementation need appears.

## Assumptions

- The feature will be implemented as a homepage modal/panel first, not a route.
- Agent definitions have enough text metadata for useful first-pass rule scoring.
- No test framework is currently configured; implementation validation will start with build/manual QA unless tests are added in a separate task.
- Existing Collections are real current functionality and should be treated as regression surface, not as planned future work.
