#!/usr/bin/env node
/**
 * Test the MCP server directly without Claude Desktop
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing PUO Memo MCP Server...\n');

// Set up environment
const env = {
  ...process.env,
  PUO_MEMO_API_KEY: 'test-dev-puo-memo-xyz',
  PUO_MEMO_API_ENDPOINT: 'https://api.puo-memo.com',
  PUO_MEMO_DEBUG: 'true'
};

// Find npx path
const npxPath = process.platform === 'win32' ? 'npx.cmd' : 'npx';

console.log('Starting MCP server with:');
console.log('- API Key:', env.PUO_MEMO_API_KEY);
console.log('- Endpoint:', env.PUO_MEMO_API_ENDPOINT);
console.log('- Command:', npxPath, 'puo-memo-mcp');
console.log('\n---\n');

// Spawn the MCP server
const mcp = spawn(npxPath, ['puo-memo-mcp'], {
  env,
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle stdout
mcp.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('📤 MCP Output:', output);
  
  // If we see the initialization message, send a test request
  if (output.includes('capabilities') || output.includes('initialized')) {
    console.log('\n✅ MCP Server initialized!');
    
    // Send a list tools request
    const listToolsRequest = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1
    };
    
    console.log('\n📨 Sending list tools request...');
    mcp.stdin.write(JSON.stringify(listToolsRequest) + '\n');
  }
});

// Handle stderr
mcp.stderr.on('data', (data) => {
  console.error('❌ MCP Error:', data.toString());
});

// Handle close
mcp.on('close', (code) => {
  console.log(`\nMCP server exited with code ${code}`);
});

// Handle errors
mcp.on('error', (err) => {
  console.error('Failed to start MCP server:', err);
});

// Clean shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down MCP server...');
  mcp.kill();
  process.exit();
});

console.log('⏳ Waiting for MCP server to initialize...');
console.log('Press Ctrl+C to stop\n');