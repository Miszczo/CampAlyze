import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface AIAnalysisButtonProps {
  importId: string;
  onAnalysisComplete: (insights: string) => void;
  onAnalysisError?: (errorMessage: string) => void;
}

const AIAnalysisButton: React.FC<AIAnalysisButtonProps> = ({ importId, onAnalysisComplete, onAnalysisError }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/imports/${importId}/analyze`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze import');
      }

      if (result.insights) {
        onAnalysisComplete(result.insights);
        toast.success("Wygenerowano wnioski AI.");
      } else {
        throw new Error('No insights returned from analysis.');
      }

    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      const errorMessage = error.message || 'An unexpected error occurred during AI analysis.';
      toast.error(errorMessage);
      if (onAnalysisError) {
        onAnalysisError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleAnalyze} disabled={isLoading} className="mt-4">
      {isLoading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Insights...</>
      ) : (
        <><Brain className="mr-2 h-4 w-4" /> Generate AI Insights</>
      )}
    </Button>
  );
};

export default AIAnalysisButton; 