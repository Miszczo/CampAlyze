import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./metrics"; // Importujemy naszą funkcję GET
import type { APIContext } from "astro";
import type { DashboardMetricsResponse, DashboardMetricsQueryParams, DailyMetricDataPoint } from "../../../types";

const {
  mockSupabaseData,
  mockSupabaseError,
  mockEq,
  mockGte,
  mockLte,
  mockIn,
  // supabaseQueryBuilder, // Możemy go odkomentować, jeśli potrzebujemy testować .then bezpośrednio
  mockSelectFn, // Zmieniona nazwa dla spójności
  mockFromFn, // Zmieniona nazwa dla spójności
} = vi.hoisted(() => {
  const mockSupabaseData = vi.fn();
  const mockSupabaseError = vi.fn();

  const queryBuilderInstance = {
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    then: (callback: (result: { data: any; error: any }) => void) =>
      callback({ data: mockSupabaseData(), error: mockSupabaseError() }),
  };

  const selectFn = vi.fn(() => queryBuilderInstance);
  const fromFn = vi.fn(() => ({ select: selectFn }));

  return {
    mockSupabaseData,
    mockSupabaseError,
    mockEq: queryBuilderInstance.eq,
    mockGte: queryBuilderInstance.gte,
    mockLte: queryBuilderInstance.lte,
    mockIn: queryBuilderInstance.in,
    // supabaseQueryBuilder: queryBuilderInstance,
    mockSelectFn: selectFn,
    mockFromFn: fromFn,
  };
});

vi.mock("../../../db/supabase.client", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../../db/supabase.client")>();
  return {
    ...original,
    supabaseClient: {
      ...original.supabaseClient,
      from: mockFromFn, // Używamy poprawnej nazwy mockFromFn
    },
  };
});

// Mock dla APIContext
const mockAPIContext = (searchParamsValues: Record<string, string | null>): Partial<APIContext> => ({
  url: {
    searchParams: {
      get: (key: string) => (searchParamsValues[key] === undefined ? null : searchParamsValues[key]),
      has: (key: string) => searchParamsValues[key] !== undefined,
      getAll: (key: string) => (searchParamsValues[key] ? [searchParamsValues[key] as string] : []),
    } as URLSearchParams,
    // @ts-ignore
  } as URL,
  // @ts-ignore
  locals: {},
  // @ts-ignore
  request: { headers: new Headers() },
});

describe("GET /api/dashboard/metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseData.mockReturnValue([]);
    mockSupabaseError.mockReturnValue(null);
    mockEq.mockClear().mockReturnThis();
    mockGte.mockClear().mockReturnThis();
    mockLte.mockClear().mockReturnThis();
    mockIn.mockClear().mockReturnThis();
    mockSelectFn.mockClear(); // Resetujemy mockSelectFn
    mockFromFn.mockClear(); // Resetujemy mockFromFn
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Parameter Validation", () => {
    it("should return 400 if organization_id is missing", async () => {
      const context = mockAPIContext({
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
      }) as APIContext;
      const response = await GET(context);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing organization_id parameter");
    });

    it("should return 400 if dateFrom is missing", async () => {
      const context = mockAPIContext({
        organization_id: "org_123",
        dateTo: "2024-01-31",
      }) as APIContext;
      const response = await GET(context);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing dateFrom or dateTo parameters");
    });

    it("should return 400 if dateTo is missing", async () => {
      const context = mockAPIContext({
        organization_id: "org_123",
        dateFrom: "2024-01-01",
      }) as APIContext;
      const response = await GET(context);
      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe("Missing dateFrom or dateTo parameters");
    });

    // TODO: Dodać testy walidacji formatu dat, gdy walidacja zostanie zaimplementowana w endpoincie
  });

  describe("Supabase Query Construction and Data Handling", () => {
    const defaultParams = {
      organization_id: "org_test_123",
      dateFrom: "2024-05-01",
      dateTo: "2024-05-02",
    };

    const mockDbRow = {
      date: "2024-05-01",
      platform_name: "google",
      campaign_id: "campaign_google_1",
      campaign_name: "Google Campaign Alpha",
      impressions: 1000,
      clicks: 100,
      spend: 50,
      conversions: 10,
      revenue: 200,
      cost_per_conversion: 5,
      cpc: 0.5,
      ctr: 0.1,
      roas: 4,
      reach: null, // Symulujemy brak reach i conversion_type z bazy na razie
      conversion_type: null,
      // campaigns: { organization_id: defaultParams.organization_id } // To jest efektem JOIN, nie trzeba mockować bezpośrednio w select
    };

    it("should call Supabase with correct filters", async () => {
      mockSupabaseData.mockReturnValue([mockDbRow]);
      const context = mockAPIContext(defaultParams) as APIContext;
      await GET(context);

      expect(mockFromFn).toHaveBeenCalledWith("campaign_metrics_derived");
      expect(mockSelectFn).toHaveBeenCalledWith(expect.stringContaining("campaigns!inner(organization_id)"));
      expect(mockEq).toHaveBeenCalledWith("campaigns.organization_id", defaultParams.organization_id);
      expect(mockGte).toHaveBeenCalledWith("date", defaultParams.dateFrom);
      expect(mockLte).toHaveBeenCalledWith("date", defaultParams.dateTo);
      expect(mockIn).not.toHaveBeenCalled(); // No platform or campaignId filters by default
    });

    it("should apply platform filter if provided", async () => {
      mockSupabaseData.mockReturnValue([mockDbRow]);
      const paramsWithPlatform = { ...defaultParams, platform: "google,meta" };
      const context = mockAPIContext(paramsWithPlatform) as APIContext;
      await GET(context);
      expect(mockFromFn).toHaveBeenCalledWith("campaign_metrics_derived"); // Upewnijmy się, że from jest wywołane
      expect(mockSelectFn).toHaveBeenCalled(); // Upewnijmy się, że select jest wywołane
      expect(mockIn).toHaveBeenCalledWith("platform_name", ["google", "meta"]);
    });

    it("should apply campaignId filter if provided", async () => {
      mockSupabaseData.mockReturnValue([mockDbRow]);
      const paramsWithCampaign = { ...defaultParams, campaignId: "cid_1,cid_2" };
      const context = mockAPIContext(paramsWithCampaign) as APIContext;
      await GET(context);
      expect(mockFromFn).toHaveBeenCalledWith("campaign_metrics_derived");
      expect(mockSelectFn).toHaveBeenCalled();
      expect(mockIn).toHaveBeenCalledWith("campaign_id", ["cid_1", "cid_2"]);
    });

    it("should return 500 if Supabase query fails", async () => {
      mockSupabaseError.mockReturnValue({
        message: "Database connection failed",
        code: "50000",
        details: "",
        hint: "",
      });
      const context = mockAPIContext(defaultParams) as APIContext;
      const response = await GET(context);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to fetch data from database");
      expect(json.details).toBe("Database connection failed");
    });

    it("should correctly process data from Supabase and calculate summary metrics", async () => {
      const dbData = [
        {
          ...mockDbRow,
          date: "2024-05-01",
          clicks: 100,
          impressions: 1000,
          spend: 50,
          conversions: 10,
          revenue: 200,
          platform_name: "google",
          campaign_id: "c1",
          ctr: 0.1,
          cpc: 0.5,
          cost_per_conversion: 5,
          roas: 4,
        },
        {
          ...mockDbRow,
          date: "2024-05-01",
          clicks: 200,
          impressions: 2000,
          spend: 80,
          conversions: 15,
          revenue: 300,
          platform_name: "meta",
          campaign_id: "c2",
          ctr: 0.1,
          cpc: 0.4,
          cost_per_conversion: 80 / 15,
          roas: 300 / 80,
        },
        {
          ...mockDbRow,
          date: "2024-05-02",
          clicks: 150,
          impressions: 1500,
          spend: 60,
          conversions: 20,
          revenue: 400,
          platform_name: "google",
          campaign_id: "c1",
          ctr: 0.1,
          cpc: 0.4,
          cost_per_conversion: 3,
          roas: 400 / 60,
        },
      ];
      mockSupabaseData.mockReturnValue(dbData);

      const context = mockAPIContext(defaultParams) as APIContext;
      const response = await GET(context);
      expect(response.status).toBe(200);

      const json: DashboardMetricsResponse = await response.json();
      expect(json.timeSeriesData).toHaveLength(3);

      const totalImpressions = 1000 + 2000 + 1500;
      const totalClicks = 100 + 200 + 150;
      const totalSpend = 50 + 80 + 60;
      const totalConversions = 10 + 15 + 20;
      const totalRevenue = 200 + 300 + 400;

      expect(json.summaryMetrics.impressions).toBe(totalImpressions);
      expect(json.summaryMetrics.clicks).toBe(totalClicks);
      expect(json.summaryMetrics.spend).toBe(totalSpend);
      expect(json.summaryMetrics.conversions).toBe(totalConversions);
      expect(json.summaryMetrics.revenue).toBe(totalRevenue);
      expect(json.summaryMetrics.ctr).toBeCloseTo(totalClicks / totalImpressions);
      expect(json.summaryMetrics.cpc).toBeCloseTo(totalSpend / totalClicks);
      expect(json.summaryMetrics.cost_per_conversion).toBeCloseTo(totalSpend / totalConversions);
      expect(json.summaryMetrics.roas).toBeCloseTo(totalRevenue / totalSpend);
      expect(json.summaryMetrics.reach).toBe(0); // Since mockDbRow.reach is null
      expect(json.summaryMetrics.unique_conversion_types).toEqual([]); // Since mockDbRow.conversion_type is null

      // Check one time series point (the first one)
      const firstPoint: DailyMetricDataPoint = json.timeSeriesData[0];
      expect(firstPoint.impressions).toBe(1000);
      // Check derived metrics provided by the (mocked) view
      expect(firstPoint.ctr).toBe(dbData[0].ctr);
      expect(firstPoint.cpc).toBe(dbData[0].cpc);
      expect(firstPoint.cost_per_conversion).toBe(dbData[0].cost_per_conversion);
      expect(firstPoint.roas).toBe(dbData[0].roas);
    });

    it("should return empty arrays and zeroed summary for no data from Supabase", async () => {
      mockSupabaseData.mockReturnValue([]); // No data
      const context = mockAPIContext(defaultParams) as APIContext;
      const response = await GET(context);
      expect(response.status).toBe(200);
      const json: DashboardMetricsResponse = await response.json();

      expect(json.timeSeriesData).toEqual([]);
      expect(json.summaryMetrics.impressions).toBe(0);
      expect(json.summaryMetrics.clicks).toBe(0);
      expect(json.summaryMetrics.spend).toBe(0);
      // ...etc for other summary metrics
      expect(json.summaryMetrics.ctr).toBe(0);
      expect(json.summaryMetrics.cpc).toBe(0);
    });
  });

  describe.skip("Error Handling", () => {
    it.skip("should return 500 if an unexpected error occurs (simulated)", async () => {
      const originalMap = Array.prototype.map;
      // @ts-ignore
      Array.prototype.map = vi.fn().mockImplementationOnce(() => {
        throw new Error("Simulated processing error");
      });

      const context = mockAPIContext({
        organization_id: "org_123",
        dateFrom: "2024-01-01",
        dateTo: "2024-01-31",
      }) as APIContext;
      const response = await GET(context);
      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe("Failed to fetch dashboard metrics.");
      expect(json.details).toBe("Simulated processing error");

      Array.prototype.map = originalMap;
    });
  });
});
