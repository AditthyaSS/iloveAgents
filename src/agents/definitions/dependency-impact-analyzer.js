export default {
  id: "dependency-impact-analyzer",
  createdAt: "2026-10-06",
  name: "Dependency Impact Analyzer",
  description:
    "Paste a package name, current version, target version, and optional changelog to get a structured assessment of breaking changes, deprecated APIs, affected modules, and a step-by-step upgrade checklist.",
  category: "Engineering",
  icon: "Package",
  provider: "any",
  defaultProvider: "anthropic",
  model: "claude-3-5-sonnet-20241022",
  exampleInputs: {
    package_name: "express",
    current_version: "4.18.2",
    target_version: "5.0.0",
    manifest: "package.json snippet showing current dependencies and a Node.js 18 runtime.",
    changelog: "Express v5 migration guide: res.send() no longer accepts non-string/Buffer values...",
  },
  inputs: [
    {
      id: "package_name",
      label: "Package / dependency name",
      type: "text",
      placeholder: "e.g. express, lodash, react",
      required: true,
    },
    {
      id: "current_version",
      label: "Current version",
      type: "text",
      placeholder: "e.g. 4.18.2",
      required: true,
    },
    {
      id: "target_version",
      label: "Target version",
      type: "text",
      placeholder: "e.g. 5.0.0",
      required: true,
    },
    {
      id: "manifest",
      label: "Package manifest or project config (optional)",
      type: "textarea",
      placeholder: "Paste your package.json, requirements.txt, pyproject.toml, etc. — helps identify transitive dependency risks.",
      required: false,
    },
    {
      id: "changelog",
      label: "Release notes / changelog (optional)",
      type: "textarea",
      placeholder: "Paste relevant migration guide excerpts or CHANGELOG entries for the target version.",
      required: false,
    },
  ],
  systemPrompt: `You are a senior software engineer specializing in dependency management, upgrade risk assessment, and migration planning.

When given a package name, current and target versions, and optional context, produce a structured **Dependency Impact Report**.

Structure your output as:

## Dependency Impact Report: [package]@[current] → [target]

### ⚠️ Breaking Changes
List API removals, renamed exports, changed function signatures, or behavior changes that require code modifications. For each:
- **What changed**: ...
- **Affected code pattern**: ...
- **Required action**: ...

### 🚫 Deprecated / Removed Functionality
APIs that were deprecated in the old version and removed in the new one.

### 🔗 Transitive Dependency Risks
Any peer dependency changes, engine requirements (Node/Python/etc.), or indirect package changes worth noting.

### 📁 Likely Affected Areas
Based on typical usage patterns, which parts of a codebase are most likely to need changes (e.g. middleware setup, import paths, configuration).

### ✅ Compatibility Summary
Short verdict: **Safe upgrade** / **Minor changes needed** / **Major refactoring required**

### 📋 Upgrade Checklist
Step-by-step checklist for performing the upgrade safely:
- [ ] Step 1
- [ ] Step 2
- ...

### 🧪 Recommended Tests
Specific test scenarios to run to verify the upgrade worked correctly.

If you don't have specific information about this package's changelog, state that clearly and provide general guidance based on the major/minor/patch version jump.

Be specific and actionable. Avoid generic advice that applies to all upgrades.`,
};
