# Smart Agent Recommendation Wizard: Manual QA Checklist

Use this checklist after the feature is implemented. It also defines expected behavior for implementation planning.

## Wizard entry

- [ ] Homepage loads normally at `/` with existing hero, Battle Mode CTA, stats, favorites/recent sections, search/filter, and agent grid.
- [ ] Wizard entry CTA is visible near the discovery area and does not replace existing primary navigation.
- [ ] Wizard CTA is disabled or shows a loading state while agents are loading.
- [ ] Opening the wizard does not clear homepage search/category state.
- [ ] Closing the wizard returns focus to the entry CTA where practical.

## Wizard navigation

- [ ] First step renders with clear title, helper copy, and answer options.
- [ ] Required steps prevent advancing until an answer is selected.
- [ ] Multi-select steps allow selecting and deselecting multiple answers.
- [ ] Back button returns to the previous step without losing answers.
- [ ] Next/Finish buttons update correctly on each step.
- [ ] Escape/click-close behavior matches existing modal conventions.
- [ ] Reset/start-over clears answers and results.
- [ ] Keyboard navigation is usable through answer cards and controls.

## Recommendation ranking

- [ ] Engineering/code-review preferences rank code/review/test agents near the top.
- [ ] Marketing/content/SEO preferences rank marketing/content agents near the top.
- [ ] SQL/data preferences rank SQL/database/data agents near the top.
- [ ] Design preferences rank design/accessibility/font/color agents near the top.
- [ ] Provider preference rewards matching providers or `any` without hiding all other useful agents unless strict filtering is explicitly implemented.
- [ ] Ties sort deterministically and do not reorder randomly between runs with the same answers.

## Match percentages

- [ ] Every displayed match percentage is between 0% and 100%.
- [ ] Top result has the highest percentage.
- [ ] Percentages are stable for the same answers and registry data.
- [ ] Low-confidence matches do not display misleadingly high percentages.
- [ ] No `NaN%`, negative values, or blank percentages appear.

## Explanation generation

- [ ] Each recommended agent shows 2–4 concise “Why this agent?” reasons.
- [ ] Reasons correspond to actual selected preferences or matched free-text terms.
- [ ] Category/provider/task reasons use human-readable labels, not internal IDs only.
- [ ] Explanations remain readable on mobile.
- [ ] Explanations never mention an agent capability that is not supported by its name/description/category/provider or configured rules.

## No-result and loading states

- [ ] Empty agent list or registry loading state is handled gracefully.
- [ ] If strict filters produce no result, a helpful no-result state appears with actions to adjust answers or browse all agents.
- [ ] Corrupt/partial wizard state cannot crash the page.
- [ ] Missing agent IDs are filtered before rendering results.

## Mobile layout

- [ ] Wizard modal/panel fits within a narrow viewport without horizontal scrolling.
- [ ] Answer options stack cleanly on mobile.
- [ ] Result cards stack cleanly and action buttons remain reachable.
- [ ] Modal content scrolls if taller than the viewport.
- [ ] Navbar/sidebar mobile controls still work before and after using the wizard.

## Homepage integrity

- [ ] Existing Battle Mode CTA still navigates to `/battle`.
- [ ] Stats still show the loaded agent count and static provider/open-source values.
- [ ] Favorites section still appears only when favorites exist and no homepage filter is active.
- [ ] Recently Used section still appears only when recent agents exist and no homepage filter is active.
- [ ] Agent grid still renders skeletons while loading and cards after loading.
- [ ] Existing no-matching-agents empty state still works.

## Search

- [ ] Homepage search by agent name still works.
- [ ] Homepage search by description still works.
- [ ] Homepage search by category still works.
- [ ] Clearing search restores the previous unfiltered grid.
- [ ] Category dropdown keyboard navigation still works.
- [ ] Sidebar search still filters sidebar agent links independently of wizard state.

## Favorites

- [ ] Favorite star on `AgentCard` still toggles `ila_favorites`.
- [ ] Favorited cards update immediately across visible card instances.
- [ ] Recommended result actions do not auto-favorite agents unless explicitly designed.
- [ ] Favorite ordering remains newest-first on the homepage.

## Suites

- [ ] `/suites` still renders suite cards.
- [ ] Suite quiz flow still works independently of the recommendation wizard.
- [ ] Suite result cards still link to valid agents.
- [ ] Beta custom suite generator behavior is unchanged.
- [ ] Wizard implementation does not mutate `src/suites/suitesData.js`.

## Collections

- [ ] `/collections` still renders existing collections and empty state.
- [ ] `/collections/:id` still renders collection details and agent cards.
- [ ] Adding/removing agents from collections still works.
- [ ] AgentCard `FolderPlus` collection picker still opens and persists selections.
- [ ] Sidebar Collections block still shows counts and links.
- [ ] Wizard does not auto-create or mutate collections unless an explicit future action is added.

## Agent Runner

- [ ] Opening a recommendation navigates to `/agent/:id`.
- [ ] Agent page still writes to `recentAgents`.
- [ ] Required inputs and API key validation still work.
- [ ] Prompt playground, model selector, batch mode, scheduler modal, and output rendering remain unaffected.
- [ ] Run history still saves completed runs under `iloveAgents_history`.

## Build verification

- [ ] `npm run build` passes.
- [ ] `git diff --check` passes.
- [ ] Browser console has no new errors when opening/completing/closing the wizard.
- [ ] If a perceptible UI change is implemented, capture desktop and mobile screenshots for review.
