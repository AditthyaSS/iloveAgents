# Smart Agent Recommendation Wizard: Implementation Roadmap

This roadmap is planning only. Do not implement in this documentation refresh.

## Phase 1: Types, constants, and option catalog

- **Files likely affected**
  - New: `src/lib/agentRecommendation/constants.js`
  - New: `src/lib/agentRecommendation/types.js` or JSDoc in constants/scoring files
- **Changes required**
  - Define wizard step IDs, option IDs, labels, category mappings, task/output mappings, and `DEFAULT_RECOMMENDATION_WEIGHTS`.
  - Document `PreferenceModel` and `RecommendationResult` shapes with JSDoc because the project is JavaScript-only.
  - Derive category options from loaded agents in UI rather than hardcoding only `src/agents/categories.js`.
- **Risk level**: Low. Pure constants with no runtime integration.
- **Validation plan**
  - Import constants in a temporary/local check or through build once integrated.
  - Confirm option IDs match scoring rules.
  - Confirm no application source behavior changes until later phases.

## Phase 2: Recommendation engine

- **Files likely affected**
  - New: `src/lib/agentRecommendation/scoring.js`
  - New: `src/lib/agentRecommendation/explanations.js`
  - Optional new: `src/lib/agentRecommendation/rules.js`
- **Changes required**
  - Implement pure `scoreAgent()` and `recommendAgents()` functions.
  - Tokenize free-text input and agent searchable text.
  - Return sorted result objects with scores, match percentages, reasons, and matched signals.
  - Handle empty/invalid agent arrays safely.
- **Risk level**: Low to Medium. Logic is new and isolated, but poor scoring could reduce user trust.
- **Validation plan**
  - Add lightweight unit-style checks if a test runner is introduced; otherwise create deterministic fixtures during implementation review.
  - Manually verify that known goals produce expected top agents, e.g. code review → `code-reviewer`, SEO content → `blog-post-seo-optimizer`, SQL → SQL/database agents.
  - Run `npm run build`.

## Phase 3: Wizard state hook

- **Files likely affected**
  - New: `src/hooks/useRecommendationWizard.js` or `src/components/recommendation/useRecommendationWizard.js`
- **Changes required**
  - Manage modal open/completion state, step index, preferences, validation errors, and computed results.
  - Provide `nextStep`, `previousStep`, `setPreference`, `resetWizard`, and `completeWizard` actions.
  - Keep state local and non-persistent.
- **Risk level**: Low. No app-wide store needed.
- **Validation plan**
  - Validate required steps cannot advance without an answer.
  - Validate reset clears preferences/results.
  - Validate back/next boundaries.

## Phase 4: Wizard UI

- **Files likely affected**
  - New: `src/components/recommendation/RecommendationWizardModal.jsx`
  - New: `src/components/recommendation/RecommendationWizardStep.jsx`
  - New: `src/components/recommendation/RecommendationWizardEntry.jsx`
  - Reference only: `src/components/CollectionModal.jsx`, `src/components/KeyboardShortcutsModal.jsx`, `src/components/CustomSelect.jsx`
- **Changes required**
  - Build modal using existing overlay/panel conventions.
  - Render single-choice, multi-choice, category, and optional free-text steps.
  - Add accessible labels, focus management, keyboard close, progress indicator, back/next controls, and mobile-friendly layout.
  - Keep styling consistent with rounded cards, accent buttons, dark theme tokens, and small text conventions.
- **Risk level**: Medium. Modal focus/accessibility and responsive layout need care.
- **Validation plan**
  - Manually test keyboard navigation, escape/close, and focus return.
  - Test in dark/light themes.
  - Verify mobile width does not overflow.

## Phase 5: Results UI

- **Files likely affected**
  - New: `src/components/recommendation/RecommendationResults.jsx`
  - New: `src/components/recommendation/RecommendationResultCard.jsx`
  - Optional reference/reuse: `src/components/AgentCard.jsx`, `src/components/CollectionPicker.jsx`
- **Changes required**
  - Show ranked result cards with agent name, category, provider, match percentage, and reasons.
  - Link primary action to `/agent/:id`.
  - Provide no-result state and “Adjust answers” / “Start over” actions.
  - Decide whether to include favorite/collection actions in v1. Recommended: skip in v1 unless trivial; existing agent pages/cards already support those actions.
- **Risk level**: Medium. Result metadata must remain understandable and deterministic.
- **Validation plan**
  - Verify all result links navigate to valid agent pages.
  - Verify percentages are bounded 0–100.
  - Verify explanations match actual scoring signals.
  - Verify no-result state appears for intentionally over-constrained preferences if strict filters are added.

## Phase 6: Homepage integration

- **Files likely affected**
  - Modify: `src/pages/HomePage.jsx`
  - Possibly no changes: `src/App.jsx` if modal-on-homepage is chosen
- **Changes required**
  - Add wizard entry CTA near the homepage hero/search area.
  - Pass loaded `agents` and `agentsLoading` to the wizard.
  - Ensure wizard state does not alter `searchQuery`, `selectedCategory`, favorites, recent agents, collections, or run history.
  - Keep existing Battle Mode CTA visible.
- **Risk level**: Medium. `HomePage.jsx` is already large and owns many discovery sections.
- **Validation plan**
  - Verify homepage still renders loading skeletons and full grid.
  - Verify search/category filters still work before and after using the wizard.
  - Verify Favorites and Recently Used sections still hide/show according to existing rules.

## Phase 7: Responsive improvements

- **Files likely affected**
  - New wizard/result component files
  - Possibly modify: `src/index.css` only if reusable animation/focus styles are absolutely needed
- **Changes required**
  - Ensure modal/panel works on narrow screens with scrollable content.
  - Use single-column answer cards on mobile and multi-column layouts at `sm`/`md` where appropriate.
  - Avoid interfering with mobile navbar/sidebar overlays.
- **Risk level**: Medium. Nested fixed overlays can conflict with existing fixed navbar/sidebar.
- **Validation plan**
  - Manually test desktop, tablet, and mobile viewport sizes.
  - Verify modal content remains scrollable and close controls remain reachable.
  - Verify no horizontal overflow.

## Phase 8: Validation and edge cases

- **Files likely affected**
  - Recommendation utility files
  - Wizard/result components
- **Changes required**
  - Handle empty agent list, agent loading state, missing/duplicate categories, unknown provider values, empty descriptions, and corrupted preference state.
  - Ensure result cards tolerate stale IDs by resolving against current `agents` before rendering.
  - Ensure deterministic tie-breaking.
- **Risk level**: Low to Medium.
- **Validation plan**
  - Run `npm run build`.
  - Run `git diff --check`.
  - Manually test no-answer validation and reset flow.

## Phase 9: Manual QA

- **Files likely affected**
  - None beyond feature files; this is validation.
- **Changes required**
  - Execute the checklist in `05-qa-checklist.md`.
  - Record any visual regressions or scoring surprises.
- **Risk level**: Low.
- **Validation plan**
  - Complete manual QA across homepage, search, favorites, suites, collections, and agent runner.
  - Take screenshots if the final implementation creates a perceptible runnable web-app change.

## Files intentionally not changed by the wizard v1

- `src/agents/definitions/*.js`: do not add recommendation metadata to every agent for v1.
- `src/suites/suitesData.js`: do not encode the wizard as a suite.
- `src/components/AgentRunner.jsx`: do not prefill or alter runner behavior.
- `src/lib/useFavorites.js` and `src/lib/useCollections.js`: do not persist wizard recommendations through these hooks automatically.
- `src/App.jsx`: avoid route changes if the modal-on-homepage approach is used.
