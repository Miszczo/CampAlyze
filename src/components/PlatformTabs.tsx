import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3 } from "lucide-react";

export function PlatformTabs() {
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
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Wykresy porównawcze platform będą dostępne po zaimportowaniu danych.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="google">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Dane Google Ads będą dostępne po zaimportowaniu.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="meta">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-40 bg-gray-50 rounded-md border border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-10 w-10 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Dane Meta Ads będą dostępne po zaimportowaniu.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default PlatformTabs;
