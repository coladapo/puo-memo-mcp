/**
 * HTTP transport layer for PUO Memo API communication
 * Handles retries, authentication, and error handling
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { createErrorFromResponse, NetworkError, TimeoutError } from '../client/errors';

interface TransportConfig {
  baseURL: string;
  apiKey: string;
  timeout: number;
  retries: number;
  version: string;
}

export class ApiTransport {
  private axios: AxiosInstance;
  private config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
    
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'X-API-Key': config.apiKey,
        'X-Client-Version': config.version,
        'Content-Type': 'application/json',
        'User-Agent': `puo-memo-mcp/${config.version}`
      }
    });

    this.setupInterceptors();
  }

  async get<T>(path: string, params?: any): Promise<T> {
    return this.request<T>({ method: 'GET', url: path, params });
  }

  async post<T>(path: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'POST', url: path, data });
  }

  async put<T>(path: string, data?: any): Promise<T> {
    return this.request<T>({ method: 'PUT', url: path, data });
  }

  async delete(path: string): Promise<void> {
    return this.request<void>({ method: 'DELETE', url: path });
  }

  async postForm<T>(path: string, formData: FormData): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url: path,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await this.axios.request<T>(config);
        return response.data;
      } catch (error) {
        lastError = this.handleRequestError(error as AxiosError);
        
        // Don't retry if it's not a retryable error
        if (!this.isRetryable(lastError) || attempt === this.config.retries) {
          throw lastError;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await this.sleep(delay);
      }
    }
    
    throw lastError!;
  }

  private setupInterceptors() {
    // Request interceptor for adding timestamps
    this.axios.interceptors.request.use((config) => {
      config.headers['X-Request-ID'] = this.generateRequestId();
      config.headers['X-Timestamp'] = new Date().toISOString();
      return config;
    });

    // Response interceptor for handling rate limits
    this.axios.interceptors.response.use(
      (response) => {
        // Extract rate limit headers if present
        const remaining = response.headers['x-ratelimit-remaining'];
        const reset = response.headers['x-ratelimit-reset'];
        
        if (remaining !== undefined) {
          this.handleRateLimitHeaders(parseInt(remaining), parseInt(reset));
        }
        
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  private handleRequestError(error: AxiosError): Error {
    if (error.response) {
      return createErrorFromResponse(error.response);
    }
    
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new TimeoutError('Request timed out');
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return new NetworkError(`Cannot connect to API: ${error.message}`);
    }
    
    return new NetworkError(error.message);
  }

  private isRetryable(error: Error): boolean {
    // Network errors are retryable
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return true;
    }
    
    // 5xx errors are retryable
    if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode >= 500) {
      return true;
    }
    
    // Rate limit errors are retryable after delay
    if ('statusCode' in error && error.statusCode === 429) {
      return true;
    }
    
    return false;
  }

  private handleRateLimitHeaders(remaining: number, reset: number) {
    // Could emit events or log warnings when approaching limits
    if (remaining < 10) {
      console.warn(`[PuoMemo] API rate limit approaching: ${remaining} requests remaining`);
    }
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}