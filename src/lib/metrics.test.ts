import { describe, it, expect } from "vitest";
import {
  calculateCTR,
  calculateCPC,
  calculateCostPerConversion,
  calculateROAS,
  calculateDerivedMetrics,
  calculatePercentageChange,
  compareMetrics,
  aggregateMetrics,
  filterMetricsByDateRange,
} from "./metrics";
import type { BaseMetricsDTO } from "@/types";

describe("Metric Calculations", () => {
  describe("calculateCTR", () => {
    it("should calculate CTR correctly", () => {
      expect(calculateCTR(1000, 50)).toBe(0.05); // 5% CTR
      expect(calculateCTR(200, 10)).toBe(0.05);
    });

    it("should return 0 if impressions are 0", () => {
      expect(calculateCTR(0, 50)).toBe(0);
    });

    it("should return 0 if clicks are 0", () => {
      expect(calculateCTR(1000, 0)).toBe(0);
    });

    it("should handle large numbers", () => {
      expect(calculateCTR(1000000, 25000)).toBe(0.025); // 2.5% CTR
    });
  });

  describe("calculateCPC", () => {
    it("should calculate CPC correctly", () => {
      expect(calculateCPC(100, 50)).toBe(2); // $2 CPC
      expect(calculateCPC(50, 10)).toBe(5);
    });

    it("should return 0 if clicks are 0", () => {
      expect(calculateCPC(100, 0)).toBe(0);
    });

    it("should handle 0 spend", () => {
      expect(calculateCPC(0, 50)).toBe(0);
    });

    it("should handle floating point numbers", () => {
      expect(calculateCPC(123.45, 67)).toBeCloseTo(1.8425);
    });
  });

  describe("calculateCostPerConversion", () => {
    it("should calculate Cost Per Conversion (CPA) correctly", () => {
      expect(calculateCostPerConversion(500, 10)).toBe(50); // $50 CPA
      expect(calculateCostPerConversion(200, 5)).toBe(40);
    });

    it("should return 0 if conversions are 0", () => {
      expect(calculateCostPerConversion(500, 0)).toBe(0);
    });

    it("should handle 0 spend", () => {
      expect(calculateCostPerConversion(0, 10)).toBe(0);
    });

    it("should handle floating point numbers", () => {
      expect(calculateCostPerConversion(987.65, 12)).toBeCloseTo(82.304);
    });
  });

  describe("calculateROAS", () => {
    it("should calculate ROAS correctly", () => {
      expect(calculateROAS(1000, 200)).toBe(5); // 500% ROAS
      expect(calculateROAS(500, 100)).toBe(5);
    });

    it("should return 0 if spend is 0", () => {
      expect(calculateROAS(1000, 0)).toBe(0);
    });

    it("should handle 0 revenue", () => {
      expect(calculateROAS(0, 200)).toBe(0);
    });

    it("should handle floating point numbers", () => {
      expect(calculateROAS(1500.5, 300.1)).toBeCloseTo(5.0);
    });
  });

  describe("calculateDerivedMetrics", () => {
    it("should calculate all derived metrics correctly", () => {
      const baseMetrics: BaseMetricsDTO = {
        impressions: 10000,
        clicks: 200,
        spend: 500,
        conversions: 10,
        revenue: 2500,
      };
      const expectedDerivedMetrics = {
        ...baseMetrics,
        ctr: 0.02, // 200 / 10000
        cpc: 2.5, // 500 / 200
        cost_per_conversion: 50, // 500 / 10
        roas: 5, // 2500 / 500
      };
      expect(calculateDerivedMetrics(baseMetrics)).toEqual(expectedDerivedMetrics);
    });

    it("should handle zero values gracefully", () => {
      const baseMetrics: BaseMetricsDTO = {
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      };
      const expectedDerivedMetrics = {
        ...baseMetrics,
        ctr: 0,
        cpc: 0,
        cost_per_conversion: 0,
        roas: 0,
      };
      expect(calculateDerivedMetrics(baseMetrics)).toEqual(expectedDerivedMetrics);
    });

    it("should handle edge case where only impressions exist", () => {
      const baseMetrics: BaseMetricsDTO = {
        impressions: 100,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      };
      const expectedDerivedMetrics = {
        ...baseMetrics,
        ctr: 0,
        cpc: 0,
        cost_per_conversion: 0,
        roas: 0,
      };
      expect(calculateDerivedMetrics(baseMetrics)).toEqual(expectedDerivedMetrics);
    });
  });

  describe("calculatePercentageChange", () => {
    it("should calculate positive percentage change", () => {
      expect(calculatePercentageChange(100, 150)).toBe(0.5); // 50% increase
    });

    it("should calculate negative percentage change", () => {
      expect(calculatePercentageChange(100, 50)).toBe(-0.5); // 50% decrease
    });

    it("should return 0 if values are the same", () => {
      expect(calculatePercentageChange(100, 100)).toBe(0);
    });

    it("should return 1 (100%) if old value is 0 and new value is positive", () => {
      expect(calculatePercentageChange(0, 50)).toBe(1);
    });

    it("should return 0 if both values are 0", () => {
      expect(calculatePercentageChange(0, 0)).toBe(0);
    });

    it("should handle negative old values (though unlikely in metrics)", () => {
      expect(calculatePercentageChange(-100, -50)).toBe(0.5); // Increase from -100 to -50
      expect(calculatePercentageChange(-50, -100)).toBe(-1); // Decrease from -50 to -100
    });
  });

  describe("compareMetrics", () => {
    it("should compare two period metrics correctly", () => {
      const previousPeriod = { impressions: 1000, clicks: 50, spend: 100, conversions: 5, revenue: 200 };
      const currentPeriod = { impressions: 1500, clicks: 60, spend: 120, conversions: 8, revenue: 300 };

      const comparison = compareMetrics(previousPeriod, currentPeriod);

      expect(comparison).toEqual({
        impressions_change: 0.5,
        clicks_change: 0.2,
        spend_change: 0.2,
        conversions_change: 0.6,
        revenue_change: 0.5,
      });
    });

    it("should handle zero values in previous period correctly", () => {
      const previousPeriod = { impressions: 0, clicks: 0, spend: 100, conversions: 0, revenue: 0 };
      const currentPeriod = { impressions: 1000, clicks: 50, spend: 120, conversions: 5, revenue: 200 };

      const comparison = compareMetrics(previousPeriod, currentPeriod);

      expect(comparison).toEqual({
        impressions_change: 1,
        clicks_change: 1,
        spend_change: 0.2,
        conversions_change: 1,
        revenue_change: 1,
      });
    });
  });

  describe("aggregateMetrics", () => {
    it("should aggregate metrics from multiple objects", () => {
      const metricsArray: BaseMetricsDTO[] = [
        { impressions: 100, clicks: 10, spend: 20, conversions: 1, revenue: 50 },
        { impressions: 200, clicks: 15, spend: 30, conversions: 2, revenue: 100 },
        { impressions: 50, clicks: 5, spend: 10, conversions: 0, revenue: 25 },
      ];
      const expectedAggregatedMetrics: BaseMetricsDTO = {
        impressions: 350,
        clicks: 30,
        spend: 60,
        conversions: 3,
        revenue: 175,
      };
      expect(aggregateMetrics(metricsArray)).toEqual(expectedAggregatedMetrics);
    });

    it("should return zero metrics for an empty array", () => {
      const expectedAggregatedMetrics: BaseMetricsDTO = {
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      };
      expect(aggregateMetrics([])).toEqual(expectedAggregatedMetrics);
    });
  });

  describe("filterMetricsByDateRange", () => {
    const dailyMetrics = [
      { date: "2024-01-01", impressions: 100, clicks: 10, spend: 5, conversions: 1, revenue: 20 },
      { date: "2024-01-02", impressions: 120, clicks: 12, spend: 6, conversions: 2, revenue: 25 },
      { date: "2024-01-03", impressions: 110, clicks: 11, spend: 5.5, conversions: 1, revenue: 22 },
      { date: "2024-01-04", impressions: 130, clicks: 13, spend: 6.5, conversions: 3, revenue: 30 },
      { date: "2024-01-05", impressions: 140, clicks: 14, spend: 7, conversions: 2, revenue: 35 },
    ];

    it("should filter metrics within the specified date range (inclusive)", () => {
      const startDate = "2024-01-02";
      const endDate = "2024-01-04";
      const filtered = filterMetricsByDateRange(dailyMetrics, startDate, endDate);
      expect(filtered).toHaveLength(3);
      expect(filtered[0].date).toBe("2024-01-02");
      expect(filtered[1].date).toBe("2024-01-03");
      expect(filtered[2].date).toBe("2024-01-04");
    });

    it("should return an empty array if no metrics fall within the range", () => {
      const startDate = "2024-01-06";
      const endDate = "2024-01-07";
      expect(filterMetricsByDateRange(dailyMetrics, startDate, endDate)).toEqual([]);
    });

    it("should handle a single-day range", () => {
      const startDate = "2024-01-03";
      const endDate = "2024-01-03";
      const filtered = filterMetricsByDateRange(dailyMetrics, startDate, endDate);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].date).toBe("2024-01-03");
    });
  });
});
