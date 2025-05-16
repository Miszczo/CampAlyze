import React from 'react';
import type { ImportListItemDTO } from '../types';
import { ToastProvider, Toaster, useToast } from './hooks/useToast';
import { Button } from './ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ImportsDisplayProps {
  imports: ImportListItemDTO[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit"
  });
};

const DeleteButton: React.FC<{ importId: string, onSuccessfulDelete: (id: string) => void }> = ({ importId, onSuccessfulDelete }) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (confirm("Czy na pewno chcesz usunąć ten import?")) {
      try {
        const response = await fetch(`/api/imports/${importId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast({
            title: 'Sukces',
            description: 'Import został usunięty',
            variant: 'default'
          });
          onSuccessfulDelete(importId);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Nie udało się przetworzyć odpowiedzi serwera po błędzie usunięcia' }));
          throw new Error(errorData.error || "Nie udało się usunąć importu");
        }
      } catch (error) {
        console.error("Błąd podczas usuwania importu:", error);
        toast({
          title: 'Błąd',
          description: error instanceof Error ? error.message : String(error),
          variant: 'destructive'
        });
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="text-red-600 hover:text-red-900"
    >
      Usuń
    </button>
  );
};

const ImportsDisplay: React.FC<ImportsDisplayProps> = ({ imports: initialImports }) => {
  const [imports, setImports] = React.useState<ImportListItemDTO[]>(initialImports);

  const handleSuccessfulDelete = (deletedImportId: string) => {
    setImports(prevImports => prevImports.filter(imp => imp.id !== deletedImportId));
  };
  
  return (
    <ToastProvider>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" data-testid="imports-heading">Historia importów</h1>
          <p className="text-slate-500 mt-1">
            Lista wszystkich importowanych plików
          </p>
        </div>
        <a href="/imports-upload">
          <Button>Nowy import</Button>
        </a>
      </div>

      {imports.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Zaimportowane pliki ({imports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa pliku</TableHead>
                    <TableHead>Platforma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data importu</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports.map((importItem) => (
                    <TableRow key={importItem.id}>
                      <TableCell className="font-medium">{importItem.original_filename}</TableCell>
                      <TableCell>{importItem.platform_name}</TableCell>
                      <TableCell>
                        {importItem.status === "completed" && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Zakończony
                          </span>
                        )}
                        {importItem.status === "failed" && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800" title={importItem.error_message || ""}>
                            Błąd
                          </span>
                        )}
                        {importItem.status === "pending" && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Oczekujący
                          </span>
                        )}
                        {importItem.status === "processing" && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Przetwarzanie
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(importItem.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <a href={`/imports/${importItem.id}`} className="text-blue-600 hover:text-blue-800 mr-4">
                          Szczegóły
                        </a>
                        <DeleteButton importId={importItem.id} onSuccessfulDelete={handleSuccessfulDelete} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-600 mb-4">Brak zaimportowanych danych</p>
            <a href="/imports-upload">
              <Button>Importuj dane</Button>
            </a>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </ToastProvider>
  );
};

export default ImportsDisplay; 