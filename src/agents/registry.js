// ============================================================
// I LOVE AGENTS — Agent Registry (Lazy-loaded)
// ============================================================
//
// To contribute an agent: create a new file in ./definitions/
// with `export default { ...agentConfig }`, and it will be
// auto-collected here. See CONTRIBUTING.md for full guidelines.
//
// Agent definitions are collected via Vite's import.meta.glob.
// A default synchronous export is kept for existing app screens,
// while loadAllAgents() remains available for context-based consumers.
// ============================================================

const modules = import.meta.glob('./definitions/*.js', { eager: true });
const agents = Object.values(modules).map((mod) => mod.default);

/**
 * Load all agent definitions and return the array.
 * Results are cached after the first call.
 * @returns {Promise<Array>} Array of agent definition objects.
 */
let cachedAgentsPromise = null;

export function loadAllAgents() {
  if (cachedAgentsPromise) return cachedAgentsPromise;

  cachedAgentsPromise = Promise.resolve(agents);

  return cachedAgentsPromise;
}

export default agents;
