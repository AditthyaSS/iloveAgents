# Existing Cards To Reuse

- `src/components/AgentCard.jsx`
  - Best fit for collection detail pages because it already includes agent icon, category badge, provider badge, favorite star, hover treatment, and link to `/agent/:id`.
  - Use for the grid of agents inside a collection.

- `src/pages/WorkflowLibrary.jsx` (`WorkflowCard` local component)
  - Useful reference for collection summary cards on `/collections`.
  - Pattern includes icon block, title, short description, pill-like agent list, primary/secondary actions, count metadata, rounded border, hover shadow, and subtle gradient overlay.
  - `WorkflowCard` is local to the page, so it should be copied as a pattern or extracted only if reuse becomes real.

- `src/pages/SuitesPage.jsx` (`SuiteCard` local component)
  - Useful reference for a simple collection card with icon, name, description, count badge, and CTA.
  - It uses suite-specific colors and `rounded-xl`; for user collections, prefer neutral accent styling unless custom collection colors are introduced later.

- `src/components/RecentRuns.jsx`
  - Good reference for compact stacked cards with secondary actions and hover-only delete controls.
  - Also provides the clearest reusable empty-state visual pattern.

# Existing Sidebar Components

- `src/components/Sidebar.jsx`
  - Primary file to integrate the new `Collections` sidebar section.
  - Reuse:
    - `NavLink` active-state pattern.
    - Count badge styling.
    - Divider placement.
    - Category header typography.
    - Mobile overlay and off-canvas behavior.
  - Collections should be added as a separate block, not inside `categories`, because collections are user-defined groupings and must remain separate from Suites/Favorites/category taxonomy.

- `src/components/Navbar.jsx`
  - No collection-specific changes are required unless `/collections` should also appear in top navigation.
  - If top-nav exposure is desired, copy the `navItems` pattern with a Lucide icon and `NavLink`.
  - For Issue #569, sidebar placement is enough to satisfy acceptance criteria.

# Existing Modal/Dialog Components

- `src/components/KeyboardShortcutsModal.jsx`
  - Best existing modal shell for create, rename, and delete confirmation dialogs.
  - Reuse the structure:
    - Full-screen `fixed inset-0 z-[100]`.
    - `bg-black/50 backdrop-blur-sm`.
    - Centered panel with `max-w-md`.
    - `bg-white dark:bg-surface-card`.
    - Border, `rounded-xl`, `shadow-2xl`.
    - Header row with icon/title and close button.
  - It is currently specific to shortcuts, so create a small collection-specific modal component rather than forcing this component to become generic prematurely.

# Existing Dropdown/Menu Components

- `src/components/CustomSelect.jsx`
  - Reuse for select-style collection picking if a simple dropdown is enough.
  - Already supports keyboard navigation, outside-click close, selected state, disabled state, icons, and custom class names.

- `src/pages/HomePage.jsx` category dropdown
  - Good pattern for a count-heavy picker.
  - Use as a reference if the agent card action opens a menu with collection names plus agent counts.
  - This code is currently inline, so avoid duplicating large blocks unless creating a small reusable collection picker.

- `src/components/AgentRunner.jsx`
  - Uses `CustomSelect`, multiselect chips, accordion panels, and compact icon buttons.
  - Reuse its form input classes for collection name fields:
    - Rounded border.
    - `dark:bg-surface-input dark:border-border`.
    - `focus:ring-1 focus:ring-accent focus:border-accent`.

# Existing Button Variants

- Primary CTA
  - Seen in `HomePage`, `WorkflowLibrary`, `AgentRunner`, and `SuiteWizard`.
  - Classes generally follow: `px-4/5 py-2 rounded-lg text-sm font-semibold text-white bg-accent hover:bg-accent-hover active:scale-[0.97/0.98]`.
  - Use for `New Collection`, `Create Collection`, and `Save`.

- Secondary action
  - Seen in `WorkflowLibrary` action buttons and `HomePage` workflow CTA.
  - Classes generally follow: `bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900`, with dark equivalents `dark:bg-surface-input dark:border-border dark:text-text-secondary dark:hover:text-text-primary`.
  - Use for `Cancel`, `Open`, and non-destructive page actions.

- Destructive action
  - Seen in `AgentRunner` clear-chat icon and `RecentRuns` delete/clear controls.
  - Pattern: muted red text by default or on hover, `hover:bg-red-50 dark:hover:bg-red-500/10`.
  - Use for `Delete Collection` and remove-agent controls.

- Icon-only button
  - Seen in `Navbar`, `KeyboardShortcutsModal`, `SuiteWizard`, and `AgentRunner`.
  - Pattern: padded rounded button, muted text, hover background, focus-visible ring where applicable.
  - Use for close, rename, delete, and sidebar collection item actions if compact controls are needed.

# Existing Empty-State Components

- `src/components/RecentRuns.jsx`
  - Best match for no-data panels:
    - Dashed or normal border.
    - Centered icon in `bg-accent/10`.
    - Small bold title.
    - Muted helper text.

- `src/pages/WorkflowLibrary.jsx`
  - Best match for page-level empty/error/loading states:
    - `py-20` centered panel.
    - Accent icon circle.
    - Title, helper text, optional primary CTA.
  - Reuse for `/collections` empty state.

- `src/pages/HomePage.jsx`
  - Search empty state for no matching agents:
    - Rounded bordered card.
    - Accent icon circle.
    - `Clear all filters` text button with icon.
  - Useful if `/collections/:id` later supports searching within collection agents.

# Recommended New Components

- `src/components/CollectionModal.jsx`
  - Create/rename/delete dialog using the shortcuts modal shell pattern.

- `src/components/CollectionCard.jsx`
  - Summary card for `/collections`, based on `WorkflowCard`/`SuiteCard` visual density.

- `src/components/CollectionPicker.jsx`
  - Dropdown or modal for adding the current agent to one or more collections.
  - Start simple: button opens a modal/list if collections can include check states.

- `src/pages/CollectionsPage.jsx`
  - Page-level layout for all collections.

- `src/pages/CollectionDetailPage.jsx`
  - Full `AgentCard` grid for one collection.

# Files To Avoid Reusing Directly

- `src/components/SuiteWizard.jsx`
  - Good visual reference, but its quiz/result logic is suite-specific.

- `src/pages/SuitesPage.jsx`
  - Its `SuiteCard` is local and tightly coupled to suite color/icon data.

- `src/pages/WorkflowLibrary.jsx`
  - Its `WorkflowCard` is local and Supabase/realtime concerns should not leak into localStorage-backed collections.

- `src/lib/useFavorites.js`
  - Good storage/listener pattern to mirror, but collections need a separate key and richer data model to remain independent from Favorites.
