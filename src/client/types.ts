/**
 * TypeScript type definitions for PUO Memo MCP Client
 */

export interface ClientConfig {
  /**
   * API key for authentication. Get yours at https://puo-memo.com
   */
  apiKey: string;
  
  /**
   * API endpoint URL. Defaults to https://api.puo-memo.com/v1
   */
  endpoint?: string;
  
  /**
   * Enable anonymous telemetry to help improve the service. Default: true
   */
  telemetry?: boolean;
  
  /**
   * Request timeout in milliseconds. Default: 30000 (30 seconds)
   */
  timeout?: number;
  
  /**
   * Number of retry attempts for failed requests. Default: 3
   */
  retries?: number;
  
  /**
   * Enable debug logging. Default: false
   */
  debug?: boolean;
}

export interface Memory {
  id: string;
  content: string;
  title?: string;
  tags: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  user_id?: string;
  
  // Computed fields from platform
  entities?: Entity[];
  attachments?: Attachment[];
  embedding_status?: 'pending' | 'completed' | 'failed';
  word_count?: number;
}

export interface StoreOptions {
  /**
   * Optional title for the memory
   */
  title?: string;
  
  /**
   * Tags for categorization
   */
  tags?: string[];
  
  /**
   * Custom metadata as key-value pairs
   */
  metadata?: Record<string, any>;
  
  /**
   * Force deduplication check. Default: true
   */
  checkDuplicate?: boolean;
  
  /**
   * Parent memory ID for creating linked memories
   */
  parentId?: string;
}

export type SearchType = 'keyword' | 'semantic' | 'hybrid' | 'entity' | 'nlp';

export interface SearchOptions {
  /**
   * Type of search to perform. Default: 'hybrid'
   */
  searchType?: SearchType;
  
  /**
   * Maximum number of results. Default: 10
   */
  limit?: number;
  
  /**
   * Offset for pagination. Default: 0
   */
  offset?: number;
  
  /**
   * Filter by tags
   */
  tags?: string[];
  
  /**
   * Filter by date range
   */
  startDate?: string;
  endDate?: string;
  
  /**
   * Include deleted memories. Default: false
   */
  includeDeleted?: boolean;
  
  /**
   * Minimum similarity score for semantic search (0-1)
   */
  minScore?: number;
}

export interface Entity {
  id: string;
  name: string;
  type: 'person' | 'organization' | 'location' | 'event' | 'project' | 'technology' | 'concept' | 'document' | 'other';
  aliases: string[];
  memory_count: number;
  first_seen: string;
  last_seen: string;
  metadata?: Record<string, any>;
}

export interface Attachment {
  id: string;
  memory_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  url?: string;
  thumbnail_url?: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: any;
}

export interface UsageStats {
  memories_count: number;
  searches_count: number;
  entities_count: number;
  storage_used_mb: number;
  api_calls_this_month: number;
  plan_limits: {
    max_memories?: number;
    max_searches_per_month?: number;
    max_api_calls_per_month?: number;
    max_storage_mb?: number;
  };
}

export interface BatchOperation<T> {
  id: string;
  operation: 'create' | 'update' | 'delete';
  data: T;
}

export interface BatchResult<T> {
  successful: Array<{ id: string; result: T }>;
  failed: Array<{ id: string; error: ApiError }>;
}

// MCP-specific types for tool integration
export interface MCPToolResponse {
  type: 'success' | 'error';
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export interface MCPContext {
  platform: 'claude' | 'cursor' | 'chatgpt' | 'other';
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}