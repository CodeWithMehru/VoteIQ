 
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MockEVM from '@/components/MockEVM';
import { LanguageProvider } from '@/lib/i18n';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: (): { loginAnonymously: () => Promise<{ uid: string }>; logout: () => void } => ({
    loginAnonymously: vi.fn().mockResolvedValue({ uid: 'mock-uid' }),
    logout: vi.fn(),
  }),
}));

// Mock useHashWorker
vi.mock('@/hooks/useHashWorker', () => ({
  useHashWorker: (): { generateVVPAT: () => Promise<{ hash: string; fullHash: string }>; isHashing: boolean } => ({
    generateVVPAT: vi.fn().mockResolvedValue({ hash: 'HASH123', fullHash: 'MOCK-RECEIPT' }),
    isHashing: false,
  }),
}));

// Mock fetch
 
global.fetch = vi.fn((): Promise<Response> =>
  Promise.resolve({
    ok: true,
    json: (): Promise<unknown> => Promise.resolve({ success: true, data: { receipt: 'MOCK-RECEIPT', verificationHash: 'HASH123' } }),
  } as Response)
) as unknown as typeof fetch;

describe('MockEVM Component', () => {
  beforeEach((): void => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach((): void => {
    cleanup();
  });

  it('renders the initial verification step', (): void => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );
    expect(screen.getByText('EVM Simulator')).toBeInTheDocument();
    expect(screen.getByLabelText('Voter ID')).toBeInTheDocument();
  });

  it('navigates to voting step when valid ID is entered', (): void => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('ABC12345'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText(/Verify & Proceed/i));

    expect(screen.getByRole('group', { name: /Candidate Selection/i })).toBeInTheDocument();
  });

  it('renders candidate buttons with correct labels', (): void => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('ABC12345'), { target: { value: '123456' } });
    fireEvent.click(screen.getByText(/Verify & Proceed/i));

    expect(screen.getByText('Party A')).toBeInTheDocument();
    expect(screen.getByText('Party B')).toBeInTheDocument();
    expect(screen.getByText('Party C')).toBeInTheDocument();
  });

  it('shows confirmation screen and verifiability hash after voting', async (): Promise<void> => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('ABC12345'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText(/Verify & Proceed/i));

    const voteButton = screen.getByLabelText(/Vote for Party A/i);
    fireEvent.click(voteButton);

    expect(await screen.findByText(/Vote Cast Successfully/i)).toBeInTheDocument();
    expect(screen.getByText(/VVPAT Digital Signature/i)).toBeInTheDocument();
    expect(screen.getByText(/HASH123/i)).toBeInTheDocument();
  });
});
