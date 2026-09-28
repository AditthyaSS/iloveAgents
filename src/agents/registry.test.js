import { describe, it, expect } from 'vitest';
import { loadAgents, deduplicateAgents } from '../agents/registry.js';

describe('Agent Registry', () => {
  it('should load agents correctly', () => {
    const agents = loadAgents();
    expect(Array.isArray(agents)).toBe(true);
  });

  it('should deduplicate agents based on unique identifiers', () => {
    const sampleAgents = [
      { id: 'agent-1', name: 'Alpha' },
      { id: 'agent-2', name: 'Beta' },
      { id: 'agent-1', name: 'Alpha Duplicate' },
    ];

    const uniqueAgents = deduplicateAgents(sampleAgents);
    expect(uniqueAgents).toHaveLength(2);
    expect(uniqueAgents.map(a => a.id)).toEqual(['agent-1', 'agent-2']);
  });
});
