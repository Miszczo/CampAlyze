import { test, expect } from '@playwright/test';
import { LoginPage } from './poms/login-page';
import { setupMockAuth, setupMockImports, setupMockCampaigns, setupMockAIAnalysis } from './utils/mock-handlers';

test.describe('AI Analysis E2E Test', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks for login, imports list, and AI analysis
    await setupMockAuth(page);
    await setupMockImports(page);
    await setupMockCampaigns(page);
    await setupMockAIAnalysis(page);
  });

  test('should go through full import details and analysis flow', async ({ page }) => {
    // 1. Login
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login('test@example.com', 'password123');

    // 2. Verify we're on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // 3. Navigate to imports page
    await page.getByRole('link', { name: /imports/i }).click();
    await expect(page).toHaveURL(/.*imports/);
    
    // 4. Verify imports list is displayed
    await expect(page.getByText('Historia importów')).toBeVisible();
    
    // 5. Click on details for first import
    await page.getByRole('link', { name: /szczegóły/i }).first().click();
    
    // 6. Verify we're on the import details page
    await expect(page).toHaveURL(/.*imports\/[a-zA-Z0-9-]+/);
    await expect(page.getByText('Szczegóły importu')).toBeVisible();
    
    // 7. Verify campaign section is displayed
    await expect(page.getByText('Kampanie')).toBeVisible();
    
    // 8. Click on Analyze button for a campaign
    const analyzeButton = page.getByRole('button', { name: /analyze campaign performance/i });
    await expect(analyzeButton).toBeVisible();
    await analyzeButton.click();
    
    // 9. Verify loading state appears
    await expect(page.getByText(/analyzing campaign data/i)).toBeVisible();
    
    // 10. Wait for analysis results
    await expect(page.getByText(/ai analysis for/i)).toBeVisible({ timeout: 10000 });
    
    // 11. Verify analysis content is displayed
    await expect(page.locator('.whitespace-pre-line')).toContainText(/performance|campaign|metrics|recommendations/i);
  });
});

// Add test helpers to utils folder
export async function setupMockAIAnalysis(page) {
  await page.route('**/api/ai-insights/analyze', async (route) => {
    // Extract campaign ID from request
    const request = route.request();
    const postData = JSON.parse(await request.postData());
    const campaignId = postData.campaign_id;

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          id: 'mock-insight-id',
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
          date_range_start: '2024-01-01',
          date_range_end: '2024-01-31'
        }
      })
    });
  });
}

// Add utility function to mock campaigns data
export async function setupMockCampaigns(page) {
  await page.route('**/rest/v1/campaigns**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'campaign-1',
          name: 'Test Campaign 1',
          platform_id: 'google',
          organization_id: 'org-123'
        },
        {
          id: 'campaign-2',
          name: 'Test Campaign 2',
          platform_id: 'meta',
          organization_id: 'org-123'
        }
      ])
    });
  });
  
  // Mock metrics data
  await page.route('**/rest/v1/metrics**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          campaign_id: 'campaign-1',
          date: '2024-01-01',
          impressions: 1000,
          clicks: 50,
          spend: 22.5,
          conversions: 5,
          import_id: 'import-1'
        },
        {
          campaign_id: 'campaign-1',
          date: '2024-01-02',
          impressions: 1200,
          clicks: 60,
          spend: 27,
          conversions: 6,
          import_id: 'import-1'
        }
      ])
    });
  });
} 