import { Page } from '@playwright/test';
import { setupMockAIAnalysis, setupMockCampaigns } from '../ai-analysis.spec';

/**
 * Setup mock handlers for authentication
 */
export async function setupMockAuth(page: Page): Promise<void> {
  // Mock Supabase auth session check
  await page.route('**/auth/v1/session**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          session: {
            access_token: 'test-access-token',
            refresh_token: 'test-refresh-token',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              user_metadata: {
                full_name: 'Test User'
              }
            }
          }
        }
      })
    });
  });

  // Mock Supabase auth sign in
  await page.route('**/auth/v1/token**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
            user_metadata: {
              full_name: 'Test User'
            }
          }
        }
      })
    });
  });
}

/**
 * Setup mock handlers for imports list
 */
export async function setupMockImports(page: Page): Promise<void> {
  // Mock GET /api/imports
  await page.route('**/api/imports', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: 'import-1',
            organization_id: 'org-123',
            platform_id: 'google',
            platform_name: 'Google Ads',
            original_filename: 'google_ads_export_2024-01.csv',
            status: 'completed',
            created_at: new Date().toISOString(),
            error_message: null
          },
          {
            id: 'import-2',
            organization_id: 'org-123',
            platform_id: 'meta',
            platform_name: 'Meta Ads',
            original_filename: 'meta_ads_export_2024-01.csv',
            status: 'completed',
            created_at: new Date().toISOString(),
            error_message: null
          }
        ]
      })
    });
  });

  // Mock GET single import details
  await page.route('**/rest/v1/imports**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'import-1',
        organization_id: 'org-123',
        platform_id: 'google',
        original_filename: 'google_ads_export_2024-01.csv',
        status: 'completed',
        created_at: new Date().toISOString(),
        error_message: null,
        file_path: 'storage/imports/google_ads_export_2024-01.csv',
        platforms: {
          name: 'Google Ads'
        }
      })
    });
  });
}

// Re-export the other mock functions
export { setupMockAIAnalysis, setupMockCampaigns }; 