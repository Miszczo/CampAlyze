import { describe, it, expect } from "vitest";
import type { Campaign } from "./campaign-flagging";
import {
  checkCampaignFlags,
  checkLowCTR,
  checkHighCPC,
  checkHighCPA,
  checkLowROAS,
  checkNoData,
  filterCampaignsByFlags,
  DEFAULT_THRESHOLDS,
} from "./campaign-flagging";

describe("Campaign Flagging Logic", () => {
  describe("checkLowCTR", () => {
    it("should flag campaigns with low CTR based on threshold", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 5,
        spend: 100,
        conversions: 2,
        revenue: 200,
      };

      const flag = checkLowCTR(campaign, 0.01);

      expect(flag).not.toBeNull();
      expect(flag?.flag).toBe("low_ctr");
      expect(flag?.severity).toBe("high");
    });

    it("should not flag campaigns with acceptable CTR", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 20,
        spend: 100,
        conversions: 2,
        revenue: 200,
      };

      const flag = checkLowCTR(campaign, 0.01);

      expect(flag).toBeNull();
    });

    it("should handle campaigns with zero impressions", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 0,
        clicks: 0,
        spend: 100,
        conversions: 0,
        revenue: 0,
      };

      const flag = checkLowCTR(campaign, 0.01);

      expect(flag).toBeNull();
    });

    it("should assign severity based on how far below threshold", () => {
      const lowSeverity: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 9,
        spend: 100,
        conversions: 2,
        revenue: 200,
      };

      const mediumSeverity: Campaign = {
        id: "2",
        impressions: 1000,
        clicks: 7,
        spend: 100,
        conversions: 2,
        revenue: 200,
      };

      const highSeverity: Campaign = {
        id: "3",
        impressions: 1000,
        clicks: 3,
        spend: 100,
        conversions: 2,
        revenue: 200,
      };

      expect(checkLowCTR(lowSeverity, 0.01)?.severity).toBe("low");
      expect(checkLowCTR(mediumSeverity, 0.01)?.severity).toBe("medium");
      expect(checkLowCTR(highSeverity, 0.01)?.severity).toBe("high");
    });
  });

  describe("checkHighCPC", () => {
    it("should flag campaigns with high CPC based on threshold", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 20,
        spend: 100,
        conversions: 2,
        revenue: 200,
      };

      const flag = checkHighCPC(campaign, 3.0);

      expect(flag).not.toBeNull();
      expect(flag?.flag).toBe("high_cpc");
      expect(flag?.severity).toBe("medium");
    });

    it("should not flag campaigns with acceptable CPC", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 100,
        spend: 100,
        conversions: 10,
        revenue: 200,
      };

      const flag = checkHighCPC(campaign, 3.0);

      expect(flag).toBeNull();
    });

    it("should handle campaigns with zero clicks", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 0,
        spend: 100,
        conversions: 0,
        revenue: 0,
      };

      const flag = checkHighCPC(campaign, 3.0);

      expect(flag).toBeNull();
    });
  });

  describe("checkHighCPA", () => {
    it("should flag campaigns with high CPA based on threshold", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 100,
        spend: 200,
        conversions: 2,
        revenue: 200,
      };

      const flag = checkHighCPA(campaign, 50.0);

      expect(flag).not.toBeNull();
      expect(flag?.flag).toBe("high_cpa");
      expect(flag?.severity).toBe("medium");
    });

    it("should not flag campaigns with acceptable CPA", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 100,
        spend: 100,
        conversions: 10,
        revenue: 200,
      };

      const flag = checkHighCPA(campaign, 50.0);

      expect(flag).toBeNull();
    });

    it("should handle campaigns with zero conversions", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 100,
        spend: 100,
        conversions: 0,
        revenue: 0,
      };

      const flag = checkHighCPA(campaign, 50.0);

      expect(flag).toBeNull();
    });
  });

  describe("checkLowROAS", () => {
    it("should flag campaigns with low ROAS based on threshold", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 100,
        spend: 200,
        conversions: 10,
        revenue: 300,
      };

      const flag = checkLowROAS(campaign, 2.0);

      expect(flag).not.toBeNull();
      expect(flag?.flag).toBe("low_roas");
      expect(flag?.severity).toBe("medium");
    });

    it("should not flag campaigns with acceptable ROAS", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 100,
        spend: 100,
        conversions: 10,
        revenue: 400,
      };

      const flag = checkLowROAS(campaign, 2.0);

      expect(flag).toBeNull();
    });

    it("should handle campaigns with zero spend", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 100,
        spend: 0,
        conversions: 10,
        revenue: 200,
      };

      const flag = checkLowROAS(campaign, 2.0);

      expect(flag).toBeNull();
    });
  });

  describe("checkNoData", () => {
    it("should flag campaigns with zero impressions and clicks", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      };

      const flag = checkNoData(campaign);

      expect(flag).not.toBeNull();
      expect(flag?.flag).toBe("no_data");
      expect(flag?.severity).toBe("medium");
    });

    it("should not flag campaigns with some data", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 100,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      };

      const flag = checkNoData(campaign);

      expect(flag).toBeNull();
    });
  });

  describe("checkCampaignFlags", () => {
    it("should identify multiple flags for problematic campaigns", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 5,
        spend: 100,
        conversions: 1,
        revenue: 50,
      };

      const flags = checkCampaignFlags(campaign, {
        ctrThreshold: 0.01,
        cpcThreshold: 10.0,
        costPerConversionThreshold: 50.0,
        roasThreshold: 2.0,
      });

      expect(flags.length).toBe(3);
      expect(flags.map((f) => f.flag)).toContain("low_ctr");
      expect(flags.map((f) => f.flag)).toContain("high_cpa");
      expect(flags.map((f) => f.flag)).toContain("low_roas");
    });

    it("should use default thresholds when not provided", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 5,
        spend: 100,
        conversions: 1,
        revenue: 50,
      };

      const flags = checkCampaignFlags(campaign);

      expect(flags.length).toBeGreaterThan(0);
      expect(flags.map((f) => f.flag)).toContain("low_ctr");
    });

    it("should prioritize no_data flag over other flags", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      };

      const flags = checkCampaignFlags(campaign);

      expect(flags.length).toBe(1);
      expect(flags[0].flag).toBe("no_data");
    });

    it("should return empty array for campaigns with no issues", () => {
      const campaign: Campaign = {
        id: "1",
        impressions: 1000,
        clicks: 50,
        spend: 100,
        conversions: 10,
        revenue: 500,
      };

      const flags = checkCampaignFlags(campaign);

      expect(flags.length).toBe(0);
    });
  });

  describe("filterCampaignsByFlags", () => {
    const campaigns: Campaign[] = [
      {
        id: "1",
        name: "Good Campaign",
        impressions: 1000,
        clicks: 50,
        spend: 100,
        conversions: 10,
        revenue: 500,
      },
      {
        id: "2",
        name: "Low CTR Campaign",
        impressions: 1000,
        clicks: 5,
        spend: 100,
        conversions: 10,
        revenue: 500,
      },
      {
        id: "3",
        name: "High CPA Campaign",
        impressions: 1000,
        clicks: 50,
        spend: 1000,
        conversions: 5,
        revenue: 500,
      },
      {
        id: "4",
        name: "No Data Campaign",
        impressions: 0,
        clicks: 0,
        spend: 0,
        conversions: 0,
        revenue: 0,
      },
    ];

    it("should filter campaigns by specific flag type", () => {
      const filtered = filterCampaignsByFlags(campaigns, ["low_ctr"]);

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("2");
    });

    it("should filter campaigns by multiple flag types", () => {
      const filtered = filterCampaignsByFlags(campaigns, ["low_ctr", "high_cpa"]);

      expect(filtered.length).toBe(2);
      expect(filtered.map((c) => c.id).sort()).toEqual(["2", "3"]);
    });

    it("should return all campaigns when no flag types specified", () => {
      const filtered = filterCampaignsByFlags(campaigns, []);

      expect(filtered.length).toBe(4);
    });

    it("should filter campaigns with no_data flag", () => {
      const filtered = filterCampaignsByFlags(campaigns, ["no_data"]);

      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe("4");
    });
  });
});
