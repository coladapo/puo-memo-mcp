/**
 * PUO Memo Client - Open Source MCP Client for PUO Memo Platform
 * 
 * Connect any MCP-compatible AI assistant to PUO Memo's memory infrastructure.
 * This client handles all communication with the PUO Memo platform API.
 */

import { EventEmitter } from 'events';
import { 
  Memory, 
  StoreOptions, 
  SearchOptions, 
  Entity, 
  Attachment,
  ClientConfig,
  ApiResponse,
  SearchType 
} from './types';
import { PuoMemoError, AuthenticationError, RateLimitError } from './errors';
import { ApiTransport } from '../api/transport';
import { TelemetryClient } from '../telemetry/analytics';

const DEFAULT_ENDPOINT = 'https://api.puo-memo.com/v1';
const CLIENT_VERSION = '1.0.0';

export class PuoMemoClient extends EventEmitter {
  private api: ApiTransport;
  private telemetry?: TelemetryClient;
  private config: Required<ClientConfig>;

  constructor(config: ClientConfig) {
    super();
    
    if (!config.apiKey) {
      throw new PuoMemoError('API key is required. Get yours at https://puo-memo.com');
    }

    this.config = {
      apiKey: config.apiKey,
      endpoint: config.endpoint || DEFAULT_ENDPOINT,
      telemetry: config.telemetry !== false, // Default true
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      debug: config.debug || false
    };

    this.api = new ApiTransport({
      baseURL: this.config.endpoint,
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
      retries: this.config.retries,
      version: CLIENT_VERSION
    });

    if (this.config.telemetry) {
      this.telemetry = new TelemetryClient({
        apiKey: this.config.apiKey,
        version: CLIENT_VERSION,
        endpoint: this.config.endpoint
      });
    }

    this.setupEventHandlers();
  }

  /**
   * Store a new memory in PUO Memo
   */
  async store(content: string, options?: StoreOptions): Promise<Memory> {
    try {
      this.emit('store:start', { content, options });
      
      const response = await this.api.post<Memory>('/memories', {
        content,
        ...options
      });

      this.telemetry?.track('memory.stored', {
        hasTitle: !!options?.title,
        hasTags: !!(options?.tags?.length),
        hasMetadata: !!options?.metadata,
        contentLength: content.length
      });

      this.emit('store:success', response);
      return response;
    } catch (error) {
      this.emit('store:error', error);
      throw this.handleError(error);
    }
  }

  /**
   * Search memories using natural language or keywords
   */
  async recall(
    query: string, 
    options?: SearchOptions
  ): Promise<Memory[]> {
    try {
      this.emit('recall:start', { query, options });
      
      const params = {
        q: query,
        search_type: options?.searchType || 'hybrid',
        limit: options?.limit || 10,
        offset: options?.offset || 0,
        ...options
      };

      const response = await this.api.get<Memory[]>('/memories/search', params);

      this.telemetry?.track('memory.searched', {
        searchType: params.search_type,
        resultCount: response.length,
        hasFilters: !!(options?.tags || options?.startDate || options?.endDate)
      });

      this.emit('recall:success', response);
      return response;
    } catch (error) {
      this.emit('recall:error', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific memory by ID
   */
  async getMemory(id: string): Promise<Memory> {
    try {
      const response = await this.api.get<Memory>(`/memories/${id}`);
      
      this.telemetry?.track('memory.retrieved', { id });
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing memory
   */
  async updateMemory(
    id: string, 
    updates: Partial<Omit<Memory, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<Memory> {
    try {
      const response = await this.api.put<Memory>(`/memories/${id}`, updates);
      
      this.telemetry?.track('memory.updated', { 
        id,
        fieldsUpdated: Object.keys(updates)
      });
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<void> {
    try {
      await this.api.delete(`/memories/${id}`);
      
      this.telemetry?.track('memory.deleted', { id });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * List entities extracted from memories
   */
  async getEntities(options?: {
    type?: Entity['type'];
    limit?: number;
    offset?: number;
  }): Promise<Entity[]> {
    try {
      const response = await this.api.get<Entity[]>('/entities', options);
      
      this.telemetry?.track('entities.listed', {
        type: options?.type,
        count: response.length
      });
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get entity relationship graph
   */
  async getEntityGraph(entityName: string, depth: number = 2): Promise<any> {
    try {
      const response = await this.api.get('/entities/graph', {
        entity_name: entityName,
        depth
      });
      
      this.telemetry?.track('entities.graph_retrieved', { entityName, depth });
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Attach a file to a memory
   */
  async attachFile(
    memoryId: string, 
    file: Buffer | Blob, 
    filename: string,
    mimeType?: string
  ): Promise<Attachment> {
    try {
      const formData = new FormData();
      formData.append('file', file instanceof Buffer ? new Blob([file]) : file, filename);
      
      if (mimeType) {
        formData.append('mime_type', mimeType);
      }

      const response = await this.api.postForm<Attachment>(
        `/memories/${memoryId}/attachments`,
        formData
      );
      
      this.telemetry?.track('attachment.created', {
        memoryId,
        filename,
        mimeType
      });
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recommendations based on context
   */
  async getRecommendations(context: string, limit: number = 5): Promise<Memory[]> {
    try {
      const response = await this.api.post<Memory[]>('/recommendations', {
        context,
        limit
      });
      
      this.telemetry?.track('recommendations.retrieved', {
        contextLength: context.length,
        recommendationCount: response.length
      });
      
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get API usage statistics
   */
  async getUsageStats(): Promise<{
    memories_count: number;
    searches_count: number;
    storage_used_mb: number;
    plan_limits: any;
  }> {
    try {
      return await this.api.get('/account/usage');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Health check for the API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get<{ status: string }>('/health');
      return response.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Close the client and cleanup resources
   */
  async close(): Promise<void> {
    this.telemetry?.flush();
    this.removeAllListeners();
  }

  private setupEventHandlers(): void {
    if (this.config.debug) {
      this.on('store:start', (data) => console.log('[PuoMemo] Storing memory...', data));
      this.on('store:success', (data) => console.log('[PuoMemo] Memory stored:', data.id));
      this.on('store:error', (error) => console.error('[PuoMemo] Store error:', error));
      this.on('recall:start', (data) => console.log('[PuoMemo] Searching...', data));
      this.on('recall:success', (data) => console.log('[PuoMemo] Found memories:', data.length));
      this.on('recall:error', (error) => console.error('[PuoMemo] Search error:', error));
    }
  }

  private handleError(error: any): Error {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        return new AuthenticationError(data.message || 'Invalid API key');
      }
      
      if (status === 429) {
        return new RateLimitError(
          data.message || 'Rate limit exceeded',
          data.retry_after
        );
      }
      
      return new PuoMemoError(
        data.message || `API error: ${status}`,
        status,
        data.code
      );
    }
    
    if (error.code === 'ETIMEDOUT') {
      return new PuoMemoError('Request timeout', 408);
    }
    
    return new PuoMemoError(error.message || 'Unknown error');
  }
}

// Re-export types for convenience
export * from './types';
export * from './errors';