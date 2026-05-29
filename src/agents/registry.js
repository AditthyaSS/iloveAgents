// ============================================================
// I LOVE AGENTS — Agent Registry
// ============================================================
//
// To contribute an agent: create a new file in ./definitions/
// with `export default { ...agentConfig }`, and it will be
// auto-collected here. See CONTRIBUTING.md for full guidelines.
//
// ============================================================
import { AgentSchema } from './schema';

// Eagerly load the modules, or load them lazily depending on your current setup
const agentModules = import.meta.glob('./definitions/*.js', { eager: true });

export const loadAgents = () => {
  const validAgents = [];

  for (const path in agentModules) {
    const module = agentModules[path];
    
    // Assuming the agent definition is the default export
    const agentDefinition = module.default;

    try {
      // Validate the definition
      const validAgent = AgentSchema.parse(agentDefinition);
      validAgents.push(validAgent);
    } catch (error) {
      // Graceful Degradation: Log the error but don't crash the app
      console.error(`🚨 Failed to load agent at ${path}:`, error.errors || error.message);
    }
  }

  return validAgents;
};
