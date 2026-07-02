# Smart Agent Recommendation Wizard: UI/UX Analysis

## Audit method and constraints

This audit is based on the current repository implementation plus a local Vite session.

- Code inspected: `src/pages/HomePage.jsx`, `src/components/AgentCard.jsx`, `src/components/Sidebar.jsx`, `src/components/Navbar.jsx`, `src/components/SuiteWizard.jsx`, `src/pages/SuitesPage.jsx`, `src/lib/useCollections.js`, `src/pages/CollectionsPage.jsx`, `src/pages/CollectionDetailPage.jsx`, `src/components/CollectionModal.jsx`, `src/components/CollectionPicker.jsx`, `src/components/KeyboardShortcutsModal.jsx`, `src/components/RecentRuns.jsx`, `src/components/AgentRunner.jsx`, `src/index.css`, and `tailwind.config.js`.
- Local app launched with `npm run dev -- --host 127.0.0.1`.
- Browser automation attempted with `npx playwright screenshot`, but Chromium was not available in the container. `npx playwright install chromium` failed because the Playwright CDN download returned `403 Domain forbidden`. Visual/responsive analysis therefore relies on source inspection of current responsive classes and component structure rather than committed screenshots.
- No source files were modified. This document is planning-only.

## 1. Current UI structure

### Homepage layout

`src/pages/HomePage.jsx` is the primary agent-discovery surface. It renders a vertically stacked discovery page inside `MainLayout` from `src/App.jsx`, which applies `pt-28 lg:pl-60` to account for the fixed navbar and desktop sidebar.

Current homepage order:

1. Hero block with headline, subtitle, and a single prominent `Enter Battle Mode` CTA.
2. Three stat cards for agent count, providers, and open-source status.
3. Conditional `Your Favorites` section when favorites exist and no search/category filter is active.
4. Conditional `Recently Used` section when recent agents exist and no search/category filter is active.
5. Search and category filter controls.
6. Main agent grid plus a right-side `RecentRuns` column on large screens.
7. Conditional Workflows CTA block when not filtering.
8. Footer.

The page uses `premium-section` animation wrappers and a glass/gradient visual style. It is already dense near the top, so adding another large element above search can easily clutter the discovery flow.

### Agent grid layout

The main grid in `HomePage.jsx` uses responsive grid classes similar to:

- `grid-cols-1` on mobile.
- `sm:grid-cols-2` on small screens.
- `lg:grid-cols-2 xl:grid-cols-3` in the main content column because `RecentRuns` occupies a `lg:w-80` side column.

`AgentCardSkeleton` appears while `agentsLoading` is true. When loaded, the grid renders `AgentCard` for each filtered agent. Empty search results use a centered bordered card with an accent icon, concise copy, and a text-style reset action.

### Search/filter placement

Search and category filtering live together in a `premium-section` below favorites/recent sections and above the agent grid.

- Search is a prominent pill input with a search icon and clear button.
- Category filter is a custom dropdown with keyboard handling, count badges, active gradient state, and clear button.
- `showingFiltered` hides Favorites, Recently Used, and Workflows CTA so filtered discovery stays focused.

A wizard entry should not hijack this existing filter state. It should complement the search/filter flow rather than become another filter control unless specifically designed to populate a recommendations panel.

### Sidebar/navigation behavior

`src/components/Sidebar.jsx` is a fixed left sidebar below the navbar.

Current order:

1. `Agents` header and total filtered count.
2. Sidebar search input.
3. Top-level `Suites` link.
4. Collections block with all-collections link and up to 10 collection links.
5. `Scheduler` link.
6. Divider.
7. Agent category accordion groups with count badges and agent links.
8. Footer links.

Sidebar behavior:

- Desktop (`lg` and above): pinned at `w-60`.
- Below `lg`: off-canvas, opened by navbar sidebar toggle, with a dark overlay.
- Category collapsed state persists under `sidebar-category-collapsed-state`.
- Search expands matching categories by default and uses separate `searchExpandedCategories` state.

A wizard sidebar link would be discoverable but risks making a non-route feature feel like a permanent navigation destination. The current sidebar is already doing agent navigation, collections, scheduler, and categories.

### Main visual hierarchy

The hierarchy emphasizes:

- Large centered homepage headline.
- Battle Mode as the current hero CTA.
- Search/filter as the main discovery control.
- Agent cards as the main action surface.
- Sidebar for direct navigation and category browsing.

The recommendation wizard should be presented as assisted discovery, not as a replacement for the existing search and category browsing mental model.

### Agent card design

`src/components/AgentCard.jsx` is a full-card `Link` to `/agent/:id` with nested controls that stop link navigation.

Card structure:

- Top-left Lucide icon in an accent-tinted square.
- Top-right badge cluster: optional `New`, category badge, collection button, favorite star.
- Agent name and two-line description.
- Bottom provider badge and hover/focus `Run` affordance.
- Hover/focus premium transform and accent border.

Agent cards are compact and heavily reused. Recommendation results should not overload these cards with ranking details unless a dedicated result-card variant is created.

### Empty states

Current empty-state pattern appears in:

- `HomePage.jsx` no matching agents.
- `RecentRuns.jsx` no history.
- `CollectionsPage.jsx` no collections.
- `CollectionDetailPage.jsx` empty collection / not found / loading / error.

Common pattern:

- Rounded or dashed bordered panel.
- Accent icon in `bg-accent/10` circle/square.
- Short bold heading.
- Muted helper text.
- One primary or text CTA.

Wizard no-result states should follow this exact pattern.

### Mobile behavior

From source-level responsive classes:

- `MainLayout` keeps top padding and removes desktop sidebar padding below `lg`.
- Navbar shows a sidebar toggle and collapses top nav links into a mobile menu below `md`.
- Sidebar becomes off-canvas below `lg`.
- Homepage grids collapse to one column, then two columns at `sm`.
- Header/action rows generally use `flex-col sm:flex-row` or wrapping.
- Modals use `fixed inset-0`, `p-4`, and `max-w-md`, which should fit mobile width if content is scrollable.

The wizard must avoid a wide multi-column modal on mobile. Steps and result cards should stack in one column.

### Existing modal/dialog patterns

Current modal-like components:

- `src/components/CollectionModal.jsx`: `fixed inset-0 z-[100]`, `bg-black/50 backdrop-blur-sm`, centered `max-w-md` panel, `role="dialog"`, `aria-modal="true"`, close button, form footer.
- `src/components/CollectionPicker.jsx`: same overlay/panel pattern with selectable rows and create form.
- `src/components/KeyboardShortcutsModal.jsx`: same overlay/panel pattern, but lacks explicit `role="dialog"` and close button `aria-label`.
- `src/components/ScheduleAgentModal.jsx`: runner-specific scheduling modal pattern.

The recommendation wizard should use the Collection modal accessibility baseline and improve it with labelled dialog title/description, Escape handling, focus return, and scrollable body.

### Buttons, badges, cards, icons, spacing, typography

Common conventions:

- Primary button: `bg-accent hover:bg-accent-hover text-white`, rounded `md/lg`, small/medium font weight, `active:scale-[0.97/0.98]`.
- Secondary button: light `bg-gray-100 border-gray-200 text-gray-600`, dark `dark:bg-surface-input dark:border-border dark:text-text-secondary`.
- Destructive button: red text/background only for destructive actions.
- Badges: very small text (`text-[10px]` or `text-xs`), rounded-full, tinted background and border.
- Cards: `rounded-xl` or `rounded-lg`, `border`, `bg-white dark:bg-surface-card`, subtle hover border/shadow.
- Icons: Lucide, usually `14–24px`, accent-tinted in icon containers.
- Typography: small headings (`text-sm font-semibold uppercase tracking-wider`) for sections; page hero uses `text-3xl sm:text-4xl font-bold`.
- Spacing: `gap-3/4`, `p-4/5/6`, section margins `mb-8/10`, modal `p-5/6`.

## 2. Best entry point for the wizard

### Option A: Hero CTA

**Pros**

- Highest discoverability.
- Matches the user intent of “I do not know what agent to use yet.”
- Can sit near the existing headline about ready-to-use agents.
- Works on mobile because it can stack below the Battle Mode CTA.

**Cons**

- Hero already has `Enter Battle Mode`; two strong CTAs can compete.
- If styled too loudly, it may demote Battle Mode or make the hero feel busy.

**UX recommendation**: Best primary entry point, but style it as an assisted-discovery secondary CTA unless product wants it to replace Battle Mode as the primary homepage action.

### Option B: Agent grid toolbar button

**Pros**

- Contextually close to the agent list.
- Lower hero clutter.
- User sees it when they are actively browsing.

**Cons**

- Less visible above the fold on long/favorites-heavy home states.
- Could be confused with a grid filter or sort control.
- On mobile the toolbar is already constrained by count labels and filter controls.

**UX recommendation**: Good secondary placement if the hero CTA is too crowded. Could be a small “Need help choosing?” link near the `Available Agents` heading.

### Option C: Sidebar item

**Pros**

- Persistent access from most main-layout routes.
- Fits navigation-style discovery.

**Cons**

- Sidebar already includes Suites, Collections, Scheduler, and many categories.
- A wizard modal launched from sidebar can be surprising because sidebar links mostly navigate.
- Mobile users may not discover it because sidebar is hidden off-canvas.

**UX recommendation**: Not recommended for v1. Consider later only if a dedicated route exists.

### Option D: Empty search state CTA

**Pros**

- Strong user intent: search failed, user needs help.
- Low clutter because it appears only when needed.

**Cons**

- Not discoverable for users who never hit an empty state.
- Should be supplemental, not the only entry point.

**UX recommendation**: Add as an optional secondary CTA after the main wizard exists: “Try the recommendation wizard.”

### Option E: Floating action button

**Pros**

- Persistent and discoverable.

**Cons**

- The app already has fixed navbar, sidebar, custom cursor, scroll buttons, and dense card UI.
- FAB may obstruct content on mobile and compete with existing scroll controls.
- Not a current design pattern in the app.

**UX recommendation**: Avoid for v1.

### Option F: Dedicated `/recommendations` route

**Pros**

- Deep-linkable.
- More room for a robust wizard/results page.
- Avoids modal complexity.

**Cons**

- Requires route/nav decisions and increases product surface area.
- Could duplicate `/suites`, search, and homepage discovery.
- More implementation overhead for v1.

**UX recommendation**: Defer. Use only if analytics or product direction requires shareable/revisitable recommendation flows.

### Recommended entry point

Place a **secondary hero CTA** in `src/pages/HomePage.jsx` near the current `Enter Battle Mode` button, with optional future backup CTA in the no-results search state.

Suggested copy:

- Primary wizard CTA label: `Find my agent`
- Supporting microcopy if space allows: `Answer a few questions for personalized picks.`

Why this is best:

- High discoverability at the main discovery surface.
- Clear user intent before searching.
- No route/navigation changes required.
- Mobile can stack CTA buttons.
- Does not alter existing search/category state.

## 3. Wizard interaction model

### Modal wizard

**Pros**

- Matches existing modal patterns (`CollectionModal`, `CollectionPicker`, keyboard shortcuts).
- Keeps users on the homepage and preserves search/filter context.
- Lower implementation and navigation risk.
- Natural for a short, guided flow.

**Cons**

- Six steps plus results can feel long in a small modal.
- Requires proper focus management and scroll behavior.
- Results may need more space than a compact modal provides.

### Dedicated page

**Pros**

- Best space for long result explanations.
- Easier mobile scrolling.
- URL can be bookmarked.

**Cons**

- Larger route/nav change.
- Pulls users away from the agent grid.
- Feels heavier than current v1 needs.

### Slide-over panel

**Pros**

- Could keep homepage visible.
- Good for desktop side-by-side browsing.

**Cons**

- Not an established pattern in the current app.
- Conflicts with sidebar/off-canvas mental model on mobile.
- Less screen width for answer cards and result explanations.

### Inline expandable section

**Pros**

- No overlay/focus-trap complexity.
- Results can appear in page flow.

**Cons**

- Pushes existing homepage content down.
- Can make homepage much longer and visually noisy.
- State placement near filters may make it feel like another filter.

### Recommended interaction model for v1

Use a **modal wizard with a scrollable body and responsive full-screen-ish mobile behavior**.

Behavior:

- User enters from homepage CTA.
- Modal opens over the current homepage.
- Dialog header shows title, short description, close button, and step progress.
- Body shows one step at a time.
- Footer shows Back, Next/Show results, and optional Skip for optional steps.
- Results appear in the same modal after completion.
- `Refine answers` returns to the last answered step or a summary step.
- `Start over` resets all answers.
- `Open agent` closes/navigates to `/agent/:id` or simply uses a router link inside the modal.

Mobile behavior:

- Use `fixed inset-0 p-3 sm:p-4` overlay.
- Panel should be `w-full max-w-2xl`, but on mobile effectively fill available width and use `max-h-[calc(100vh-2rem)] overflow-hidden` with an internal scroll area.
- Answer cards and result cards stack one column.
- Footer buttons stack or wrap if needed.

## 4. Wizard step UX

The requested six-step flow is feasible, but to reduce perceived length, show progress as `Step 1 of 5` and treat results as the completion view rather than a numbered input step.

### Step 1: Primary goal

- **Suggested question**: “What do you want help with today?”
- **Input style**: Large selectable cards with Lucide icons and one-line helper text.
- **Selection**: Single-select.
- **Required**: Yes.
- **Validation**: Disable `Next` until selected. If user attempts keyboard submit without selection, show inline helper: “Choose a goal to continue.”
- **Suggested options**:
  - Build or debug software
  - Write or improve content
  - Research or summarize information
  - Learn or prepare for an exam/interview
  - Plan business, product, or sales work
  - Design or create something visual
- **Mobile considerations**: One-column cards with `min-h` touch targets; avoid icon-only options.

### Step 2: Experience level

- **Suggested question**: “How much guidance do you want?”
- **Input style**: Segmented option cards.
- **Selection**: Single-select.
- **Required**: Yes, but include `Not sure / any`.
- **Validation**: Default can be `Not sure / any` only if explicitly selected; do not silently assume.
- **Suggested options**:
  - Beginner — explain and guide me
  - Intermediate — give practical structure
  - Advanced — be concise and technical
  - Any level is fine
- **Mobile considerations**: Keep copy short; cards stack.

### Step 3: Preferred provider

- **Suggested question**: “Do you prefer a specific AI provider?”
- **Input style**: Provider pill/card choices matching current provider badges.
- **Selection**: Single-select.
- **Required**: Optional, with `Any provider` recommended/default option.
- **Validation**: Allow skip or explicit `Any provider`.
- **Suggested options**:
  - Any provider
  - OpenAI
  - Anthropic
  - Gemini
- **Mobile considerations**: Two-column provider grid is acceptable at larger mobile widths, one column at narrow widths.

### Step 4: Budget

Current agent metadata does not include price, token cost, latency, or provider model cost. This means the wizard must not overclaim cost optimization.

- **Suggested question**: “How should we balance cost and capability?”
- **Input style**: Single-select cards with transparent caveat text.
- **Selection**: Single-select.
- **Required**: Optional; default to `Balanced`.
- **Validation**: No blocking if skipped.
- **Suggested options**:
  - Balanced recommendation
  - Prefer simpler/faster agents
  - Prefer more capable/thorough agents
  - No preference
- **Important caveat**: Label this as preference guidance only, not actual dollar-cost calculation.
- **Mobile considerations**: Keep caveat below question in muted text.

### Step 5: Additional preferences

- **Suggested question**: “Any extra preferences?”
- **Input style**: Multi-select chips/cards plus optional short free-text goal field.
- **Selection**: Multi-select and optional text.
- **Required**: No.
- **Validation**: Limit free text length, e.g. 160–240 characters. Do not block empty state.
- **Suggested multi-select options**:
  - Needs structured output
  - Needs checklist or plan
  - Needs code or technical detail
  - Needs concise answer
  - Needs creative ideas
  - Needs risk or quality review
- **Mobile considerations**: Chips should wrap with adequate spacing. Free-text field should be full width.

### Step 6: Results

- **Suggested heading**: “Recommended agents for you”
- **Input style**: Ranked result cards.
- **Selection**: Not an input step.
- **Required**: N/A.
- **Validation**: Show fallback/no-match state if no results can be resolved to current agents.
- **Mobile considerations**: Stack result cards, keep `Open agent` button visible, collapse explanations to top 2–3 bullets.

## 5. Results UX

### Ranking layout

Recommended modal results layout:

- Header: `Recommended agents for you` plus small summary like `Based on your goal, level, and preferences`.
- Top 3–5 results in a vertical list inside the modal.
- Optional `Also consider` section for lower-confidence but relevant results.
- Each card should show rank number, agent icon/name/category, match percentage, short description, reasons, and actions.

Avoid rendering all 100+ agents in wizard results. Keep the main homepage grid for full browsing.

### Match percentage display

- Use a small rounded badge similar to SuiteWizard percentage badges.
- Label as `92% match`, not just `92%`, for clarity.
- Percentages must be generated from transparent rule-based scoring and bounded to 0–100.
- Avoid precision beyond whole numbers.
- If confidence is low, use labels like `Good fit` or `Possible fit` rather than overstating a percentage.

### “Why this agent?” explanation

Each result should include 2–4 reason bullets derived from matched scoring signals.

Examples:

- `Matches your Engineering goal.`
- `Strong fit for review and debugging tasks.`
- `Works with your provider preference.`
- `Matched your keywords: SQL, schema.`

Do not generate unsupported claims. If metadata is missing, fall back to category/name/description-based reasons.

### Recommended agent card structure

Suggested structure:

1. Top row: rank badge, icon, name, category/provider badges, match badge.
2. Description: two-line current agent description.
3. Reasons: compact bullet list or `Why this agent?` expandable section.
4. Actions: primary `Open agent`, secondary `Add to collection` only if reusing `CollectionPicker` is low-risk, optional `Start over` outside cards.

For v1, keep card actions minimal:

- Primary: `Open agent`.
- Secondary: `Refine` / `Start over` at result-list level.

Users can favorite or add to collection from existing `AgentCard`/agent page surfaces.

### Restart/refine behavior

- `Refine answers`: returns to Step 5 Additional preferences or opens a compact answer summary with edit buttons.
- `Start over`: clears preferences and returns to Step 1.
- `Back`: from results should return to Step 5 without losing answers.

### No-match state

Use current empty-state pattern:

- Accent icon in `bg-accent/10`.
- Heading: `No confident matches yet`.
- Copy: `Try broadening your provider or removing optional preferences.`
- Actions: `Adjust answers`, `Browse all agents`.

### Missing metadata handling

- Missing icon: fall back to `Icons.Bot`, consistent with `AgentCard`.
- Missing provider: show `Any provider` or omit provider badge.
- Missing category: show `Uncategorized` only if needed; avoid crashing.
- Missing description: show `No description provided.` as `AgentCard` does.
- Stale result ID: filter it out before rendering; if all are stale, show no-match state.

## 6. Visual design guidance

### Spacing conventions

- Modal panel: `p-5`/`p-6` sections, `gap-3` for cards, `space-y-4` for form areas.
- Wizard content max width: `max-w-2xl` for input steps, possibly `max-w-3xl` for results.
- Step cards: `p-4`, `rounded-xl`, `gap-2/3`.

### Card style

Use existing card language:

- `rounded-xl border bg-white dark:bg-surface-card`.
- `border-gray-200 dark:border-border`.
- Selected state: `border-accent bg-accent/10 text-accent`.
- Hover state: `hover:border-indigo-300 dark:hover:border-accent/40`.

Do not use a radically different visual system for the wizard.

### Border/radius/shadow usage

- Modal: `rounded-xl shadow-2xl` like `CollectionModal`.
- Cards: `rounded-xl` with border, minimal shadow unless hover.
- Avoid heavy 3D transforms inside modal option cards; keep motion calmer than `AgentCard` hover effects.

### Button hierarchy

- Primary: `Next`, `Show results`, `Open agent` with accent background.
- Secondary: `Back`, `Refine answers`, `Browse all agents` with neutral border/background.
- Tertiary/text: `Skip`, `Start over`, close affordance.
- Do not place multiple primary buttons in the same footer.

### Color usage

- Accent indigo for selected options, primary actions, progress, and match highlights.
- Provider badges can reuse current provider colors from `AgentCard`.
- Success/green only for strong matches if used sparingly.
- Avoid red except validation/destructive states.

### Badge/pill style

- Use `text-[10px]` or `text-xs`, `font-semibold`, `rounded-full`, tinted background.
- Match badge should be visually stronger than category/provider badges but not as large as a button.

### Icon usage

- Use Lucide icons sized `16–20px` in step cards.
- Use `Bot` fallback for agent result cards.
- Avoid decorative-only icons without `aria-hidden` where necessary.

### Animation/motion guidance

- Reuse `animate-fade-in` for modal content transitions.
- Progress bar can transition width with `duration-300` like `SuiteWizard`.
- Respect `prefers-reduced-motion`; `src/index.css` already disables premium cursor/section animations for reduced motion/coarse pointer in some cases.
- Avoid animated result reordering.

### Loading/skeleton behavior

The wizard should not open into an empty experience while agents are loading.

- If `agentsLoading`, disable CTA or show a small loading state in the modal.
- No complex skeletons are needed for rule-based results because scoring is synchronous.
- If future AI-powered recommendation is added, use a compact spinner/loading card with transparent copy.

## 7. Accessibility

### Keyboard navigation

- CTA must be reachable by keyboard and have visible focus.
- Dialog close, Back, Next, answer cards, and result actions must be in logical tab order.
- Arrow-key navigation for option groups is nice-to-have; basic tab/space/enter support is required.
- Escape should close the modal unless a nested control is active and needs Escape.

### Focus states

- Reuse global `*:focus-visible` outline from `src/index.css`.
- On open, focus the dialog heading or first interactive option.
- On close, return focus to the triggering CTA.
- On step change, move focus to the new step heading or first option to avoid screen reader confusion.

### ARIA labels and dialog accessibility

If modal is chosen:

- Overlay container: `role="dialog"`, `aria-modal="true"`.
- Add `aria-labelledby` pointing to wizard title.
- Add `aria-describedby` pointing to short wizard description or current step helper.
- Close button must have `aria-label="Close recommendation wizard"`.
- Progress should be announced as text, not only visual width.

### Screen reader-friendly step labels

- Use a real heading for each question.
- Include text like `Step 2 of 5`.
- For selected cards, use native buttons with `aria-pressed` or radio semantics.
- For multi-select preferences, use checkboxes or buttons with clear `aria-pressed` state.

### Color contrast

- Avoid low-contrast muted text for key questions or selected states.
- Do not rely only on color to indicate selected option; include border, check icon, or `Selected` text for assistive context.
- Ensure match badges are readable in both light and dark themes.

### Reduced motion

- Keep motion minimal.
- Avoid required animations for comprehension.
- Respect `prefers-reduced-motion` if adding custom CSS.

### Touch target sizes

- Answer cards should be at least ~44px tall.
- Footer buttons on mobile should have enough vertical padding (`py-2.5` or equivalent).
- Close button should not be smaller than existing modal close controls.

## 8. Responsive behavior

### Desktop

- Modal max width: `max-w-2xl` for steps, `max-w-3xl` for results if needed.
- Options can use `grid-cols-2` for choice cards.
- Results can use a vertical list for readability or a two-column layout only if explanations remain readable.
- Background homepage remains visible but inert behind overlay.

### Tablet

- Treat similar to desktop but avoid fixed-width assumptions.
- Option grid can remain two columns at `sm`/`md` if labels are short.
- Results should probably remain one column if cards include explanations.
- Ensure the off-canvas sidebar overlay does not conflict if sidebar is open when wizard is triggered; close sidebar before opening wizard if entry is ever added there.

### Mobile

- Panel should use almost full viewport width with `p-3`/`p-4` outer spacing.
- Use a sticky or fixed footer inside the modal only if content height becomes a problem; otherwise a normal footer after scrollable content is simpler.
- Step cards stack one column.
- Provider/budget chips may wrap, but must not overflow.
- Results stack one card per row.
- Footer controls should wrap or stack: Back/Skip as secondary row, Next/Open as full-width primary if needed.

## 9. Risks and UX tradeoffs

### CTA clutter

Risk: Hero already contains Battle Mode CTA.

Mitigation: Make `Find my agent` a complementary secondary/accent-outline CTA or pair it with a small helper line rather than another large gradient button.

### Modal complexity

Risk: Six steps plus results can feel cramped.

Mitigation: Keep steps concise, show one question per step, use a scrollable body, and allow optional steps to be skipped.

### Too many wizard steps

Risk: Users may abandon before results.

Mitigation: Keep required steps to Primary goal and Experience level; make Provider/Budget/Additional preferences optional or quick to skip. Show progress clearly.

### Recommendation trust issues

Risk: Users may distrust percentages or reasons if they feel arbitrary.

Mitigation: Use transparent “Why this agent?” bullets from actual scoring signals and avoid over-precise claims.

### Overclaiming “AI-powered”

Risk: V1 is rule-based, not AI-generated.

Mitigation: Use copy like `personalized recommendations` or `smart matching`; avoid `AI-powered recommendations` unless an LLM path is implemented.

### Mobile crowding

Risk: Modal and result explanations can crowd small screens.

Mitigation: Stack cards, limit reasons to 2–3 bullets, use full-width primary actions, and keep optional metadata compact.

### Duplicate functionality with filters/search

Risk: Wizard may be perceived as just another filter.

Mitigation: Position it as guided help for users who do not know what to search for. Do not mutate search/category filters automatically.

### Confusion with Suites

Risk: Suites already have “Find Your Perfect Agents” and quiz-like behavior.

Mitigation: Copy should clarify scope: Suites are curated bundles; the wizard recommends across the full agent registry.

### Confusion with Reliability Score feature

Risk: If other features use score/scorecard language, `match percentage` could be confused with agent quality or reliability.

Mitigation: Label result metric as `match`, not `score`, and add helper text: `Match reflects your answers, not agent quality.`

## 10. Implementation-ready UI plan

### Recommended CTA placement

Modify `src/pages/HomePage.jsx` in implementation to add a `Find my agent` CTA near the existing hero CTA.

Recommended layout:

- Keep `Enter Battle Mode` visible.
- Add `Find my agent` as either:
  - a secondary button next to Battle Mode on desktop and stacked on mobile, or
  - a small assisted-discovery card directly below the hero subtitle.
- Optional later: add `Try the wizard` text action inside the no-search-results empty state.

### Recommended interaction model

Use a modal wizard for v1.

- Reuse visual shell patterns from `src/components/CollectionModal.jsx` and `src/components/CollectionPicker.jsx`.
- Improve accessibility with labelled dialog, focus handling, Escape close, and focus return.
- Results appear inside the same modal.

### Suggested component structure

Create later during implementation, not in this documentation task:

- `src/components/recommendation/RecommendationWizardEntry.jsx`
- `src/components/recommendation/RecommendationWizardModal.jsx`
- `src/components/recommendation/RecommendationWizardStep.jsx`
- `src/components/recommendation/RecommendationResults.jsx`
- `src/components/recommendation/RecommendationResultCard.jsx`
- `src/hooks/useRecommendationWizard.js`

These align with the architecture plan in `02-feature-architecture.md`.

### Step flow

1. Primary goal — required single-select cards.
2. Experience level — required single-select cards.
3. Preferred provider — optional single-select, default/skip as `Any provider`.
4. Budget/capability preference — optional single-select with clear caveat.
5. Additional preferences — optional multi-select plus short free text.
6. Results — ranked recommendations with match percentages and reasons.

### Results layout

- Top 3–5 recommendations in vertical result cards.
- Each card: rank, icon/name, category/provider badges, `N% match`, description, 2–4 reasons, `Open agent` action.
- Result-level actions: `Refine answers`, `Start over`, `Browse all agents`.
- No-match state uses existing empty-card pattern.

### Mobile strategy

- Full-width modal within viewport padding.
- Internal scroll body and accessible footer.
- One-column steps and results.
- Full-width primary action when space is tight.
- Avoid sidebar dependency for discovery.

### Files likely to modify/create during implementation

Modify:

- `src/pages/HomePage.jsx` for CTA and modal wiring.

Create:

- `src/components/recommendation/*` components listed above.
- `src/hooks/useRecommendationWizard.js`.
- `src/lib/agentRecommendation/*` scoring utilities from the architecture plan.

Avoid modifying for v1:

- `src/App.jsx` unless choosing a route.
- `src/components/Sidebar.jsx` and `src/components/Navbar.jsx` unless adding navigation.
- `src/components/AgentRunner.jsx`.
- `src/suites/suitesData.js`.
- `src/lib/useFavorites.js` and `src/lib/useCollections.js`.
