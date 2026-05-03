 
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import type { ReactNode, JSX } from 'react';

describe('LanguageProvider Fallback', () => {
  it('falls back correctly when changing languages', (): void => {
    const wrapper = ({ children }: { readonly children: ReactNode }): JSX.Element => (
      <LanguageProvider>{children}</LanguageProvider>
    );

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: (): Promise<unknown> => Promise.resolve({ translations: ['ईवीएम सिम्युलेटर'] }),
    });

    const { result } = renderHook(() => useLanguage(), { wrapper });

    expect(result.current.language).toBe('en');
    expect(result.current.strings.simulator_title).toBe('EVM Simulator');

    act((): void => {
      result.current.setLanguage('hi');
    });

    expect(result.current.language).toBe('hi');
  });
});
