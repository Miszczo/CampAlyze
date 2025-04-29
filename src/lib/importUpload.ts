import type { ImportFileResponseDTO } from '@/types';

/**
 * Wysyła plik do endpointu importu.
 * Zwraca ImportFileResponseDTO lub rzuca błąd z komunikatem.
 */
export async function uploadImportFile(file: File): Promise<ImportFileResponseDTO> {
  if (!file) {
    throw new Error('Wybierz plik do importu.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Plik przekracza maksymalny rozmiar 10MB.');
  }
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/imports/upload', {
    method: 'POST',
    body: formData,
  });

  if (res.status === 201) {
    return await res.json();
  } else if (res.status === 400) {
    throw new Error('Nieprawidłowe dane lub brak pliku.');
  } else if (res.status === 401) {
    throw new Error('Musisz być zalogowany, aby importować pliki.');
  } else if (res.status === 413) {
    throw new Error('Plik jest zbyt duży.');
  } else {
    throw new Error('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
  }
} 