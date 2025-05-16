import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "../components/hooks/useToast";
import type { ImportFileResponseDTO } from "../types";

interface ImportFormProps {
  onImportSuccess?: (data: ImportFileResponseDTO) => void;
  onImportError?: (error: Error) => void;
}

export default function ImportForm({ onImportSuccess, onImportError }: ImportFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      setError("Wybierz plik do importu.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    // Dodaj parametr platformy (potrzebny dla API)
    formData.append("platform_id", "google"); // Domyślna platforma

    try {
      const response = await fetch("/api/imports/upload", {
        method: "POST",
        body: formData,
      });

      if (response.status === 201) {
        const data = await response.json();
        toast({
          title: "Import rozpoczęty",
          description: "Plik został wysłany do przetwarzania.",
          variant: "default",
        });

        if (onImportSuccess) {
          onImportSuccess(data);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Wystąpił błąd podczas importu.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);

      toast({
        title: "Błąd importu",
        description: errorMessage,
        variant: "destructive",
      });

      if (onImportError) {
        onImportError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Importuj plik danych</CardTitle>
        <CardDescription>Wybierz plik CSV lub XLSX do analizy kampanii reklamowych</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} aria-label="Formularz importu pliku">
          <div className="mb-4">
            <Label htmlFor="file-input">Wybierz plik</Label>
            <Input
              id="file-input"
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className="mt-1"
              aria-describedby="file-desc"
              disabled={isUploading}
              required
            />
            <p id="file-desc" className="text-muted-foreground text-sm mt-1">
              Wybierz plik CSV lub XLSX z danymi kampanii reklamowych. Maksymalny rozmiar: 10MB.
            </p>
          </div>

          {error && (
            <div
              className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md mb-4 flex items-center"
              role="alert"
              data-testid="error-alert"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isUploading}
            data-testid="import-button"
            aria-disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              "Importuj"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
