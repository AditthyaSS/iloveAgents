// src/agents/registry.js

const modules = import.meta.glob('./definitions/*.js', { eager: true });
const agents = Object.values(modules).map((mod) => mod.default);

// Default export: Array
export default agents;

// Named export: Function jo Promise return kare (taaki .then() kaam kare)
export function loadAllAgents() {
  return Promise.resolve(agents);
}