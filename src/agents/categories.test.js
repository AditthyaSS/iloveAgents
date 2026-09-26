import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '../agents/categories.js';

describe('Agent Categories', () => {
  it('should define expected category constants', () => {
    expect(CATEGORIES).toBeDefined();
    expect(typeof CATEGORIES).toBe('object');
    expect(Object.keys(CATEGORIES).length).toBeGreaterThan(0);
  });
});
