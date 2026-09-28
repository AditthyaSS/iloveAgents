import { describe, it, expect } from 'vitest';
import { resolveAgentModel } from '../lib/resolveAgentModel.js';

describe('resolveAgentModel', () => {
  it('should resolve default model when none is specified', () => {
    const model = resolveAgentModel(null);
    expect(model).toBeDefined();
    expect(typeof model).toBe('string');
  });

  it('should return the explicit model if provided', () => {
    const customModel = 'gpt-4o';
    const model = resolveAgentModel({ model: customModel });
    expect(model).toBe(customModel);
  });
});
