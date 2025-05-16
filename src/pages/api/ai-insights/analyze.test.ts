import { describe, it, expect, vi } from 'vitest';
import { POST } from './analyze';

// Manipulujemy importem Supabase
vi.mock('@supabase/supabase-js', () => {
  let mockCampaignResponse = {
    data: {
      id: 'campaign-123',
      name: 'Test Campaign',
      platform_id: 'google'
    },
    error: null
  };
  
  let mockMetricsResponse = {
    data: [
      {
        date: '2024-01-01',
        impressions: 1000,
        clicks: 50,
        spend: 100,
        conversions: 5
      }
    ],
    error: null
  };
  
  let mockInsightResponse = {
    data: {
      id: 'insight-123',
      content: 'This is an AI analysis of the campaign.',
    },
    error: null
  };
  
  const mockFrom = vi.fn((table) => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockInsert = vi.fn().mockReturnThis();
    const mockGte = vi.fn().mockReturnThis();
    const mockLte = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockReturnThis();
    
    // Specjalne implementacje dla różnych tabel
    if (table === 'campaigns') {
      const mockSingle = vi.fn().mockResolvedValue(mockCampaignResponse);
      return {
        select: mockSelect,
        eq: mockEq,
        single: mockSingle
      };
    } else if (table === 'metrics') {
      const mockOrder = vi.fn().mockResolvedValue(mockMetricsResponse);
      return {
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        lte: mockLte,
        order: mockOrder
      };
    } else if (table === 'ai_insights') {
      const mockSingle = vi.fn().mockResolvedValue(mockInsightResponse);
      return {
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle
      };
    }
    
    return {
      select: mockSelect,
      eq: mockEq
    };
  });

  return {
    createClient: vi.fn(() => ({
      from: mockFrom
    })),
    // Eksportujemy dodatkowe funkcje pomocnicze do testów
    _setCampaignResponse: (response) => {
      mockCampaignResponse = response;
    },
    _setMetricsResponse: (response) => {
      mockMetricsResponse = response;
    },
    _setInsightResponse: (response) => {
      mockInsightResponse = response;
    }
  };
});

// Import mocka po jego zdefiniowaniu
import { _setCampaignResponse, _setMetricsResponse, _setInsightResponse } from '@supabase/supabase-js';

// Zachowujemy oryginalny fetch
const originalFetch = global.fetch;

describe('AI Insights Analyze Endpoint', () => {
  beforeEach(() => {
    // Resetujemy mocki 
    vi.resetAllMocks();
    
    // Ustawiamy domyślne wartości dla kampanii
    _setCampaignResponse({
      data: {
        id: 'campaign-123',
        name: 'Test Campaign',
        platform_id: 'google'
      },
      error: null
    });
    
    // Ustawiamy domyślne wartości dla metryk
    _setMetricsResponse({
      data: [
        {
          date: '2024-01-01',
          impressions: 1000,
          clicks: 50,
          spend: 100,
          conversions: 5
        },
        {
          date: '2024-01-02',
          impressions: 1200, 
          clicks: 60,
          spend: 120,
          conversions: 6
        }
      ],
      error: null
    });
    
    // Ustawiamy domyślne wartości dla zapisanego wglądu
    _setInsightResponse({
      data: {
        id: 'insight-123',
        content: 'This is an AI analysis of the campaign.'
      },
      error: null
    });
    
    // Mockujemy fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'This is an AI analysis of the campaign.'
          }
        }]
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    global.fetch = originalFetch;
  });

  it('should return 400 if campaign_id is missing', async () => {
    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });

    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required parameter: campaign_id');
  });

  it('should return 404 if campaign is not found', async () => {
    // Ustawiamy odpowiedź dla brakującej kampanii
    _setCampaignResponse({
      data: null,
      error: { message: 'Not found' }
    });

    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaign_id: 'non-existent-id' })
    });

    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Campaign not found');
  });

  it('should process campaign data and call OpenRouter API', async () => {
    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: 'campaign-123',
        date_range_start: '2024-01-01',
        date_range_end: '2024-01-31'
      })
    });

    const response = await POST({ request } as any);
    const data = await response.json();

    // Verify response
    expect(response.status).toBe(200);
    expect(data.data.content).toBe('This is an AI analysis of the campaign.');
    expect(data.data.campaign_name).toBe('Test Campaign');

    // Verify OpenRouter API was called
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchCall = (global.fetch as any).mock.calls[0];
    expect(fetchCall[0]).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(fetchCall[1].method).toBe('POST');
    
    const body = JSON.parse(fetchCall[1].body);
    expect(body.model).toBe('gpt-3.5-turbo');
    expect(body.messages.length).toBe(2);
  });

  it('should handle OpenRouter API errors', async () => {
    // Mockujemy błąd OpenRouter API
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'OpenRouter API Error' })
    });

    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: 'campaign-123',
        date_range_start: '2024-01-01',
        date_range_end: '2024-01-31'
      })
    });

    const response = await POST({ request } as any);
    const data = await response.json();

    // Verify error response
    expect(response.status).toBe(500);
    expect(data.error).toBe('AI analysis failed');
    expect(data.details).toEqual({ error: 'OpenRouter API Error' });
  });

  it('should handle general errors during processing', async () => {
    // Symulujemy błąd parsowania JSON
    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Nadpisujemy metodę json, aby wyrzuciła błąd
    request.json = vi.fn().mockRejectedValue(new Error('JSON parsing error'));

    const response = await POST({ request } as any);
    const data = await response.json();

    // Verify error response dla ogólnego błędu
    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });
}); 