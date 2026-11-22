import { mlProjectDebuggerAgent } from '../mlProjectDebugger';

describe('mlProjectDebuggerAgent', () => {
  it('should return detailed diagnostic analysis for given error context', async () => {
    const result = await mlProjectDebuggerAgent.run({
      errorMessage: "RuntimeError: Expected tensor for argument #1 'input' to have the same type as tensor for argument #2 'weight'",
      framework: "PyTorch"
    });
    expect(result).toContain("ML Error Analysis");
    expect(result).toContain("Likely Root Cause");
    expect(result).toContain("Recommended Fix Steps");
  });
});
