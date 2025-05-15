import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './analyze';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockSelect = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockGte = vi.fn().mockReturnThis();
  const mockLte = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockSingle = vi.fn();

  return {
    createClient: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        lte: mockLte,
        order: mockOrder,
        insert: mockInsert,
        single: mockSingle
      })
    })
  };
});

// Mock fetch for OpenRouter API calls
global.fetch = vi.fn();

describe('AI Insights Analyze Endpoint', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 if campaign_id is missing', async () => {
    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required parameter: campaign_id');
  });

  it('should return 404 if campaign is not found', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } });
    const mockClient = createClient as unknown as ReturnType<typeof vi.fn>;
    mockClient().from().select().eq().single = mockSingle;

    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ campaign_id: 'non-existent-id' })
    });

    const response = await POST({ request } as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Campaign not found');
  });

  it('should process campaign data and call OpenRouter API', async () => {
    // Mock campaign data
    const mockCampaign = {
      data: {
        id: 'campaign-123',
        name: 'Test Campaign',
        platform_id: 'google'
      },
      error: null
    };

    // Mock metrics data
    const mockMetrics = {
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
    };

    // Mock AI response
    const mockAIResponse = {
      choices: [
        {
          message: {
            content: 'This is an AI analysis of the campaign.'
          }
        }
      ]
    };

    // Mock saved insight
    const mockSavedInsight = {
      data: {
        id: 'insight-123',
        campaign_id: 'campaign-123',
        campaign_name: 'Test Campaign',
        insight_type: 'analysis',
        content: 'This is an AI analysis of the campaign.',
        status: 'active'
      },
      error: null
    };

    // Set up Supabase client mocks
    const mockClient = createClient as unknown as ReturnType<typeof vi.fn>;
    const mockFrom = mockClient().from;
    const mockSelect = mockFrom().select;
    const mockEq = mockSelect().eq;
    
    // Campaign query mock
    mockEq().single.mockResolvedValueOnce(mockCampaign);
    
    // Metrics query mock 
    mockFrom().select().eq().gte().lte().order.mockResolvedValueOnce(mockMetrics);
    
    // Insert insight mock
    mockFrom().insert().select().single.mockResolvedValueOnce(mockSavedInsight);

    // Mock fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockAIResponse
    });

    // Create request
    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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

    // Verify OpenRouter API was called with correct parameters
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const fetchCall = (global.fetch as any).mock.calls[0];
    expect(fetchCall[0]).toBe('https://openrouter.ai/api/v1/chat/completions');
    expect(fetchCall[1].method).toBe('POST');
    
    const body = JSON.parse(fetchCall[1].body);
    expect(body.model).toBe('gpt-3.5-turbo');
    expect(body.messages.length).toBe(2);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].role).toBe('user');
  });

  it('should handle OpenRouter API errors', async () => {
    // Mock campaign and metrics data like above
    const mockCampaign = {
      data: {
        id: 'campaign-123',
        name: 'Test Campaign',
        platform_id: 'google'
      },
      error: null
    };

    const mockMetrics = {
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

    // Set up Supabase client mocks
    const mockClient = createClient as unknown as ReturnType<typeof vi.fn>;
    const mockFrom = mockClient().from;
    const mockSelect = mockFrom().select;
    const mockEq = mockSelect().eq;
    
    // Campaign query mock
    mockEq().single.mockResolvedValueOnce(mockCampaign);
    
    // Metrics query mock 
    mockFrom().select().eq().gte().lte().order.mockResolvedValueOnce(mockMetrics);

    // Mock fetch error response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'OpenRouter API Error' })
    });

    // Create request
    const request = new Request('http://localhost/api/ai-insights/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
}); 