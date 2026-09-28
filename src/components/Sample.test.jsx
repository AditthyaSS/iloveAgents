import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple sample component for testing infrastructure verification
function SampleComponent({ title }) {
  return <div data-testid="sample-title">{title}</div>;
}

describe('SampleComponent', () => {
  it('renders the given title correctly', () => {
    render(<SampleComponent title="I Love Agents" />);
    const titleElement = screen.getByTestId('sample-title');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('I Love Agents');
  });
});
