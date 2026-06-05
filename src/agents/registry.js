const modules = import.meta.glob('./definitions/*.js', { eager: true });

const agents = Object.values(modules)
  .map((mod) => mod?.default)
  .filter(Boolean);

export default agents;

export function loadAllAgents() {
  return Promise.resolve(agents);
}