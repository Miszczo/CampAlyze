import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AIAnalysisButton from './AIAnalysisButton';

// Mock fetch API
global.fetch = vi.fn();

describe('AIAnalysisButton component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders analyze button initially', () => {
    render(<AIAnalysisButton campaignId="test-campaign-id" />);
    
    expect(screen.getByRole('button', { name: /analyze campaign performance/i })).toBeInTheDocument();
  });

  it('shows loading state when analyzing', async () => {
    // Mock fetch to delay resolution
    (global.fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => {
        resolve({
          ok: true,
          json: async () => ({
            data: {
              content: 'Analysis content',
              campaign_name: 'Test Campaign'
            }
          })
        });
      }, 100))
    );

    render(<AIAnalysisButton campaignId="test-campaign-id" />);
    
    // Click analyze button
    fireEvent.click(screen.getByRole('button', { name: /analyze campaign performance/i }));
    
    // Check for loading state
    expect(screen.getByText(/analyzing campaign data/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows analysis results after successful API call', async () => {
    // Mock successful response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          content: 'This is the AI analysis of the campaign.',
          campaign_name: 'Test Campaign'
        }
      })
    });

    render(<AIAnalysisButton campaignId="test-campaign-id" />);
    
    // Click analyze button
    fireEvent.click(screen.getByRole('button', { name: /analyze campaign performance/i }));
    
    // Wait for the results to be displayed
    await waitFor(() => {
      expect(screen.getByText('AI Analysis for Test Campaign')).toBeInTheDocument();
      expect(screen.getByText('This is the AI analysis of the campaign.')).toBeInTheDocument();
    });
    
    // Verify fetch was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith('/api/ai-insights/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: 'test-campaign-id',
        date_range_start: undefined,
        date_range_end: undefined,
      }),
    });
  });

  it('shows error message when API call fails', async () => {
    // Mock failed response
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({
        error: 'API Error'
      })
    });

    render(<AIAnalysisButton campaignId="test-campaign-id" />);
    
    // Click analyze button
    fireEvent.click(screen.getByRole('button', { name: /analyze campaign performance/i }));
    
    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByText(/error: api error/i)).toBeInTheDocument();
    });
  });

  it('passes date range parameters to API call', async () => {
    // Mock successful response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          content: 'Analysis with date range',
          campaign_name: 'Test Campaign'
        }
      })
    });

    render(
      <AIAnalysisButton 
        campaignId="test-campaign-id" 
        dateRangeStart="2024-01-01" 
        dateRangeEnd="2024-01-31" 
      />
    );
    
    // Click analyze button
    fireEvent.click(screen.getByRole('button', { name: /analyze campaign performance/i }));
    
    // Wait for the results to appear
    await waitFor(() => {
      expect(screen.getByText(/analysis with date range/i)).toBeInTheDocument();
    });
    
    // Verify date range parameters were passed
    expect(global.fetch).toHaveBeenCalledWith('/api/ai-insights/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: 'test-campaign-id',
        date_range_start: '2024-01-01',
        date_range_end: '2024-01-31',
      }),
    });
  });
}); 