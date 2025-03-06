import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../../pages/Dashboard';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [] })
        })
      })
    })
  }
}));

describe('Dashboard', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('renders vehicle type selection', () => {
    renderDashboard();
    expect(screen.getByText('Two Wheeler')).toBeInTheDocument();
    expect(screen.getByText('Four Wheeler')).toBeInTheDocument();
  });

  it('allows vehicle type selection', async () => {
    renderDashboard();
    const twoWheelerButton = screen.getByText('Two Wheeler').closest('button');
    fireEvent.click(twoWheelerButton!);
    expect(twoWheelerButton).toHaveClass('border-green-500');
  });
});