#!/usr/bin/env node

/**
 * CLI entry point for PUO Memo MCP Server
 * This starts the MCP server that AI assistants can connect to
 */

import { startServer } from './mcp/server';

// Start the MCP server
startServer().catch((error) => {
  console.error('Failed to start PUO Memo MCP server:', error);
  process.exit(1);
});