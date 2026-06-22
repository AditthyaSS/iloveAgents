# Sidebar Structure

## Current sections

- Top navbar (`src/components/Navbar.jsx`) is fixed, rounded, blurred, and uses pill links for `Agents`, `Suites`, `Workflows`, and `Battle` on desktop/tablet. Mobile hides those links behind a separate navigation menu.
- Main sidebar (`src/components/Sidebar.jsx`) is fixed under the navbar and visually separate from top navigation.
- Sidebar ordering observed with Playwright:
  - `Agents` header with total count badge.
  - Sidebar search input.
  - Single `Suites` link.
  - Divider.
  - Agent category accordion groups with count badges.
  - Footer links: `GitHub`, `Contribute`, `GSSoC 2026`.
- There is no sidebar `Favorites` link and no sidebar `Collections` area today.

## Ordering

`Suites` currently appears before category groups. A `Collections` section would fit naturally between `Suites` and the category divider, or as its own block directly below the divider before categories. The better fit is below `Suites` and above categories because Collections, Suites, and Favorites are grouping/navigation concepts, while categories are registry taxonomy.

Recommended sidebar order:

1. `Suites`
2. `Collections` header/link area
3. Divider
4. Agent categories
5. Footer

## Expand/collapse behavior

- Category rows are buttons with `aria-expanded`.
- Collapsed category rows show only category name, count badge, and chevron-right.
- Expanded category rows reveal agent `NavLink`s with Lucide icons.
- When navigating to `/agent/:id`, the active agent category auto-expands.
- During sidebar search, matching categories auto-expand by default and use a separate `searchExpandedCategories` state.
- On desktop (`lg` and up), the sidebar is pinned.
- On mobile/tablet below `lg`, the sidebar is off-canvas by default and opens via the navbar sidebar toggle. When opened, it uses a dark overlay and translates to `left: 0`.

# Agent Card Analysis

## Existing actions

Full agent cards are implemented in `src/components/AgentCard.jsx`.

- Whole card is a `Link` to `/agent/:id`.
- Star button in the top-right adds/removes the agent from Favorites.
- Category badge appears in the top-right badge cluster.
- Optional `New` badge appears for agents created within the last 7 days.
- Provider badge appears at bottom-left.
- `Run` affordance appears at bottom-right and fades in on hover/focus.

## Button placement

- Star action is nested inside the link card and stops link navigation with `preventDefault()` and `stopPropagation()`.
- Action buttons elsewhere use compact icon + text buttons:
  - Primary: `bg-accent hover:bg-accent-hover text-white`.
  - Secondary: `bg-gray-100` / `dark:bg-surface-input`, bordered, muted text.
  - Icon-only actions: padded rounded square/circle, muted text, hover color shift.

## Menus and dropdowns

- Home category filter is an inline custom dropdown in `src/pages/HomePage.jsx`.
- Shared dropdown component exists at `src/components/CustomSelect.jsx`.
- Dropdowns use rounded borders, `dark:bg-surface-card`, `dark:border-border`, `shadow-xl`/`shadow-2xl`, count badges where relevant, and keyboard support.
- Agent runner uses `CustomSelect` for provider/model/select inputs.

# Favorites UX

Observed with Playwright:

- There is no `/favorites` route. Navigating to `/favorites` shows `src/pages/NotFoundPage.jsx`.
- Favorites are displayed as an inline `Your Favorites` section on `src/pages/HomePage.jsx`.
- The section appears only when at least one favorite exists and the home page is not filtered by search/category.
- Favorite agent order follows `ila_favorites` localStorage order, newest first.
- Clicking the star on any `AgentCard` immediately updates the card and the `Your Favorites` section.
- localStorage key observed: `ila_favorites`, value shape: array of agent IDs, for example `["accessibility-audit-generator"]`.
- The favorite star uses yellow styling when selected and is hidden until hover/focus when not selected.

# Suites UX

Observed with Playwright:

- Suites are available in both top navbar and sidebar.
- `/suites` is a single page with internal browse, quiz, and result states. There are no individual suite detail URLs.
- Browse state:
  - Centered hero: `Find Your Perfect Agents`.
  - Responsive grid of suite cards.
  - Suite card has icon, title, description, agent count badge, and `Find My Agents` CTA.
  - Card top border uses suite-specific color from `src/suites/suitesData.js`.
- Quiz state:
  - Back icon button.
  - Suite title and question progress.
  - Thin progress bar.
  - Two-column answer buttons on wider screens.
  - Footer controls: `Skip this question`, `View all agents`, and primary `Next`.
  - `Next` is disabled until an answer is selected.
- Results state:
  - Still on `/suites`.
  - Header changes to `Recommended based on your answers` or `All agents in this suite`.
  - Agent result cards are compact buttons, not full `AgentCard`s.
  - Result cards show name, optional match percentage badge, and truncated description.

# Route Analysis

Routes from `src/App.jsx`, verified where relevant with Playwright:

- `/`: Home page and agent registry. Shows hero stats, optional `Your Favorites`, optional `Recently Used`, search/category filters, full agent grid, Recent Runs sidebar, and Workflows CTA.
- `/agent/:id`: Agent runner page using `src/components/AgentRunner.jsx`. Shows breadcrumb, agent header, API key bar, inputs, dropdowns, prompt/model accordions, and run controls.
- `/suites`: Suites browse/quiz/results page using `src/pages/SuitesPage.jsx` and `src/components/SuiteWizard.jsx`.
- `/workflows`: Workflow library page using `src/pages/WorkflowLibrary.jsx`.
- `/workflows/build`: Workflow builder page.
- `/workflows/:id`: Workflow detail page.
- `/workflows/:id/run`: Workflow runner page.
- `/battle`: Battle Mode landing, full-screen layout outside `MainLayout`.
- `/battle/setup`: Battle setup, full-screen layout.
- `/battle/arena`: Battle arena, full-screen layout.
- `/battle/winner`: Battle winner, full-screen layout.
- `*`: Not found page. `/favorites` currently lands here.

# Collection UI Recommendations

## Sidebar placement

- Add a distinct `Collections` block in `src/components/Sidebar.jsx` below the existing `Suites` link and above agent category groups.
- Use a small uppercase section label consistent with the existing `Agents`/category typography.
- Show each collection as a `NavLink` to `/collections/:collectionId` with a count badge.
- Keep Collections visually separate from Suites and categories with a divider.
- Do not merge collections into the agent category accordion.

## `/collections` page layout

- Use the home/workflow page pattern:
  - Header row with title `Collections`, short subtitle, and primary `New Collection` button.
  - Optional search input if collections can grow to 10.
  - Grid of collection cards.
- Collection cards should be compact, similar in density to workflow cards:
  - Icon, collection name, agent count badge.
  - Short preview of first few agent names or empty text.
  - Actions: open, rename, delete.
- Empty state should match `RecentRuns` and `WorkflowLibrary`: centered card with accent icon, short title, short text, and primary action.

## Collection detail page layout

- Recommended route: `/collections/:collectionId`.
- Header:
  - Back link/button to `/collections`.
  - Collection name.
  - Count badge like `4 agents`.
  - Rename/delete actions in muted secondary/icon buttons.
- Body:
  - Use the full `AgentCard` grid for contained agents so users keep favorite/run behavior.
  - Empty state: `No agents in this collection yet`, with a CTA to browse agents.
- Avoid using Suite result cards here because collections are user-owned working sets and benefit from full card actions.

## Empty states

- No collections: use a centered bordered card, accent icon, title, helper text, and `Create Collection`.
- Empty collection: use a centered bordered card and `Browse Agents`.
- Collection not found: either redirect to `/collections` or show a small not-found state using the existing NotFound visual language at lower intensity.

## Modal design

- Reuse the modal pattern from `src/components/KeyboardShortcutsModal.jsx`:
  - `fixed inset-0 z-[100]`.
  - `bg-black/50 backdrop-blur-sm`.
  - Centered `max-w-md` panel.
  - `rounded-xl`, border, `shadow-2xl`.
  - Header with Lucide icon, title, close icon button.
- Create/rename dialogs should use the existing form input classes from `AgentRunner` and primary/secondary buttons from existing pages.
- Delete confirmation can use the same modal shell with a red-tinted destructive action.

## Naming conventions

- Page title: `Collections`.
- Primary CTA: `New Collection`.
- Sidebar label: `Collections`.
- Per-card action labels: `Open`, `Rename`, `Delete`.
- Agent-card action label: `Add to collection` or `Add to Collections` depending whether it opens a collection picker.

# Responsive Considerations

## Desktop

- Main content uses `pt-28 lg:pl-60`; collection pages should inherit `MainLayout`.
- Use `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for collection cards or agent cards, matching existing home/suites/workflow grids.
- Sidebar Collections should remain visible in the pinned sidebar.

## Tablet

- At `md` but below `lg`, top navbar shows desktop nav links, but the sidebar remains off-canvas unless opened.
- Collection pages should not depend on a permanently visible sidebar at tablet widths.
- Header action rows should wrap cleanly, like existing workflow page buttons.

## Mobile

- Sidebar is off-canvas with overlay and a 240px panel.
- Top nav has two controls: sidebar toggle and navigation menu toggle.
- Collection cards should be single-column.
- Page headers should stack title/subtitle and primary action if horizontal space is tight.
- Modals should use full-width-with-padding (`p-4`, `max-w-md`) like the shortcuts modal.

# Components That Can Be Reused

- `src/components/Sidebar.jsx`: sidebar structure, search block, section/link styling, active nav treatment, mobile overlay behavior.
- `src/components/Navbar.jsx`: responsive top navigation and existing mobile menu behavior.
- `src/components/AgentCard.jsx`: full agent cards for collection detail pages.
- `src/components/KeyboardShortcutsModal.jsx`: modal shell pattern for create/rename/delete dialogs.
- `src/components/CustomSelect.jsx`: dropdown behavior for collection picker/select controls.
- `src/components/RecentRuns.jsx`: empty state card styling and compact action-button patterns.
- `src/pages/WorkflowLibrary.jsx`: header/action layout, search styling, card density, loading/error/empty-state patterns.
- `src/pages/HomePage.jsx`: agent registry grid, Favorites section pattern, search/filter layout.
- `src/pages/SuitesPage.jsx`: collection-card-like grid cards and colored count badges.
- `src/components/SuiteWizard.jsx`: back button/header pattern and compact result cards if a lighter agent list is ever needed.
