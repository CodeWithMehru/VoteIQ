import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '@/lib/i18n';

describe('LanguageProvider Fallback', () => {
  it('falls back correctly when changing languages', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <LanguageProvider>{children}</LanguageProvider>;

    // Mock fetch for translation
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ translations: ['ईवीएम सिम्युलेटर'] }),
    });

    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.strings.simulator_title).toBe('Interactive EVM Simulator');

    act(() => {
      result.current.setLanguage('hi');
    });

    expect(result.current.language).toBe('hi');
    expect(result.current.strings.simulator_title).toBe('ईवीएम सिम्युलेटर');
  });
});
