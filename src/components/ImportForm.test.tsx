import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportForm from './ImportForm';

// Mock fetch API
global.fetch = vi.fn();

describe('ImportForm component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the form correctly', () => {
    render(<ImportForm />);
    
    expect(screen.getByLabelText(/wybierz plik/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /importuj/i })).toBeInTheDocument();
  });

  it('shows error when no file is selected', async () => {
    render(<ImportForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /importuj/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/wybierz plik do importu/i)).toBeInTheDocument();
    });
  });

  it('handles file upload success', async () => {
    const mockSuccessResponse = {
      id: 'import-123',
      original_filename: 'test.csv',
      status: 'pending'
    };
    
    (global.fetch as any).mockResolvedValue({
      status: 201,
      json: async () => mockSuccessResponse
    });
    
    const mockOnSuccess = vi.fn();
    render(<ImportForm onImportSuccess={mockOnSuccess} />);
    
    // Create a mock file and add it to the input
    const file = new File(['file contents'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/wybierz plik/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    fireEvent.click(screen.getByRole('button', { name: /importuj/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/imports/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
      expect(mockOnSuccess).toHaveBeenCalledWith(mockSuccessResponse);
    });
  });

  it('handles file upload error', async () => {
    (global.fetch as any).mockResolvedValue({
      status: 400,
      json: async () => ({ error: 'Nieprawidłowy format pliku' })
    });
    
    render(<ImportForm />);
    
    // Create a mock file and add it to the input
    const file = new File(['file contents'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/wybierz plik/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    fireEvent.click(screen.getByRole('button', { name: /importuj/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/nieprawidłowy format pliku/i)).toBeInTheDocument();
    });
  });

  it('disables the submit button during upload', async () => {
    // Mock with delayed response
    (global.fetch as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => {
        resolve({
          status: 201,
          json: async () => ({
            id: 'import-123',
            original_filename: 'test.csv',
            status: 'pending'
          })
        });
      }, 100))
    );
    
    render(<ImportForm />);
    
    // Create a mock file and add it to the input
    const file = new File(['file contents'], 'test.csv', { type: 'text/csv' });
    const fileInput = screen.getByLabelText(/wybierz plik/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    
    fireEvent.change(fileInput);
    fireEvent.click(screen.getByRole('button', { name: /importuj/i }));
    
    // Check button is disabled during upload
    expect(screen.getByRole('button', { name: /importuj/i })).toBeDisabled();
    
    // Wait for the upload to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
}); 