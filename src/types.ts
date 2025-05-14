import type { Database } from "./db/database.types";

// Utility type to extract table rows from database schema
type DbRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

// Entity types from database schema
export type Organization = DbRow<"organizations">;
export type UserOrganization = DbRow<"user_organizations">;
export type Platform = DbRow<"platforms">;
export type Campaign = DbRow<"campaigns">;
export type Metric = DbRow<"metrics">;
export type Import = DbRow<"imports">;
export type CampaignChange = DbRow<"campaign_changes">;
export type AIInsight = DbRow<"ai_insights">;
export type UserPreference = DbRow<"user_preferences">;

// Base DTOs for derived metrics
export interface BaseMetricsDTO {
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  reach?: number | null;
}

export interface DerivedMetricsDTO extends BaseMetricsDTO {
  ctr: number;
  cpc: number;
  cost_per_conversion: number;
  roas: number;
}

// Authentication & User Management DTOs
export interface RegisterUserDTO {
  email: string;
  password: string;
  full_name: string;
}

export interface UserDTO {
  id: string;
  email: string;
  full_name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  access_token: string;
  refresh_token: string;
  user: UserDTO;
}

// Organizations DTOs
export interface CreateOrganizationDTO {
  name: string;
}

export type OrganizationDTO = Pick<Organization, "id" | "name" | "created_at">;

export interface OrganizationWithRoleDTO extends OrganizationDTO {
  role: string; // 'admin', 'editor', 'viewer'
}

export interface AddUserToOrganizationDTO {
  email: string;
  role: string; // 'admin', 'editor', 'viewer'
}

export interface UserOrganizationDTO {
  id: string;
  user_id: string;
  organization_id: string;
  email: string;
  role: string;
}

export interface UpdateUserRoleDTO {
  role: string; // 'admin', 'editor', 'viewer'
}

// Import DTOs
export interface ImportFileResponseDTO {
  id: string;
  original_filename: string;
  status: string; // 'pending'
}

export interface ProcessImportDTO {
  platform_id: string;
  organization_id: string;
}

export interface ImportStatusDTO {
  id: string;
  status: string; // 'pending', 'processing', 'completed', 'error'
  progress: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ImportListItemDTO {
  id: string;
  organization_id: string;
  platform_id: string;
  platform_name: string;
  original_filename: string;
  status: string; // 'pending', 'processing', 'completed', 'error'
  created_at: string;
  error_message: string | null;
}

// Campaign DTOs
export type CampaignSummaryMetricsDTO = BaseMetricsDTO;

export interface CampaignListItemDTO {
  id: string;
  name: string;
  platform_id: string;
  platform_name: string;
  status: string; // 'active', 'paused', 'completed', 'archived'
  start_date: string | null;
  end_date: string | null;
  summary_metrics: CampaignSummaryMetricsDTO;
}

export interface CampaignDetailDTO {
  id: string;
  name: string;
  organization_id: string;
  platform_id: string;
  platform_name: string;
  external_id: string | null;
  status: string; // 'active', 'paused', 'completed', 'archived'
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
  summary_metrics: DerivedMetricsDTO;
}

export interface UpdateCampaignDTO {
  name?: string;
  status?: string; // 'active', 'paused', 'completed', 'archived'
  start_date?: string | null;
  end_date?: string | null;
}

// Metrics DTOs
export interface MetricDataPointDTO extends DerivedMetricsDTO {
  date: string;
}

export interface CampaignMetricsDTO {
  campaign_id: string;
  campaign_name: string;
  data: MetricDataPointDTO[];
}

export interface MetricsSummaryDTO {
  summary: DerivedMetricsDTO;
  comparison: {
    impressions_change: number;
    clicks_change: number;
    spend_change: number;
    conversions_change: number;
    revenue_change: number;
  };
}

export type PeriodMetricsDTO = BaseMetricsDTO;

export interface MetricsComparisonDTO {
  current_period: PeriodMetricsDTO;
  previous_period: PeriodMetricsDTO;
  changes: {
    impressions_change: number;
    clicks_change: number;
    spend_change: number;
    conversions_change: number;
    revenue_change: number;
  };
}

// Campaign Changes DTOs
export interface CreateCampaignChangeDTO {
  description: string;
  change_type: string; // 'budget', 'targeting', 'creative', 'bid', 'other'
  implementation_date: string;
  verification_date?: string | null;
}

export interface CampaignChangeDTO {
  id: string;
  campaign_id: string;
  description: string;
  change_type: string; // 'budget', 'targeting', 'creative', 'bid', 'other'
  implementation_date: string;
  verification_date: string | null;
  created_at: string;
}

export interface CampaignChangeListItemDTO extends CampaignChangeDTO {
  verified: boolean | null;
  user_name: string;
}

export interface VerificationDTO {
  id: string;
  campaign_id: string;
  campaign_name: string;
  description: string;
  change_type: string; // 'budget', 'targeting', 'creative', 'bid', 'other'
  implementation_date: string;
  verification_date: string;
  user_name: string;
}

export interface VerifyCampaignChangeDTO {
  verified: boolean;
  verification_notes: string | null;
}

export interface ChangeImpactDTO {
  change: {
    id: string;
    description: string;
    change_type: string; // 'budget', 'targeting', 'creative', 'bid', 'other'
    implementation_date: string;
  };
  before: MetricDataPointDTO;
  after: MetricDataPointDTO;
  impact: {
    impressions_change: number;
    clicks_change: number;
    spend_change: number;
    conversions_change: number;
    revenue_change: number;
    ctr_change: number;
    cpc_change: number;
    cost_per_conversion_change: number;
    roas_change: number;
  };
}

// Alerts DTOs
export interface AlertDTO {
  id: string;
  campaign_id: string;
  campaign_name: string;
  metric: string;
  threshold: number;
  current_value: number;
  status: string; // 'active', 'dismissed'
  created_at: string;
}

export interface UpdateAlertStatusDTO {
  status: string; // 'dismissed'
}

export interface AlertThresholdsDTO {
  organization_id: string;
  ctr_threshold: number;
  cpc_threshold: number;
  cost_per_conversion_threshold: number;
  roas_threshold: number;
  updated_at?: string;
}

// AI Insights DTOs
export interface InsightDTO {
  id: string;
  campaign_id: string | null;
  campaign_name: string | null;
  insight_type: string; // 'summary', 'trend', 'recommendation', 'anomaly'
  content: string;
  date_range_start: string | null;
  date_range_end: string | null;
  status: string; // 'active', 'dismissed', 'implemented'
  created_at: string;
}

export interface GenerateInsightDTO {
  campaign_id: string;
  date_range_start: string;
  date_range_end: string;
}

export interface UpdateInsightStatusDTO {
  status: string; // 'active', 'dismissed', 'implemented'
}

export interface GenerateReportDTO {
  organization_id: string;
  campaign_ids: string[];
  date_range_start: string;
  date_range_end: string;
  include_sections: string[]; // ['summary', 'trends', 'recommendations', 'anomalies']
}

export interface ReportDTO {
  id: string;
  organization_id: string;
  campaign_ids: string[];
  date_range_start: string;
  date_range_end: string;
  content: string;
  status: string; // 'pending', 'processing', 'completed', 'error'
  created_at: string;
}

// Export DTOs
export interface ExportQueryDTO {
  format: string; // 'csv', 'xlsx', 'pdf'
  entity: string; // 'campaigns', 'metrics', 'changes'
  organization_id: string;
  campaign_ids?: string[];
  start_date?: string;
  end_date?: string;
}

// Activities DTOs
export interface ActivityDTO {
  id: string;
  user_id: string;
  user_email: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Platform DTOs
export interface PlatformDTO {
  id: string;
  name: string;
  display_name: string;
}

// User Preferences DTOs
export interface UserPreferencesDTO {
  user_id: string;
  preferences: Record<string, unknown>;
  updated_at?: string;
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Standard response wrappers
export interface DataResponse<T> {
  data: T[];
}

// Command Models (for more complex operations than simple CRUD)
export interface ProcessFileCommandModel {
  file: File;
  platform_id: string;
  organization_id: string;
}

export interface GenerateAIInsightCommandModel extends GenerateInsightDTO {
  model?: string; // Optional model selection
  max_tokens?: number;
}

export interface ExportDataCommandModel extends ExportQueryDTO {
  include_derived_metrics?: boolean;
  file_name_prefix?: string;
}

export interface CompleteVerificationCommandModel extends VerifyCampaignChangeDTO {
  notify_users?: boolean;
  campaign_id: string;
  change_id: string;
}

export interface DashboardCardProps {
  title: string;
  metric: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
}

export interface ImportFileProps {
  onImportSuccess?: (data: ImportFileResponseDTO) => void;
  onImportError?: (error: Error) => void;
}

export interface CampaignPerformanceProps {
  campaignId: string;
  dateRange?: { start: Date; end: Date };
}

export type DataValue = string | number | boolean | null | Date;

export type MetricReport = Record<string, DataValue>;

export interface DashboardData {
  metrics: Record<string, string | number>;
  comparisons: Record<string, number>;
}

// Dashboard Specific Types Start
export type DashboardMetricKey =
  | "impressions"
  | "clicks"
  | "spend"
  | "conversions"
  | "revenue"
  | "ctr"
  | "cpc"
  | "cost_per_conversion"
  | "roas"
  | "reach"
  | "conversion_type";

export type DashboardMetricValue = number | string | null;

export interface DailyMetricDataPoint extends BaseMetricsDTO {
  date: string;
  platform_id?: string;
  campaign_id?: string;
  conversion_type?: string | null;
  // Derived metrics that might be calculated if not directly from DB view
  ctr?: number | null;
  cpc?: number | null;
  cost_per_conversion?: number | null;
  roas?: number | null;
}

export interface AggregatedMetrics extends DerivedMetricsDTO {
  // DerivedMetricsDTO already includes: impressions, clicks, spend, conversions, revenue, ctr, cpc, cost_per_conversion, roas
  // reach is inherited from BaseMetricsDTO via DerivedMetricsDTO
  unique_conversion_types?: string[];
}

export interface DashboardMetricsQueryParams {
  dateFrom: string; // ISO 8601 date string e.g., "2024-01-01"
  dateTo: string; // ISO 8601 date string e.g., "2024-01-31"
  platform?: string | string[];
  campaignId?: string | string[];
  organization_id: string; // Should be inferred from user session server-side
}

export interface DashboardMetricsResponse {
  summaryMetrics: AggregatedMetrics;
  timeSeriesData: DailyMetricDataPoint[];
  filtersApplied: DashboardMetricsQueryParams;
}
// Dashboard Specific Types End
