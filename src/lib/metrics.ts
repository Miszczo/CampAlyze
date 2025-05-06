// Placeholder for metrics calculation logic

import type { BaseMetricsDTO, DerivedMetricsDTO } from "@/types";

/**
 * Oblicza współczynnik klikalności (Click-Through Rate)
 * CTR = liczba kliknięć / liczba wyświetleń
 */
export function calculateCTR(impressions: number, clicks: number): number {
  if (impressions <= 0) return 0;
  return clicks / impressions;
}

/**
 * Oblicza koszt za kliknięcie (Cost Per Click)
 * CPC = koszt / liczba kliknięć
 */
export function calculateCPC(spend: number, clicks: number): number {
  if (clicks <= 0) return 0;
  return spend / clicks;
}

/**
 * Oblicza koszt za konwersję (Cost Per Conversion)
 * CPA = koszt / liczba konwersji
 */
export function calculateCostPerConversion(spend: number, conversions: number): number {
  if (conversions <= 0) return 0;
  return spend / conversions;
}

/**
 * Oblicza zwrot z wydatków na reklamę (Return On Ad Spend)
 * ROAS = przychód / koszt
 */
export function calculateROAS(revenue: number, spend: number): number {
  if (spend <= 0) return 0;
  return revenue / spend;
}

/**
 * Generuje wszystkie pochodne metryki na podstawie metryki bazowej
 */
export function calculateDerivedMetrics(metrics: BaseMetricsDTO): DerivedMetricsDTO {
  const ctr = calculateCTR(metrics.impressions, metrics.clicks);
  const cpc = calculateCPC(metrics.spend, metrics.clicks);
  const cost_per_conversion = calculateCostPerConversion(metrics.spend, metrics.conversions);
  const roas = calculateROAS(metrics.revenue, metrics.spend);

  return {
    ...metrics,
    ctr,
    cpc,
    cost_per_conversion,
    roas,
  };
}

/**
 * Oblicza procentową zmianę między dwiema wartościami
 * Jeśli stara wartość wynosi 0, zwraca 1 (100%) dla nowej wartości > 0
 * lub 0 dla nowej wartości = 0
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) {
    return newValue > 0 ? 1 : 0;
  }
  return (newValue - oldValue) / Math.abs(oldValue);
}

/**
 * Porównuje metryki z dwóch okresów i zwraca procent zmiany
 */
export function compareMetrics(previousPeriod: BaseMetricsDTO, currentPeriod: BaseMetricsDTO): Record<string, number> {
  return {
    impressions_change: calculatePercentageChange(previousPeriod.impressions, currentPeriod.impressions),
    clicks_change: calculatePercentageChange(previousPeriod.clicks, currentPeriod.clicks),
    spend_change: calculatePercentageChange(previousPeriod.spend, currentPeriod.spend),
    conversions_change: calculatePercentageChange(previousPeriod.conversions, currentPeriod.conversions),
    revenue_change: calculatePercentageChange(previousPeriod.revenue, currentPeriod.revenue),
  };
}

/**
 * Agreguje wiele metryk do jednego obiektu metryk
 */
export function aggregateMetrics(metricsArray: BaseMetricsDTO[]): BaseMetricsDTO {
  return metricsArray.reduce(
    (acc, metrics) => ({
      impressions: acc.impressions + metrics.impressions,
      clicks: acc.clicks + metrics.clicks,
      spend: acc.spend + metrics.spend,
      conversions: acc.conversions + metrics.conversions,
      revenue: acc.revenue + metrics.revenue,
    }),
    { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 }
  );
}

/**
 * Filtruje metryki z danych dzienny po określonym zakresie dat
 */
export function filterMetricsByDateRange(
  dailyMetrics: ({ date: string } & BaseMetricsDTO)[],
  startDate: string,
  endDate: string
): ({ date: string } & BaseMetricsDTO)[] {
  return dailyMetrics.filter((metric) => metric.date >= startDate && metric.date <= endDate);
}

export {}; // Add an export to make it a module
