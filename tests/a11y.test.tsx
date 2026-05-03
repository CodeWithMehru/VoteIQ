 
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import MockEVM from '@/components/MockEVM';
import { LanguageProvider } from '@/lib/i18n';

expect.extend(toHaveNoViolations);

describe('Accessibility Test Suite', () => {
  it('MockEVM should have no WCAG violations', async () => {
    const { container } = render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
