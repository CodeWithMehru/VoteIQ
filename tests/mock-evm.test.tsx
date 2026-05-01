import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MockEVM from '@/components/MockEVM';

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    loginAnonymously: vi.fn().mockResolvedValue({ uid: 'mock-uid' }),
  })
}));

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ receipt: 'MOCK-RECEIPT' }),
  })
) as jest.Mock;

describe('MockEVM Component', () => {
  it('renders the initial verification step', () => {
    render(<MockEVM />);
    expect(screen.getByText('ID Verification')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Voter ID Number')).toBeInTheDocument();
  });

  it('navigates to voting step when valid ID is entered', () => {
    render(<MockEVM />);
    
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Voter ID Number'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText('Verify & Proceed'));
    
    expect(screen.getByText('Digital Ballot')).toBeInTheDocument();
  });

  it('renders candidate buttons with correct labels', () => {
    render(<MockEVM />);
    
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Voter ID Number'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText('Verify & Proceed'));
    
    expect(screen.getByText('Candidate X')).toBeInTheDocument();
    expect(screen.getByText('Candidate Y')).toBeInTheDocument();
    expect(screen.getByText('Candidate Z')).toBeInTheDocument();
  });

  it('shows confirmation screen after voting', async () => {
    render(<MockEVM />);
    
    // Verify
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Voter ID Number'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText('Verify & Proceed'));
    
    // Vote
    const voteButton = screen.getAllByRole('button')[0]; // Vote for Candidate X
    fireEvent.click(voteButton);
    
    await waitFor(() => {
      expect(screen.getByText('Vote Cast Successfully!')).toBeInTheDocument();
    });
  });

  it('allows starting a new simulation from the receipt screen', async () => {
    render(<MockEVM />);
    
    // Verify
    fireEvent.change(screen.getByLabelText('Full Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Voter ID Number'), { target: { value: 'ABC12345' } });
    fireEvent.click(screen.getByText('Verify & Proceed'));
    
    // Vote
    fireEvent.click(screen.getAllByRole('button')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Change Vote or Start New Simulation')).toBeInTheDocument();
    });
    
    // Reset
    fireEvent.click(screen.getByText('Change Vote or Start New Simulation'));
    expect(screen.getByText('ID Verification')).toBeInTheDocument();
  });
});
