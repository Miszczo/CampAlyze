import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FeatureTabs() {
  return (
    <Tabs defaultValue="dashboard" className="w-full">
      <TabsList data-testid="tabs-list" className="w-full max-w-lg mx-auto mb-8 bg-white/10">
        <TabsTrigger
          value="dashboard"
          className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900"
        >
          Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="imports"
          className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900"
        >
          Import danych
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-white data-[state=active]:bg-white data-[state=active]:text-purple-900">
          AI Insights
        </TabsTrigger>
      </TabsList>

      <TabsContent data-testid="dashboard-tab-content" value="dashboard" className="p-2">
        <div className="w-full h-[400px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-75"
            >
              <rect width="20" height="14" x="2" y="3" rx="2"></rect>
              <line x1="8" x2="16" y1="21" y2="21"></line>
              <line x1="12" x2="12" y1="17" y2="21"></line>
              <path d="M2 10h20"></path>
            </svg>
            <p className="text-2xl font-medium">Interaktywny dashboard z kluczowymi metrykami</p>
            <p className="mt-2 text-blue-200/70">Monitoruj CPC, CTR, konwersje, koszt/konwersję i ROAS</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent data-testid="imports-tab-content" value="imports" className="p-2">
        <div className="w-full h-[400px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-75"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p className="text-2xl font-medium">Prosty import danych z Google Ads i Meta Ads</p>
            <p className="mt-2 text-blue-200/70">Importuj dane z plików CSV/XLSX w kilku krokach</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent data-testid="ai-insights-tab-content" value="ai" className="p-2">
        <div className="w-full h-[400px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 relative overflow-hidden flex items-center justify-center">
          <div className="text-center text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-4 opacity-75"
            >
              <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"></path>
              <path d="M12 6v4"></path>
              <path d="M12 14h.01"></path>
            </svg>
            <p className="text-2xl font-medium">Automatyczne podsumowania i rekomendacje AI</p>
            <p className="mt-2 text-blue-200/70">Skorzystaj z mocy AI do analizy i optymalizacji kampanii</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
