import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

interface AIAnalysisButtonProps {
  campaignId: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

export default function AIAnalysisButton({
  campaignId,
  dateRangeStart,
  dateRangeEnd,
}: AIAnalysisButtonProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState<string | null>(null);

  const handleAnalyzeClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai-insights/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          date_range_start: dateRangeStart,
          date_range_end: dateRangeEnd,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze campaign");
      }

      const data = await response.json();
      setAnalysis(data.data.content);
      setCampaignName(data.data.campaign_name);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {!analysis && !loading && (
        <Button 
          onClick={handleAnalyzeClick} 
          className="w-full"
        >
          Analyze Campaign Performance
        </Button>
      )}

      {loading && (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing campaign data...
        </Button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="block sm:inline">
              Error: {error}
            </span>
          </div>
        </div>
      )}

      {analysis && !loading && (
        <Card className="mt-4 border border-green-100 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">
              AI Analysis {campaignName && `for ${campaignName}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">{analysis}</div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 