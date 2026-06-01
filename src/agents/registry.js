// ============================================================
// I LOVE AGENTS — Agent Registry
// ============================================================
//
// To contribute an agent: create a new file in ./definitions/
// with `export default { ...agentConfig }`, and it will be
// auto-collected here. See CONTRIBUTING.md for full guidelines.
//
// ============================================================

const modules = import.meta.glob('./definitions/*.js', { eager: true });

const agents = Object.values(modules).map((mod) => mod.default);

const seenIds = new Set();
agents.forEach((agent) => {
  if (seenIds.has(agent.id)) {
    throw new Error(`Duplicate agent ID detected: ${agent.id}`);
  }
  seenIds.add(agent.id);
});

export default agents;
