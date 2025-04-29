// @jest-environment jsdom
import { uploadImportFile } from './importUpload';
import type { ImportFileResponseDTO } from '@/types';

describe('uploadImportFile', () => {
  const mockFile = new File(['test'], 'test.csv', { type: 'text/csv', lastModified: Date.now() });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('wysyła plik i zwraca ImportFileResponseDTO przy statusie 201', async () => {
    const mockResponse: ImportFileResponseDTO = {
      id: '123',
      original_filename: 'test.csv',
      status: 'pending',
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 201,
      json: async () => mockResponse,
    });
    const result = await uploadImportFile(mockFile);
    expect(result).toEqual(mockResponse);
  });

  it('rzuca błąd gdy nie podano pliku', async () => {
    // @ts-expect-error testujemy brak pliku
    await expect(uploadImportFile(undefined)).rejects.toThrow('Wybierz plik do importu.');
  });

  it('rzuca błąd gdy plik za duży', async () => {
    const bigFile = new File([new Array(11 * 1024 * 1024).join('a')], 'big.csv');
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 });
    await expect(uploadImportFile(bigFile)).rejects.toThrow('Plik przekracza maksymalny rozmiar 10MB.');
  });

  it('rzuca błąd dla statusu 400', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ status: 400 });
    await expect(uploadImportFile(mockFile)).rejects.toThrow('Nieprawidłowe dane lub brak pliku.');
  });

  it('rzuca błąd dla statusu 401', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ status: 401 });
    await expect(uploadImportFile(mockFile)).rejects.toThrow('Musisz być zalogowany, aby importować pliki.');
  });

  it('rzuca błąd dla statusu 413', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ status: 413 });
    await expect(uploadImportFile(mockFile)).rejects.toThrow('Plik jest zbyt duży.');
  });

  it('rzuca błąd dla innych statusów', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ status: 500 });
    await expect(uploadImportFile(mockFile)).rejects.toThrow('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
  });
}); 