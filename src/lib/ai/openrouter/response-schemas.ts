import type { TaskType } from './types';

export const responseSchemas: Record<TaskType, object> = {
  campaign_analysis: {
    type: 'object',
    required: ['summary', 'key_findings', 'recommendations'],
    properties: {
      summary: { type: 'string' },
      key_findings: { type: 'array', items: { type: 'string' } },
      recommendations: { type: 'array', items: { type: 'string' } },
    },
  },
  recommendations: {
    type: 'object',
    required: ['recommendations'],
    properties: {
      recommendations: { type: 'array', items: { type: 'string' } },
      rationale: { type: 'string' },
    },
  },
  anomaly_detection: {
    type: 'object',
    required: ['anomalies'],
    properties: {
      anomalies: {
        type: 'array',
        items: {
          type: 'object',
          required: ['metric', 'value', 'expected', 'deviation', 'description'],
          properties: {
            metric: { type: 'string' },
            value: { type: 'number' },
            expected: { type: 'number' },
            deviation: { type: 'number' },
            description: { type: 'string' },
          },
        },
      },
    },
  },
  report: {
    type: 'object',
    required: ['title', 'summary', 'details', 'recommendations'],
    properties: {
      title: { type: 'string' },
      summary: { type: 'string' },
      details: { type: 'string' },
      recommendations: { type: 'array', items: { type: 'string' } },
    },
  },
}; 