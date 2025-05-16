// Plik: src/pages/api/imports/upload.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { randomUUID } from "crypto";
import type * as Crypto from 'crypto';
import { POST } from "./upload";
import type { APIContext } from "astro";

// Mockujemy moduł crypto
vi.mock("crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof Crypto>();
  return {
    ...actual,
    randomUUID: vi.fn().mockReturnValue("123e4567-e89b-12d3-a456-426614174000")
  };
});

// Mock dla File.arrayBuffer()
const createMockFile = (content = 'test,data,content', name = 'test.csv', type = 'text/csv', size = 1024) => {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  
  // Nadpisujemy arrayBuffer, który jest używany w kodzie
  file.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(size));
  
  // Nadpisujemy size jeśli potrzeba specyficznego rozmiaru
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false,
    configurable: true
  });
  
  return file;
};

// Mock dla FormData
class MockFormData {
  private data = new Map();
  
  append(key, value) {
    this.data.set(key, value);
  }
  
  get(key) {
    return this.data.get(key);
  }

  has(key) {
    return this.data.has(key);
  }
}

// Funkcja pomocnicza tworząca standardowe mocki dla Supabase
const createMockSupabase = () => {
  // Mock dla sesji
  const mockSession = {
    user: { id: 'user-123' },
    access_token: 'mock-token'
  };

  // Mock dla auth.getSession
  const mockGetSession = vi.fn().mockResolvedValue({
    data: { session: mockSession },
    error: null
  });

  // Mock dla operacji storage
  const mockUpload = vi.fn().mockResolvedValue({
    data: { path: 'org-123/google/123e4567-e89b-12d3-a456-426614174000.csv' },
    error: null
  });
  
  const mockRemove = vi.fn().mockResolvedValue({
    data: {},
    error: null
  });
  
  const mockStorageFrom = vi.fn().mockReturnValue({
    upload: mockUpload,
    remove: mockRemove
  });

  // Mock dla operacji DB
  const mockSingle = vi.fn().mockResolvedValue({
    data: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      original_filename: 'test.csv',
      status: 'pending',
    },
    error: null
  });
  
  const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
  
  // Mock dla from()
  const mockFrom = vi.fn().mockReturnValue({ 
    insert: mockInsert 
  });
  
  return {
    auth: { getSession: mockGetSession },
    storage: { from: mockStorageFrom },
    from: mockFrom,
    // Dodajemy referencje do wewnętrznych funkcji, by ułatwić modyfikację w testach
    _mocks: {
      getSession: mockGetSession,
      upload: mockUpload,
      remove: mockRemove,
      storageFrom: mockStorageFrom,
      single: mockSingle,
      select: mockSelect,
      insert: mockInsert,
      from: mockFrom
    }
  };
};

// Test sprawdzający mockowanie randomUUID
describe("Mockowanie crypto.randomUUID", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinno zwrócić zamockowaną wartość UUID", () => {
    const result = randomUUID();
    expect(result).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(vi.mocked(randomUUID)).toHaveBeenCalledTimes(1);
  });
});

// Rozszerzony zestaw testów dla endpointu
describe("POST /api/imports/upload", () => {
  let mockSupabase;
  let mockFile;
  let mockRequest;
  let mockContext;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Przygotowanie mocka pliku z implementacją arrayBuffer
    mockFile = createMockFile();
    
    // Przygotowanie mocka formData
    global.FormData = MockFormData as any;
    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('platform_id', 'google');
    formData.append('organization_id', '123e4567-e89b-12d3-a456-426614174001');
    
    // Przygotowanie mocka Request
    mockRequest = {
      method: 'POST',
      formData: vi.fn().mockResolvedValue(formData)
    };
    
    // Inicjalizacja mocka Supabase
    mockSupabase = createMockSupabase();
    
    // Przygotowanie kontekstu API
    mockContext = {
      locals: { supabase: mockSupabase },
      request: mockRequest
    } as unknown as APIContext;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test dla nieautoryzowanego użytkownika
  it("powinno zwrócić 401 dla nieautoryzowanego użytkownika", async () => {
    // Symulujemy brak sesji użytkownika
    mockSupabase._mocks.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null
    });

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(401);
    expect(responseBody.error).toBe("Unauthorized");
    expect(mockSupabase.auth.getSession).toHaveBeenCalled();
  });

  // Test dla scenariusza gdy brakuje pliku
  it("powinno zwrócić 400 gdy brak pliku", async () => {
    // Tworzymy formData bez pliku, ale z pozostałymi parametrami
    const formDataWithoutFile = new FormData();
    formDataWithoutFile.append('platform_id', 'google');
    formDataWithoutFile.append('organization_id', '123e4567-e89b-12d3-a456-426614174001');
    
    mockContext.request.formData.mockResolvedValueOnce(formDataWithoutFile);

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe("Missing file");
  });

  // Test dla nieprawidłowego typu pliku
  it("powinno zwrócić 400 dla nieprawidłowego typu pliku", async () => {
    // Symulacja pliku JSON zamiast CSV
    const jsonFile = createMockFile('{"test":"data"}', 'test.json', 'application/json');
    
    const formData = new FormData();
    formData.append('file', jsonFile);
    formData.append('platform_id', 'google');
    formData.append('organization_id', '123e4567-e89b-12d3-a456-426614174001');
    
    mockContext.request.formData.mockResolvedValueOnce(formData);

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe("Invalid file type. Only text/csv allowed.");
  });

  // Test dla zbyt dużego pliku
  it("powinno zwrócić 413 dla zbyt dużego pliku", async () => {
    // Symulacja dużego pliku (> 5MB)
    const largeFile = createMockFile('test,data,content', 'test.csv', 'text/csv', 6 * 1024 * 1024);
    
    const formData = new FormData();
    formData.append('file', largeFile);
    formData.append('platform_id', 'google');
    formData.append('organization_id', '123e4567-e89b-12d3-a456-426614174001');
    
    mockContext.request.formData.mockResolvedValueOnce(formData);

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(413);
    expect(responseBody.error).toBe("File too large. Max size is 5MB.");
  });

  // Test dla nieprawidłowych parametrów
  it("powinno zwrócić 400 dla nieprawidłowego platform_id lub organization_id", async () => {
    // Nieprawidłowa platforma (nie meta/google)
    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('platform_id', 'invalid-platform');
    formData.append('organization_id', '123e4567-e89b-12d3-a456-426614174001');
    
    mockContext.request.formData.mockResolvedValueOnce(formData);

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(400);
    expect(responseBody.error).toBe("Invalid platform_id or organization_id");
  });

  // Test dla błędu podczas uploadowania do storage
  it("powinno zwrócić 500 przy błędzie uploadu do storage", async () => {
    // Symulacja błędu storage
    mockSupabase._mocks.upload.mockResolvedValueOnce({
      data: null, 
      error: { message: "Storage error" }
    });

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe("Failed to upload file to storage");
    expect(mockSupabase.storage.from).toHaveBeenCalledWith("imports");
  });

  // Test dla błędu podczas insertu do bazy danych
  it("powinno zwrócić 500 przy błędzie insertu do bazy danych", async () => {
    // Symulacja poprawnego uploadu, ale błąd bazy
    mockSupabase._mocks.single.mockResolvedValueOnce({
      data: null,
      error: { message: "Database error" }
    });

    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody.error).toBe("Failed to create import record");
    
    // Sprawdzamy czy próbowano usunąć wysłany plik
    expect(mockSupabase.storage.from).toHaveBeenCalledWith("imports");
    expect(mockSupabase._mocks.remove).toHaveBeenCalled();
  });

  // Test dla poprawnego uploadu i insertu
  it("powinno zwrócić 201 przy poprawnym uploadzie i insercie", async () => {
    const response = await POST(mockContext);
    const responseBody = await response.json();

    expect(response.status).toBe(201);
    expect(responseBody).toHaveProperty("id", "123e4567-e89b-12d3-a456-426614174000");
    expect(responseBody).toHaveProperty("original_filename", "test.csv");
    expect(responseBody).toHaveProperty("status", "pending");
  });
});
