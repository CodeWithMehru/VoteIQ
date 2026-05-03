import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { describe, it, expect } from 'vitest';
import React from 'react';

// Extend expect with toHaveNoViolations
expect.extend(toHaveNoViolations);

describe('Zenith Fortress: A11y Regression Suite', () => {

  it('should have no accessibility violations in a basic container', async () => {
    const { container } = render(
      <main>
        <h1>Zenith Vote Simulation</h1>
        <button aria-label="Cast Vote">Vote</button>
      </main>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

});
