/**
 * Basic tests for PUO Memo Client
 */

import { PuoMemoClient } from './PuoMemoClient';
import { PuoMemoError } from './errors';

describe('PuoMemoClient', () => {
  it('should throw error when no API key is provided', () => {
    expect(() => {
      new PuoMemoClient({} as any);
    }).toThrow('API key is required. Get yours at https://puo-memo.com');
  });

  it('should create client with valid config', () => {
    const client = new PuoMemoClient({
      apiKey: 'test-key'
    });
    
    expect(client).toBeInstanceOf(PuoMemoClient);
  });

  it('should have default configuration', () => {
    const client = new PuoMemoClient({
      apiKey: 'test-key'
    });
    
    // Test that client was created successfully
    expect(client).toBeDefined();
  });
});

describe('PuoMemoError', () => {
  it('should create error with message', () => {
    const error = new PuoMemoError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('PuoMemoError');
  });

  it('should create error with status code', () => {
    const error = new PuoMemoError('Test error', 400);
    expect(error.statusCode).toBe(400);
  });
});