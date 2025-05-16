import React from 'react';
import { ToastProvider, Toaster } from './hooks/useToast';
import ImportForm from './ImportForm';

interface ImportSectionProps {
  onImportSuccess: (data: { id: string }) => void;
}

const ImportSection: React.FC<ImportSectionProps> = ({ onImportSuccess }) => {
  return (
    <ToastProvider>
      <ImportForm onImportSuccess={onImportSuccess} />
      <Toaster />
    </ToastProvider>
  );
};

export default ImportSection; 