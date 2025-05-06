import { describe, it, expect } from "vitest";
import { UsageTracker } from "./usage-tracker";

describe("UsageTracker", () => {
  let usageTracker: UsageTracker;

  beforeEach(() => {
    usageTracker = new UsageTracker();
  });

  it("should initialize with zero usage", () => {
    expect(usageTracker.getCurrentUsage()).toBe(0);
  });

  it("should track usage correctly for a single call", () => {
    usageTracker.trackUsage(1000, "gpt-3.5-turbo");
    expect(usageTracker.getCurrentUsage()).toBe(1000);
  });

  it("should accumulate usage across multiple calls", () => {
    usageTracker.trackUsage(500, "gpt-3.5-turbo");
    usageTracker.trackUsage(1500, "gpt-4");
    usageTracker.trackUsage(200, "gpt-3.5-turbo");
    expect(usageTracker.getCurrentUsage()).toBe(2200); // 500 + 1500 + 200
  });

  it("should return true if usage is below budget limit", () => {
    usageTracker.trackUsage(10000, "gpt-4");
    const budgetLimit = 15000;
    expect(usageTracker.checkBudgetLimit(budgetLimit)).toBe(true);
  });

  it("should return true if usage is exactly zero and budget is positive", () => {
    const budgetLimit = 100;
    expect(usageTracker.checkBudgetLimit(budgetLimit)).toBe(true);
  });

  it("should return false if usage is exactly at budget limit", () => {
    usageTracker.trackUsage(20000, "gpt-4");
    const budgetLimit = 20000;
    expect(usageTracker.checkBudgetLimit(budgetLimit)).toBe(false);
  });

  it("should return false if usage exceeds budget limit", () => {
    usageTracker.trackUsage(25000, "gpt-4");
    const budgetLimit = 20000;
    expect(usageTracker.checkBudgetLimit(budgetLimit)).toBe(false);
  });

  it("should handle tracking zero tokens", () => {
    usageTracker.trackUsage(100, "gpt-3.5-turbo");
    usageTracker.trackUsage(0, "gpt-4");
    expect(usageTracker.getCurrentUsage()).toBe(100);
  });

  it("should checkBudgetLimit correctly with zero budget", () => {
    const zeroBudget = 0;
    expect(usageTracker.checkBudgetLimit(zeroBudget)).toBe(false); // Cannot use if budget is 0
    usageTracker.trackUsage(1, "gpt-3.5-turbo");
    expect(usageTracker.checkBudgetLimit(zeroBudget)).toBe(false);
  });
});
