# Smart Agent Recommendation Wizard: Codebase Overview

## Documentation audit status

- Previous `01-codebase-overview.md`: **completely outdated**. It described planning for Agent Collections rather than the Smart Agent Recommendation Wizard.
- Previous `02-feature-architecture.md`: **completely outdated**. It designed a localStorage-backed Collections feature.
- Previous `03-implementation-roadmap.md`: **completely outdated**. It contained Collections implementation phases and historical merge notes.
- Previous `04-file-map.md`: **completely outdated**. It mapped Collections files, some of which now already exist in the app.
- Previous `05-qa-checklist.md`: **completely outdated**. It focused on Collections CRUD QA instead of recommendations.
- Previous `06-ui-analysis.md`: **partially outdated/redundant**. It had useful observations about sidebar/cards/suites, but it was framed around Collections and duplicated content now captured here.
- Previous `07-component-reuse.md`: **partially outdated/redundant**. It had reusable UI observations, but it was Collections-specific and is now superseded by the required planning docs.

## Current tech stack

- **Vite + React 18** single-page app. `src/main.jsx` mounts `App` inside `BrowserRouter` and `AgentsProvider`.
- **React Router v6** powers route definitions in `src/App.jsx` with `Routes`, nested layout routes, `Outlet`, `NavLink`, `Link`, `useNavigate`, and `useParams`.
- **Tailwind CSS** is the styling system. Theme tokens are configured in `tailwind.config.js`, global resets/animations live in `src/index.css`, and components use utility classes directly.
- **JavaScript / JSX only**. There is no TypeScript config; shared data shapes are implicit objects or documented by comments.
- **lucide-react** supplies icons. Agent definitions store icon names as strings and renderers resolve them through `import * as Icons from 'lucide-react'`.
- **react-markdown**, **remark-gfm**, and **react-syntax-highlighter** support output rendering in the runner.
- **Supabase client** exists for workflows only through `src/lib/supabase.js` and `src/hooks/useWorkflows.js`. The recommendation wizard should not depend on Supabase for its initial implementation.

## Folder structure

- `src/agents/`
  - `registry.js`: discovers agent definition modules, normalizes duplicates/missing IDs, lazy-loads all definitions with `loadAllAgents()`, and exports an eager default list for synchronous consumers.
  - `definitions/*.js`: one default-exported agent config per agent.
  - `categories.js`: static category list, but the homepage/sidebar derive categories from loaded agent configs.
- `src/components/`
  - Layout/navigation: `Navbar.jsx`, `Sidebar.jsx`, `Logo.jsx`, `CustomCursor.jsx`, `ScrollToTop.jsx`, `ScrollToBottom.jsx`.
  - Agent browsing/running: `AgentCard.jsx`, `AgentCardSkeleton.jsx`, `AgentRunner.jsx`, `BatchModeRunner.jsx`, `OutputRenderer.jsx`, `RecentRuns.jsx`, `ApiKeyBar.jsx`, `ApiKeyInfo.jsx`.
  - Collections UI: `CollectionModal.jsx`, `CollectionPicker.jsx`, `components/collections/CollectionAgentPicker.jsx`.
  - Utility UI: `CustomSelect.jsx`, `KeyboardShortcutsModal.jsx`, `ErrorBoundary.jsx`, `ErrorCard.jsx`, `VoiceInput.jsx`, `RunRating.jsx`.
- `src/pages/`
  - Route-level pages: `HomePage.jsx`, `AgentPage.jsx`, `SuitesPage.jsx`, `CollectionsPage.jsx`, `CollectionDetailPage.jsx`, workflow pages, scheduler page, battle mode pages, and `NotFoundPage.jsx`.
- `src/lib/`
  - Browser state hooks/utilities: `useAgents.jsx`, `useFavorites.js`, `useCollections.js`, `useHistory.js`, `useApiKey.js`, `useScheduler.js`, `useDocumentTitle.js`.
  - LLM/model helpers: `llmAdapter.js`, `resolveAgentModel.js`, `modelAnalyser.js`, `batchRunner.js`, `customSuiteGenerator.js`.
- `src/hooks/`
  - `useKeyboardShortcuts.js` and Supabase workflow hooks.
- `src/suites/`
  - `suitesData.js`: curated suite definitions and quiz metadata.

## Routing

`src/App.jsx` has two route groups:

1. **Battle mode routes outside the main layout**: `/battle`, `/battle/setup`, `/battle/arena`, `/battle/winner`.
2. **Main layout routes inside `MainLayout`** with `Navbar`, `Sidebar`, `CustomCursor`, and `<main className="pt-28 lg:pl-60">`:
   - `/` → `HomePage`
   - `/agent/:id` → `AgentPage`
   - `/suites` → `SuitesPage`
   - `/collections` → `CollectionsPage`
   - `/collections/:id` → `CollectionDetailPage`
   - `/scheduler` → `SchedulerPage`
   - `/workflows`, `/workflows/build`, `/workflows/:id`, `/workflows/:id/run`
   - `*` → `NotFoundPage`

A recommendation wizard can integrate without adding a new route by using a homepage modal/panel. A route such as `/recommend` is possible, but would require explicit route and nav changes.

## Homepage architecture

`src/pages/HomePage.jsx` owns the current browse experience:

- Loads agents with `loadAllAgents()` into local state and shows `AgentCardSkeleton` while loading.
- Maintains local UI state for `searchQuery`, `selectedCategory`, category dropdown open/focus state, and refs for keyboard-accessible category selection.
- Derives `allCategories`, `categoryCounts`, `dropdownOptions`, `recentAgents`, `favoriteAgents`, and `filteredAgents` with `useMemo`.
- Uses `useFavorites()` for favorites and `useHistory()` for recent runs shown by `RecentRuns`.
- Uses `useKeyboardShortcuts()` so `/` focuses the search box.
- Renders, in order: hero/CTA, stats, optional favorites, optional recently used, search/category filter, agent grid, empty state, and a right-column area for recent runs / workflow CTA further down the file.

The wizard entry point should be added near the hero/search area so it complements browsing and does not hide existing Favorites/Recent sections.

## Agent Grid and cards

- The primary grid lives in `HomePage.jsx` and renders `AgentCard` for `filteredAgents`.
- Grid classes are responsive: generally `grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3` in the homepage content area.
- `src/components/AgentCard.jsx` renders the full-card link to `/agent/${agent.id}` with icon, category badge, provider badge, optional “New” badge, favorite star, collection picker button, and `Run` affordance.
- `AgentCard` is used across homepage, favorites, recently used, and collection detail pages, so wizard-specific result cards should not require changing `AgentCard` unless recommendation metadata needs to be shown directly on existing cards.

## Agent registry and data flow

- `src/agents/registry.js` is the source of truth for agent definitions.
- `loadAllAgents()` uses lazy `import.meta.glob('./definitions/*.js', { eager: false })`, caches the promise in `cachedAgentsPromise`, resolves default exports, and filters invalid/duplicate IDs.
- The same file exports an eager default `agents` list for synchronous use.
- `src/lib/useAgents.jsx` provides `AgentsProvider` and `useAgents()` context, mounted in `src/main.jsx`.
- Current code is mixed: `HomePage.jsx`, `AgentPage.jsx`, and `Sidebar.jsx` call `loadAllAgents()` directly; Collections pages use `useAgents()`.
- Agent IDs are stable references used by suites, favorites, recent agents, history, collections, workflow chaining, and runner navigation.

Recommendation logic should accept the loaded `agents` array and return agent IDs plus metadata rather than copying agent objects into persistent state.

## Search and filtering flow

- Homepage search filters by lowercase `agent.name`, `agent.description`, and `agent.category`.
- Homepage category filter is a custom dropdown derived from actual loaded agent categories and counts.
- `showingFiltered` is true when there is a search query or selected category. Favorites and recently used sections hide while filtering.
- Sidebar search in `src/components/Sidebar.jsx` is independent and filters agents by name/category only. It does not affect homepage search state.
- `src/components/collections/CollectionAgentPicker.jsx` has its own search/checklist behavior for adding agents to collections.

Recommendation results should not mutate the existing search/filter state unless a deliberate “show these recommendations in the grid” interaction is designed.

## Favorites flow

- `src/lib/useFavorites.js` stores favorite agent IDs under localStorage key `ila_favorites`.
- The hook returns `{ favorites, isFavorite, toggleFavorite }`.
- A module-level `listeners` set keeps multiple hook consumers synchronized after local mutations.
- `AgentCard.jsx` toggles favorites from a star button while preventing card navigation.
- `HomePage.jsx` resolves favorite IDs to loaded agents and renders “Your Favorites” only when not searching/filtering.

The wizard should treat favorites as optional context only. It should not write to `ila_favorites` unless the user explicitly favorites a recommended card through existing UI.

## Suites flow

- `src/suites/suitesData.js` contains curated suites with `id`, `name`, `icon`, `description`, `color`, `agents`, and `quiz` fields.
- `src/pages/SuitesPage.jsx` has browse and active-suite quiz states on the same `/suites` route.
- `src/components/SuiteWizard.jsx` scores tags from suite quiz answers and links users to agents.
- `SuitesPage.jsx` also includes a beta “Build Your Own Suite” generator that calls `generateCustomSuite()` and requires an API key.
- Suites are maintainer-defined and not user-editable.

The Smart Agent Recommendation Wizard should be separate from suites: it can reuse quiz/result patterns conceptually, but it should not mutate `suitesData.js` or depend on suite-specific agent lists.

## Collections flow

Collections are present in the current repository:

- `src/lib/useCollections.js` stores collections in localStorage key `ila_agent_collections`.
- Limits are `MAX_COLLECTIONS = 10` and `MAX_AGENTS_PER_COLLECTION = 15`.
- Collection shape is `{ id, name, agentIds, createdAt, updatedAt }`.
- The hook exposes create/delete/rename/add/remove/get/membership helpers and synchronizes consumers through a module-level listener set.
- `src/pages/CollectionsPage.jsx` displays collection overview cards with preview agent names from `useAgents()`.
- `src/pages/CollectionDetailPage.jsx` renders contained agents as `AgentCard`s and uses `CollectionAgentPicker` to add/remove agents.
- `src/components/AgentCard.jsx` exposes a `FolderPlus` action that opens `CollectionPicker` for adding the current agent.
- `src/components/Sidebar.jsx` renders a Collections section below Suites with collection links and count badges.

The wizard should preserve collections behavior. Optional future integration could offer “save recommendations as a collection,” but that is outside the first implementation plan.

## Agent Runner flow

- `/agent/:id` renders `src/pages/AgentPage.jsx`.
- `AgentPage` loads all agents, finds the route ID, writes that ID to `recentAgents` in localStorage, and renders `AgentRunner` keyed by agent ID.
- `src/components/AgentRunner.jsx` owns provider/API key state, input state, output/streaming/error/loading state, prompt playground state, model analyzer state, scheduler modal state, and batch mode state.
- Agent inputs support `text`, `textarea`, `code`, `select`, and `multiselect` rendering.
- Runs call `streamAgent()` and save completed runs through `useHistory()`.
- Runner integrations include API key bar, output renderer, model analysis, scheduling, batch runner, voice input, suggested chains, and workflow handoff.

Recommendation results should navigate to existing `/agent/:id` pages rather than invoking the runner directly.

## Sidebar and navigation

- `Navbar.jsx` top nav links: Agents (`/`), Suites (`/suites`), Workflows (`/workflows`), Battle (`/battle`). Collections are not currently in the top nav.
- `Sidebar.jsx` order: header/search, Suites link, Collections block, Scheduler link, divider, category accordions, footer links.
- Sidebar category collapsed state persists under `sidebar-category-collapsed-state`.
- Sidebar loads agents directly with `loadAllAgents()` and collections with `useCollections()`.
- On mobile below `lg`, sidebar is off-canvas with an overlay and is toggled from the navbar.

A wizard entry can live on the homepage without sidebar changes. If a dedicated route is chosen, update both `App.jsx` and navigation intentionally.

## Existing hooks/stores/context

- `useAgents()` context for loaded agents.
- `useFavorites()` localStorage-backed favorites.
- `useCollections()` localStorage-backed collections.
- `useHistory()` localStorage-backed run history.
- `useApiKey()` sessionStorage-backed provider API keys.
- `useScheduler()` scheduler persistence.
- `useKeyboardShortcuts()` global key handling.
- `useDocumentTitle()` page title handling.
- `useWorkflows()` Supabase-backed workflow data.

There is no existing global store for wizard state; implement wizard state locally or in a dedicated hook when the feature is built.

## localStorage/sessionStorage usage

- `ila_theme`: theme preference in `Navbar.jsx`.
- `ila_favorites`: ordered favorite agent IDs in `useFavorites.js`.
- `recentAgents`: recent agent IDs, written by `AgentPage.jsx` and read by `HomePage.jsx`.
- `iloveAgents_history`: recent run history in `useHistory.js`.
- `ila_agent_collections`: user collections in `useCollections.js`.
- `sidebar-category-collapsed-state`: sidebar category collapsed map in `Sidebar.jsx`.
- `ila_apikey_${provider}`: sessionStorage API keys in `useApiKey.js`.

The recommendation wizard should not persist answers in v1 unless product requirements explicitly ask for resume/history. If persistence is later needed, use a namespaced `ila_` key and treat it as UI preference/history, not source-of-truth data.

## UI and responsive conventions

- Components use Tailwind utilities directly; there is no shared component library.
- Common visual language: rounded cards, borders, `bg-white` + dark `dark:bg-surface-card`, accent `#6366f1`, muted text, count badges, hover transforms/shadows, and `animate-fade-in` / `premium-section` animations.
- Layouts inherit `MainLayout` padding (`pt-28 lg:pl-60`) and page-local responsive grids.
- Mobile uses stacked layouts, single-column grids, wrapped header actions, and off-canvas sidebar.
- Modals should follow `KeyboardShortcutsModal.jsx` and `CollectionModal.jsx` patterns: fixed overlay, centered panel, rounded border, `z-[100]`, escape/click close where appropriate.
