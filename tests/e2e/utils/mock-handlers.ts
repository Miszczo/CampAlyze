import { Page } from "@playwright/test";

/**
 * Setup mock handlers for authentication
 */
export async function setupMockAuth(page: Page): Promise<void> {
  // Mock Supabase auth session check
  await page.route("**/auth/v1/session**", async (route) => {
    console.log("[setupMockAuth] Mocking /auth/v1/session");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          session: {
            access_token: "test-access-token",
            refresh_token: "test-refresh-token",
            user: {
              id: "user-123",
              email: "test@example.com",
              user_metadata: {
                full_name: "Test User",
              },
            },
          },
        },
      }),
    });
  });

  // Mock Supabase auth sign in
  await page.route("**/auth/v1/token**", async (route) => {
    console.log("[setupMockAuth] Mocking /auth/v1/token");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
          user: {
            id: "user-123",
            email: "test@example.com",
            user_metadata: {
              full_name: "Test User",
            },
          },
        },
      }),
    });
  });
}

/**
 * Setup mock handlers for imports list
 */
export async function setupMockImports(page: Page): Promise<void> {
  // Mock GET /api/imports
  await page.route("**/api/imports", async (route) => {
    console.log("[setupMockImports] Mocking /api/imports");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [
          {
            id: "import-1",
            organization_id: "org-123",
            platform_id: "google",
            platform_name: "Google Ads",
            original_filename: "google_ads_export_2024-01.csv",
            status: "completed",
            created_at: new Date().toISOString(),
            error_message: null,
          },
          {
            id: "import-2",
            organization_id: "org-123",
            platform_id: "meta",
            platform_name: "Meta Ads",
            original_filename: "meta_ads_export_2024-01.csv",
            status: "completed",
            created_at: new Date().toISOString(),
            error_message: null,
          },
        ],
      }),
    });
  });

  // Mock GET single import details
  await page.route("**/rest/v1/imports**", async (route) => {
    console.log("[setupMockImports] Mocking /rest/v1/imports (details)");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "import-1",
        organization_id: "org-123",
        platform_id: "google",
        original_filename: "google_ads_export_2024-01.csv",
        status: "completed",
        created_at: new Date().toISOString(),
        error_message: null,
        file_path: "storage/imports/google_ads_export_2024-01.csv",
        platforms: {
          name: "Google Ads",
        },
      }),
    });
  });
}

/**
 * Setup mock handlers for AI Analysis
 */
export async function setupMockAIAnalysis(page: Page): Promise<void> {
  await page.route("**/api/ai-insights/analyze", async (route) => {
    console.log("[setupMockAIAnalysis] Mocking /api/ai-insights/analyze");
    // Extract campaign ID from request
    const request = route.request();
    const postData = JSON.parse(await request.postData());
    const campaignId = postData.campaign_id;

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: "mock-insight-id",
          campaign_name: `Test Campaign ${campaignId}`,
          content: `
          # Campaign Analysis
          
          ## Key Performance Insights
          - CTR of 5.0% is above industry average (3.2%)
          - Spend efficiency is good with CPC of $0.45
          - Conversion rate could be improved
          
          ## Recommendations
          1. Increase ad creative variations to improve engagement
          2. Optimize targeting for better conversion rates
          3. Consider reallocating budget to higher performing ad sets
          
          This campaign shows positive overall performance but has potential for optimization.
          `,
          date_range_start: "2024-01-01",
          date_range_end: "2024-01-31",
        },
      }),
    });
  });
}

/**
 * Setup mock handlers for campaigns data
 */
export async function setupMockCampaigns(page: Page): Promise<void> {
  await page.route("**/rest/v1/campaigns**", async (route) => {
    console.log("[setupMockCampaigns] Mocking /rest/v1/campaigns");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "campaign-1",
          name: "Test Campaign 1",
          platform_id: "google",
          organization_id: "org-123",
        },
        {
          id: "campaign-2",
          name: "Test Campaign 2",
          platform_id: "meta",
          organization_id: "org-123",
        },
      ]),
    });
  });

  // Mock metrics data
  await page.route("**/rest/v1/metrics**", async (route) => {
    console.log("[setupMockCampaigns] Mocking /rest/v1/metrics");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          campaign_id: "campaign-1",
          date: "2024-01-01",
          impressions: 1000,
          clicks: 50,
          spend: 22.5,
          conversions: 5,
          import_id: "import-1",
        },
        {
          campaign_id: "campaign-1",
          date: "2024-01-02",
          impressions: 1200,
          clicks: 60,
          spend: 27,
          conversions: 6,
          import_id: "import-1",
        },
      ]),
    });
  });
}
