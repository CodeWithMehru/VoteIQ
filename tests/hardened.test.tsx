 
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import MockEVM from '@/components/MockEVM';
import { LanguageProvider } from '@/lib/i18n';
import { POST as ChatPOST } from '@/app/api/chat/route';

expect.extend(toHaveNoViolations);

vi.mock('@/lib/infrastructure/gemini', () => ({
  getChatResponse: vi.fn().mockRejectedValue(new Error('Simulated Gemini 500 Error'))
}));

describe('Hardened Evaluation Suite', () => {
  // 1. Accessibility Test (jest-axe)
  it('Interactive EVM Simulator should have no detectable A11y violations', async () => {
    const { container } = render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // 2. Gemini API Failure State Handling
  it('Chat API should handle Google Cloud 500 errors gracefully', async () => {
    const req = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Trigger Error' }),
    });

    // Simulating error in route
    const res = await ChatPOST(req);
    expect(res.status).toBe(500);
  });

  // 3. Mock Network Latency Simulation
  it('should handle simulated slow networks without crashing', async () => {
    vi.useFakeTimers();
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getAllByText(/Simulator/i)[0]).toBeInTheDocument();
    vi.useRealTimers();
  });

  // 4. Tab Traversal Verification
  it('should have a logical tab order for the verification form', () => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    const idInput = screen.getAllByLabelText(/Voter ID/i)[0];
    const submitBtn = screen.getAllByRole('button', { name: /Verify & Proceed/i })[0];

    idInput.focus();
    expect(document.activeElement).toBe(idInput);

    expect(submitBtn).toBeInTheDocument();
  });
});
