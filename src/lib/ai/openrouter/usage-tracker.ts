export class UsageTracker {
  private currentMonthUsage = 0;

  trackUsage(tokens: number, modelName: string): void {
    // Prosta inkrementacja, w przyszłości można dodać logikę per model
    this.currentMonthUsage += tokens;
  }

  checkBudgetLimit(budgetLimit: number): boolean {
    return this.currentMonthUsage < budgetLimit;
  }

  getCurrentUsage(): number {
    return this.currentMonthUsage;
  }
} 