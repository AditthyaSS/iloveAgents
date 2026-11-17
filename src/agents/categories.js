
// ============================================================
// I LOVE AGENTS — Agent Categories
// ============================================================
//
// Centralized list of unique agent categories.
// Categories are validated, deduplicated, and sorted.
// ============================================================

const RAW_CATEGORIES = [
  "Business",
  "Content Writing",
  "Cybersecurity",
  "Data Science",
  "Design",
  "Developer Tools",
  "Education",
  "Engineering",
  "Finance",
  "HR",
  "Legal",
  "Marketing",
  "Personal Development",
  "Product",
  "Productivity",
  "Research",
  "Healthcare",
  "Sales",
  "DevOps",
  "Web3",
  "Gaming",
  "Real Estate",
];

// Remove invalid entries, trim whitespace,
// eliminate duplicates, and sort alphabetically.
export const CATEGORIES = Object.freeze(
  [...new Set(
    RAW_CATEGORIES
      .filter(
        (category) =>
          typeof category === "string" &&
          category.trim().length > 0
      )
      .map((category) => category.trim())
  )].sort((a, b) => a.localeCompare(b))
);
