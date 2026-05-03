import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import MockEVM from '@/components/MockEVM';
import { LanguageProvider } from '@/lib/i18n';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    loginAnonymously: vi.fn().mockResolvedValue({ uid: 'mock-uid' }),
    logout: vi.fn(),
  }),
}));

// Mock useHashWorker
vi.mock('@/hooks/useHashWorker', () => ({
  useHashWorker: () => ({
    generateVVPAT: vi.fn().mockResolvedValue({ hash: 'HASH123', fullHash: 'MOCK-RECEIPT' }),
    isHashing: false,
  }),
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: { receipt: 'MOCK-RECEIPT', verificationHash: 'HASH123' } }),
  })
) as Mock;

describe('MockEVM Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the initial verification step', () => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );
    expect(screen.getByText('ID Verification')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Voter ID Number')).toBeInTheDocument();
  });

  it('navigates to voting step when valid ID is entered', () => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('ABC1234567'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText(/Verify & Proceed/i));

    expect(screen.getByRole('heading', { name: /Digital Ballot/i })).toBeInTheDocument();
  });

  it('renders candidate buttons with correct labels', () => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'John' } });
    fireEvent.change(screen.getByPlaceholderText('ABC1234567'), { target: { value: '12345' } });
    fireEvent.click(screen.getByText(/Verify & Proceed/i));

    expect(screen.getByText('Candidate X')).toBeInTheDocument();
    expect(screen.getByText('Candidate Y')).toBeInTheDocument();
    expect(screen.getByText('Candidate Z')).toBeInTheDocument();
  });

  it('shows confirmation screen and verifiability hash after voting', async () => {
    render(
      <LanguageProvider>
        <MockEVM />
      </LanguageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Jane Doe'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('ABC1234567'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText(/Verify & Proceed/i));

    const voteButton = screen.getByLabelText(/Vote for Candidate X/i);
    fireEvent.click(voteButton);

    expect(await screen.findByText(/Vote Cast Successfully/i)).toBeInTheDocument();
    expect(screen.getByText(/Verifiability Hash/i)).toBeInTheDocument();
    expect(screen.getByText(/HASH123/i)).toBeInTheDocument();
  });
});
