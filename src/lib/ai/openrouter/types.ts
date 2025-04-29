import type { ModelRegistry } from './model-registry';
import type { RetryOptions } from './retry-handler';

export interface OpenRouterConfig {
  apiKey: string;
  defaultModel: string;
  modelRegistry?: ModelRegistry;
  budgetLimit?: number;
  cacheOptions?: CacheOptions;
  retryOptions?: RetryOptions;
}

export interface CacheOptions {
  enabled?: boolean;
  ttlSeconds?: number;
}

export interface QueryParams {
  model: string;
  messages: Array<{ role: 'system' | 'user'; content: string }>;
  response_format?: any;
  temperature?: number;
  max_tokens?: number;
}

export interface ModelResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<any>;
  usage?: any;
}

// Pozostałe typy domenowe można dodać tutaj 

// Typy domenowe dla OpenRouterService

export interface CampaignData {
  id: string;
  name: string;
  type: string;
  platform: 'google' | 'meta';
  dateRange: { from: string; to: string };
  metrics: Record<string, number>;
  rawData?: any;
}

export interface CampaignAnalysis {
  summary: string;
  key_findings: string[];
  recommendations: string[];
  [key: string]: any;
}

export interface OptimizationRecommendations {
  recommendations: string[];
  rationale?: string;
  [key: string]: any;
}

export interface AnomalyDetectionResults {
  anomalies: Array<{
    metric: string;
    value: number;
    expected: number;
    deviation: number;
    description: string;
  }>;
  [key: string]: any;
}

export interface CampaignReport {
  title: string;
  summary: string;
  details: string;
  recommendations: string[];
  [key: string]: any;
}

export interface UsageInfo {
  currentMonthUsage: number;
  budgetLimit: number;
  usageByModel: Record<string, number>;
}

export interface Model {
  name: string;
  capabilities: string[];
  costPer1kTokens: number;
  [key: string]: any;
}

export interface ReportOptions {
  format?: 'pdf' | 'html' | 'json';
  language?: string;
  [key: string]: any;
}

export interface RecommendationOptions {
  priority?: string;
  [key: string]: any;
}

export interface AnomalyDetectionOptions {
  threshold?: number;
  [key: string]: any;
}

export interface AnalysisOptions {
  priority?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export interface ProcessingOptions {
  sanitize?: boolean;
  [key: string]: any;
}

export interface UsageStats {
  currentMonthUsage: number;
  usageByModel: Record<string, number>;
}

export type ServiceStatus = 'ready' | 'error' | 'initializing';

export type TaskType = 'campaign_analysis' | 'recommendations' | 'anomaly_detection' | 'report';

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  [key: string]: any;
}

export interface UserMessage {
  role: 'user';
  content: string;
}

export interface ResponseFormat {
  type: string;
  [key: string]: any;
}

export interface UsageData {
  tokens: number;
  modelName: string;
  [key: string]: any;
} 