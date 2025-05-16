import { createClient } from "@supabase/supabase-js";
import type { APIRoute } from "astro";
import type { InsightDTO } from "../../../types";

// Supabase client
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenRouter configuration
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { campaign_id, date_range_start, date_range_end } = await request.json();

    // Validate required parameters
    if (!campaign_id) {
      return new Response(JSON.stringify({ error: "Missing required parameter: campaign_id" }), { status: 400 });
    }

    // Get campaign data and metrics
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, name, platform_id")
      .eq("id", campaign_id)
      .single();

    if (campaignError || !campaign) {
      console.log("Campaign fetch error:", campaignError);
      return new Response(JSON.stringify({ error: "Campaign not found", details: campaignError }), { status: 404 });
    }

    // Get metrics data for the campaign
    const { data: metrics, error: metricsError } = await supabase
      .from("metrics")
      .select("*")
      .eq("campaign_id", campaign_id)
      .gte("date", date_range_start || "2023-01-01")
      .lte("date", date_range_end || new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (metricsError) {
      console.error("Metrics fetch error:", metricsError);
      return new Response(JSON.stringify({ error: "Failed to fetch campaign metrics", details: metricsError }), {
        status: 500,
      });
    }

    // Prepare data for AI analysis
    const metricsData = metrics.map((m) => ({
      date: m.date,
      impressions: m.impressions,
      clicks: m.clicks,
      spend: m.spend,
      conversions: m.conversions || 0,
      ctr: m.clicks > 0 && m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0,
      cpc: m.clicks > 0 ? m.spend / m.clicks : 0,
      cost_per_conversion: m.conversions > 0 ? m.spend / m.conversions : 0,
    }));

    // Calculate overall metrics
    const totalImpressions = metrics.reduce((sum, m) => sum + (m.impressions || 0), 0);
    const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
    const totalSpend = metrics.reduce((sum, m) => sum + (m.spend || 0), 0);
    const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
    const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const overallCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const overallCostPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;

    // Create prompt for AI analysis
    const prompt = `
      Analyze the following advertising campaign data:
      
      Campaign: ${campaign.name}
      Platform: ${campaign.platform_id}
      Date Range: ${date_range_start || "All time"} to ${date_range_end || "Present"}
      
      Overall Metrics:
      - Total Impressions: ${totalImpressions}
      - Total Clicks: ${totalClicks}
      - Total Spend: $${totalSpend.toFixed(2)}
      - Total Conversions: ${totalConversions}
      - Overall CTR: ${overallCTR.toFixed(2)}%
      - Overall CPC: $${overallCPC.toFixed(2)}
      - Overall Cost per Conversion: $${overallCostPerConversion.toFixed(2)}
      
      Daily Metrics:
      ${JSON.stringify(metricsData, null, 2)}
      
      Provide a concise analysis of this campaign's performance including:
      1. Key performance insights
      2. Strength and weaknesses
      3. Specific recommendations for improvement
      4. Any notable trends or anomalies
      
      Keep your analysis factual, data-driven and actionable.
    `;

    try {
      // Call OpenRouter API
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://campalyze.example.com",
          "X-Title": "CampAlyze",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert marketing and advertising analyst assistant. You analyze ad campaign data and provide concise, actionable insights and recommendations.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return new Response(JSON.stringify({ error: "AI analysis failed", details: errorData }), { status: 500 });
      }

      const aiResponse = await response.json();
      const analysisContent = aiResponse.choices[0]?.message?.content || "No analysis available";

      // Save the analysis as an AI insight
      const insight: Partial<InsightDTO> = {
        campaign_id,
        campaign_name: campaign.name,
        insight_type: "analysis",
        content: analysisContent,
        date_range_start: date_range_start || null,
        date_range_end: date_range_end || null,
        status: "active",
      };

      const { data: savedInsight, error: insertError } = await supabase
        .from("ai_insights")
        .insert(insight)
        .select()
        .single();

      if (insertError) {
        console.error("Failed to save insight to database:", insertError);
        // Continue even if saving to DB fails - return 200 since analysis was successful
      }

      return new Response(
        JSON.stringify({
          data: {
            id: savedInsight?.id || "temp-id",
            content: analysisContent,
            campaign_name: campaign.name,
            date_range_start,
            date_range_end,
          },
        }),
        { status: 200 }
      );
    } catch (openRouterError) {
      // Błąd podczas komunikacji z OpenRouter API
      console.error("OpenRouter API error:", openRouterError);
      return new Response(JSON.stringify({ error: "AI analysis failed", details: String(openRouterError) }), {
        status: 500,
      });
    }
  } catch (err) {
    console.error("Error in AI insights analysis:", err);
    return new Response(JSON.stringify({ error: "Internal server error", details: String(err) }), { status: 500 });
  }
};
