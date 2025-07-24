#!/bin/bash

echo "🧪 Testing npm puo-memo directly..."
echo ""

# Set the API key
export PUO_MEMO_API_KEY=test-dev-puo-memo-xyz

# Test the npm package directly
echo "📦 Running: npx puo-memo-mcp"
echo "---"

# Run it and capture output
timeout 5s npx puo-memo-mcp 2>&1 | head -20

echo ""
echo "---"
echo "✅ If you see MCP protocol output above, the npm package is working!"
echo ""
echo "🔄 To use in Claude Desktop:"
echo "1. Quit Claude Desktop completely (Cmd+Q)"
echo "2. Kill any old puo-memo processes:"
echo "   pkill -f 'puo memo mcp/src/mcp/server.py'"
echo "3. Start Claude Desktop again"
echo "4. Check for 'puo-memo' in the MCP menu"