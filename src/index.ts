/**
 * PUO Memo MCP Client - Main Entry Point
 * 
 * This module exports the client SDK for programmatic usage
 * For MCP server usage, see the CLI entry point
 */

// Export the main client
export { PuoMemoClient } from './client/PuoMemoClient';

// Export types
export * from './client/types';

// Export errors
export * from './client/errors';

// Version
export const version = '0.1.0';