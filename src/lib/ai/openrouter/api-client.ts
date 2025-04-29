export class OpenRouterApiClient {
  private readonly baseUrl = 'https://openrouter.ai/api/v1';

  constructor(private apiKey: string) {}

  async sendRequest(endpoint: string, payload: any): Promise<any> {
    // TODO: Implementacja logiki wysyłania zapytań do API
    throw new Error('Not implemented');
  }
} 