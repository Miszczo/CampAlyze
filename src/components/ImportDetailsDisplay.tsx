import React, { useState, useEffect } from "react";
import type { ImportDetail, Platform } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AIAnalysisButton from "./AIAnalysisButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import { Toaster } from "sonner";

interface ImportDetailsDisplayProps {
  importDetails?: ImportDetail;
  platforms: Platform[];
}

const ImportDetailsDisplay: React.FC<ImportDetailsDisplayProps> = ({ importDetails, platforms }) => {
  const [platformName, setPlatformName] = useState<string>("Unknown Platform");
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (importDetails && importDetails.platform_id && platforms) {
      const platform = platforms.find((p) => p.id === importDetails.platform_id);
      if (platform) {
        setPlatformName(platform.name);
      }
    } else if (!importDetails) {
      setPlatformName("Loading platform...");
    }
  }, [importDetails, platforms]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  const handleAnalysisComplete = (insights: string) => {
    setAiInsights(insights);
    setAiError(null);
  };

  const handleAnalysisError = (errorMessage: string) => {
    setAiError(errorMessage);
    setAiInsights(null);
  };

  if (!importDetails) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="ml-3 text-lg text-gray-600">Loading import details...</p>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Import Details: {importDetails.file_name || "N/A"}</CardTitle>
          <CardDescription>Detailed information about the imported file.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Import ID</p>
              <p className="text-lg">{importDetails.id || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Platform</p>
              <Badge variant="outline" className="text-lg">
                {platformName}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">File Size</p>
              <p className="text-lg">
                {importDetails.file_size ? (importDetails.file_size / 1024).toFixed(2) + " KB" : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Upload Date</p>
              <p className="text-lg">{formatDate(importDetails.created_at)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge
                variant={
                  importDetails.status === "completed"
                    ? "success"
                    : importDetails.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
                className="text-lg"
              >
                {importDetails.status || "N/A"}
              </Badge>
            </div>
            {importDetails.processed_at && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Processed Date</p>
                <p className="text-lg">{formatDate(importDetails.processed_at)}</p>
              </div>
            )}
          </div>

          {importDetails.column_mappings &&
            typeof importDetails.column_mappings === "object" &&
            Object.keys(importDetails.column_mappings).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Column Mappings</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Original Header</TableHead>
                      <TableHead>Mapped To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(importDetails.column_mappings).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{value as string}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

          {importDetails.error_message && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Import Error</AlertTitle>
              <AlertDescription>{importDetails.error_message}</AlertDescription>
            </Alert>
          )}

          {/* AI Analysis Section */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
            <AIAnalysisButton
              importId={importDetails.id}
              onAnalysisComplete={handleAnalysisComplete}
              onAnalysisError={handleAnalysisError}
            />

            {aiError && (
              <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>AI Analysis Failed</AlertTitle>
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}

            {aiInsights && (
              <Card className="mt-4 bg-slate-50 dark:bg-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg">Generated Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-transparent p-0 m-0">{aiInsights}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
      <Toaster position="top-right" richColors />
    </>
  );
};

export default ImportDetailsDisplay;
