import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";
import type { DailyMetricDataPoint } from "../types";
import CampaignChart from "./CampaignChart";

interface PlatformTabsProps {
  timeSeriesData: DailyMetricDataPoint[];
}

export function PlatformTabs({ timeSeriesData = [] }: PlatformTabsProps) {
  // Grupowanie danych według platformy
  const platformData = useMemo(() => {
    const dataByPlatform: Record<string, DailyMetricDataPoint[]> = {
      google_ads: [],
      meta_ads: [],
    };

    // Grupuj dane według platformy
    timeSeriesData.forEach((dataPoint) => {
      if (dataPoint.platform_id) {
        const platform = dataPoint.platform_id.toLowerCase();
        if (platform.includes("google")) {
          dataByPlatform.google_ads.push(dataPoint);
        } else if (platform.includes("meta") || platform.includes("facebook")) {
          dataByPlatform.meta_ads.push(dataPoint);
        }
      }
    });

    return dataByPlatform;
  }, [timeSeriesData]);

  // Sprawdź czy mamy dane dla poszczególnych platform
  const hasGoogleData = platformData.google_ads.length > 0;
  const hasMetaData = platformData.meta_ads.length > 0;
  const hasAnyData = hasGoogleData || hasMetaData;

  // Agreguj podstawowe metryki dla każdej platformy
  const platformMetrics = useMemo(() => {
    const metrics: Record<string, { impressions: number; clicks: number; spend: number; ctr: number; cpc: number }> = {
      google_ads: { impressions: 0, clicks: 0, spend: 0, ctr: 0, cpc: 0 },
      meta_ads: { impressions: 0, clicks: 0, spend: 0, ctr: 0, cpc: 0 },
    };

    // Agregacja dla Google Ads
    if (hasGoogleData) {
      const googleData = platformData.google_ads;
      metrics.google_ads.impressions = googleData.reduce((sum, item) => sum + (item.impressions || 0), 0);
      metrics.google_ads.clicks = googleData.reduce((sum, item) => sum + (item.clicks || 0), 0);
      metrics.google_ads.spend = googleData.reduce((sum, item) => sum + (item.spend || 0), 0);
      metrics.google_ads.ctr =
        metrics.google_ads.impressions > 0 ? (metrics.google_ads.clicks / metrics.google_ads.impressions) * 100 : 0;
      metrics.google_ads.cpc = metrics.google_ads.clicks > 0 ? metrics.google_ads.spend / metrics.google_ads.clicks : 0;
    }

    // Agregacja dla Meta Ads
    if (hasMetaData) {
      const metaData = platformData.meta_ads;
      metrics.meta_ads.impressions = metaData.reduce((sum, item) => sum + (item.impressions || 0), 0);
      metrics.meta_ads.clicks = metaData.reduce((sum, item) => sum + (item.clicks || 0), 0);
      metrics.meta_ads.spend = metaData.reduce((sum, item) => sum + (item.spend || 0), 0);
      metrics.meta_ads.ctr =
        metrics.meta_ads.impressions > 0 ? (metrics.meta_ads.clicks / metrics.meta_ads.impressions) * 100 : 0;
      metrics.meta_ads.cpc = metrics.meta_ads.clicks > 0 ? metrics.meta_ads.spend / metrics.meta_ads.clicks : 0;
    }

    return metrics;
  }, [hasGoogleData, hasMetaData, platformData]);

  // Formatowanie wartości
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("pl-PL").format(Math.round(num));
  };

  const formatCurrency = (num: number): string => {
    return `${num.toFixed(2)} PLN`;
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <Tabs defaultValue="all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Porównanie platform</h2>
        <TabsList>
          <TabsTrigger value="all">Wszystkie</TabsTrigger>
          <TabsTrigger value="google">Google Ads</TabsTrigger>
          <TabsTrigger value="meta">Meta Ads</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all">
        <Card>
          <CardContent className="p-6">
            {hasAnyData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Ads Card */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-md font-medium mb-2">Google Ads</h3>
                  {hasGoogleData ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Wyświetlenia</p>
                        <p className="text-sm font-medium">{formatNumber(platformMetrics.google_ads.impressions)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kliknięcia</p>
                        <p className="text-sm font-medium">{formatNumber(platformMetrics.google_ads.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CTR</p>
                        <p className="text-sm font-medium">{formatPercentage(platformMetrics.google_ads.ctr)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CPC</p>
                        <p className="text-sm font-medium">{formatCurrency(platformMetrics.google_ads.cpc)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Brak danych dla Google Ads</p>
                  )}
                </div>

                {/* Meta Ads Card */}
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-md font-medium mb-2">Meta Ads</h3>
                  {hasMetaData ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Wyświetlenia</p>
                        <p className="text-sm font-medium">{formatNumber(platformMetrics.meta_ads.impressions)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kliknięcia</p>
                        <p className="text-sm font-medium">{formatNumber(platformMetrics.meta_ads.clicks)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CTR</p>
                        <p className="text-sm font-medium">{formatPercentage(platformMetrics.meta_ads.ctr)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CPC</p>
                        <p className="text-sm font-medium">{formatCurrency(platformMetrics.meta_ads.cpc)}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Brak danych dla Meta Ads</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Wykresy porównawcze platform będą dostępne po zaimportowaniu danych.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="google">
        <Card>
          <CardContent className="p-6">
            {hasGoogleData ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-md font-medium mb-4">Google Ads - podsumowanie</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Wyświetlenia</p>
                      <p className="text-sm font-medium">{formatNumber(platformMetrics.google_ads.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kliknięcia</p>
                      <p className="text-sm font-medium">{formatNumber(platformMetrics.google_ads.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CTR</p>
                      <p className="text-sm font-medium">{formatPercentage(platformMetrics.google_ads.ctr)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CPC</p>
                      <p className="text-sm font-medium">{formatCurrency(platformMetrics.google_ads.cpc)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Wydane</p>
                      <p className="text-sm font-medium">{formatCurrency(platformMetrics.google_ads.spend)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kampanie</p>
                      <p className="text-sm font-medium">
                        {new Set(platformData.google_ads.map((d) => d.campaign_id)).size}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-medium mb-2 text-gray-600">Trend kliknięć - Google Ads</h4>
                  <CampaignChart
                    data={platformData.google_ads}
                    metric="clicks"
                    metricLabel="Kliknięcia"
                    color="#4285F4"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Dane Google Ads będą dostępne po zaimportowaniu.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="meta">
        <Card>
          <CardContent className="p-6">
            {hasMetaData ? (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                  <h3 className="text-md font-medium mb-4">Meta Ads - podsumowanie</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Wyświetlenia</p>
                      <p className="text-sm font-medium">{formatNumber(platformMetrics.meta_ads.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kliknięcia</p>
                      <p className="text-sm font-medium">{formatNumber(platformMetrics.meta_ads.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CTR</p>
                      <p className="text-sm font-medium">{formatPercentage(platformMetrics.meta_ads.ctr)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CPC</p>
                      <p className="text-sm font-medium">{formatCurrency(platformMetrics.meta_ads.cpc)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Wydane</p>
                      <p className="text-sm font-medium">{formatCurrency(platformMetrics.meta_ads.spend)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kampanie</p>
                      <p className="text-sm font-medium">
                        {new Set(platformData.meta_ads.map((d) => d.campaign_id)).size}
                      </p>
                    </div>
                    {platformData.meta_ads.some((d) => d.reach) && (
                      <div>
                        <p className="text-xs text-gray-500">Zasięg</p>
                        <p className="text-sm font-medium">
                          {formatNumber(platformData.meta_ads.reduce((sum, item) => sum + (item.reach || 0), 0))}
                        </p>
                      </div>
                    )}
                    {platformData.meta_ads.some((d) => d.conversion_type) && (
                      <div>
                        <p className="text-xs text-gray-500">Typy konwersji</p>
                        <p className="text-sm font-medium">
                          {new Set(platformData.meta_ads.map((d) => d.conversion_type).filter(Boolean)).size}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                  <h4 className="text-sm font-medium mb-2 text-gray-600">Trend kliknięć - Meta Ads</h4>
                  <CampaignChart
                    data={platformData.meta_ads}
                    metric="clicks"
                    metricLabel="Kliknięcia"
                    color="#1877F2"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300">
                <div className="text-center">
                  <BarChart3 className="h-10 w-10 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Dane Meta Ads będą dostępne po zaimportowaniu.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default PlatformTabs;
