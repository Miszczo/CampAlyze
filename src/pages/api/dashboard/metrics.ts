import type { APIContext } from "astro";
import type {
  DashboardMetricsQueryParams,
  DashboardMetricsResponse,
  AggregatedMetrics,
  DailyMetricDataPoint,
} from "../../../types"; // Zakładając względną ścieżkę do src/types.ts
import { supabaseClient } from "../../../db/supabase.client"; // Poprawiony import klienta Supabase

// Helper function to calculate derived metrics to avoid repetition
function calculateDerivedMetrics(data: {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
}): {
  ctr: number;
  cpc: number;
  cost_per_conversion: number;
  roas: number;
} {
  const ctr = data.impressions > 0 ? data.clicks / data.impressions : 0;
  const cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
  const cost_per_conversion =
    data.conversions > 0 ? data.spend / data.conversions : 0;
  const roas = data.spend > 0 ? data.revenue / data.spend : 0;
  return { ctr, cpc, cost_per_conversion, roas };
}

export async function GET(
  context: APIContext,
): Promise<Response> {
  // TODO: Docelowo organization_id powinno pochodzić z sesji użytkownika (np. context.locals.organizationId)
  //       To wymaga implementacji middleware do obsługi sesji i autoryzacji.
  //       Na potrzeby deweloperskie, można tymczasowo ustawić stałą wartość lub oczekiwać parametru.
  //       Na razie zakładamy, że organization_id jest przekazywane jako parametr query dla uproszczenia.
  const organization_id = context.url.searchParams.get("organization_id");

  const dateFrom = context.url.searchParams.get("dateFrom");
  const dateTo = context.url.searchParams.get("dateTo");
  const platformParam = context.url.searchParams.get("platform");
  const campaignIdParam = context.url.searchParams.get("campaignId");

  if (!organization_id) {
    return new Response(
      JSON.stringify({ error: "Missing organization_id parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!dateFrom || !dateTo) {
    return new Response(
      JSON.stringify({ error: "Missing dateFrom or dateTo parameters" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // TODO: Dodać walidację formatu dat (np. ISO 8601)

  const queryParams: DashboardMetricsQueryParams = {
    organization_id,
    dateFrom,
    dateTo,
    platform: platformParam ? platformParam.split(",").map(p => p.trim()).filter(p => p) : undefined,
    campaignId: campaignIdParam ? campaignIdParam.split(",").map(c => c.trim()).filter(c => c) : undefined,
  };

  try {
    let query = supabaseClient
      .from("campaign_metrics_derived")
      .select(`
        date,
        platform_name,
        campaign_id,
        campaign_name,
        impressions,
        clicks,
        spend,
        conversions,
        revenue,
        cost_per_conversion,
        cpc,
        ctr,
        roas,
        campaigns!inner(organization_id) 
      `)
      .eq("campaigns.organization_id", queryParams.organization_id)
      .gte("date", queryParams.dateFrom)
      .lte("date", queryParams.dateTo);

    if (queryParams.platform && queryParams.platform.length > 0) {
      query = query.in("platform_name", queryParams.platform as string[]);
    }

    if (queryParams.campaignId && queryParams.campaignId.length > 0) {
      query = query.in("campaign_id", queryParams.campaignId as string[]);
    }

    const { data: rawDataFromSupabase, error: supabaseError } = await query;

    if (supabaseError) {
      console.error("Supabase error:", supabaseError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch data from database",
          details: supabaseError.message,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!rawDataFromSupabase) {
        // Should not happen if supabaseError is null, but good for type safety
        return new Response(
            JSON.stringify({ error: "No data received from database"}),
            { status: 500, headers: { "Content-Type": "application/json"}}
        );
    }

    const timeSeriesData: DailyMetricDataPoint[] = rawDataFromSupabase.map(
      (row: any) => ({
        date: row.date!,
        platform_id: row.platform_name, // Matching DailyMetricDataPoint's platform_id with platform_name
        campaign_id: row.campaign_id,
        // campaign_name: row.campaign_name, // Available if needed, but not in DailyMetricDataPoint type
        impressions: row.impressions || 0,
        clicks: row.clicks || 0,
        spend: row.spend || 0,
        conversions: row.conversions || 0,
        revenue: row.revenue || 0,
        // TODO: Add reach and conversion_type when available in campaign_metrics_derived view
        reach: row.reach || null, // Assuming it might be added later to the view
        conversion_type: row.conversion_type || null, // Assuming it might be added later
        ctr: row.ctr || 0,
        cpc: row.cpc || 0,
        cost_per_conversion: row.cost_per_conversion || 0,
        roas: row.roas || 0,
      }),
    );

    const summaryImpressions = timeSeriesData.reduce((sum, item) => sum + item.impressions, 0);
    const summaryClicks = timeSeriesData.reduce((sum, item) => sum + item.clicks, 0);
    const summarySpend = timeSeriesData.reduce((sum, item) => sum + item.spend, 0);
    const summaryConversions = timeSeriesData.reduce((sum, item) => sum + item.conversions, 0);
    const summaryRevenue = timeSeriesData.reduce((sum, item) => sum + item.revenue, 0);
    const summaryReach = timeSeriesData.reduce((sum, item) => sum + (item.reach || 0), 0);

    const derivedSummaryMetrics = calculateDerivedMetrics({
        impressions: summaryImpressions,
        clicks: summaryClicks,
        spend: summarySpend,
        conversions: summaryConversions,
        revenue: summaryRevenue,
    });

    const summaryMetrics: AggregatedMetrics = {
      impressions: summaryImpressions,
      clicks: summaryClicks,
      spend: summarySpend,
      conversions: summaryConversions,
      revenue: summaryRevenue,
      reach: summaryReach,
      ...derivedSummaryMetrics,
      unique_conversion_types: [
        ...new Set(timeSeriesData.map((item) => item.conversion_type).filter(Boolean) as string[]),
      ],
    };

    const response: DashboardMetricsResponse = {
      summaryMetrics,
      timeSeriesData,
      filtersApplied: queryParams,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    // Logowanie błędu po stronie serwera
    // Sentry.captureException(error); lub inny system logowania

    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: "Failed to fetch dashboard metrics.", details: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
} 