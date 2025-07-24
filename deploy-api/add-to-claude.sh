#!/bin/bash

# Add PUO Memo NPM to Claude Desktop

CONFIG_FILE="$HOME/Library/Application Support/Claude/claude_desktop_config.json"

echo "🤖 Adding PUO Memo NPM to Claude Desktop..."

# Check if config exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Claude Desktop config not found!"
    exit 1
fi

# Backup the config
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
echo "✅ Backed up config to $CONFIG_FILE.backup"

# Add the npm version using jq
cat > /tmp/puo-memo-npm.json << 'EOF'
{
  "command": "npx",
  "args": ["puo-memo-mcp"],
  "env": {
    "PUO_MEMO_API_KEY": "test-dev-puo-memo-xyz"
  }
}
EOF

# Use python to add the entry (since jq might not be installed)
python3 << 'PYTHON_SCRIPT'
import json
import sys

config_file = "$HOME/Library/Application Support/Claude/claude_desktop_config.json"
config_file = config_file.replace("$HOME", sys.path[0].split('/puo-jects')[0])

# Read existing config
with open(config_file, 'r') as f:
    config = json.load(f)

# Add puo-memo-npm if not exists
if 'puo-memo-npm' not in config.get('mcpServers', {}):
    config['mcpServers']['puo-memo-npm'] = {
        "command": "npx",
        "args": ["puo-memo-mcp"],
        "env": {
            "PUO_MEMO_API_KEY": "test-dev-puo-memo-xyz"
        }
    }
    
    # Write updated config
    with open(config_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Added puo-memo-npm to Claude Desktop config!")
else:
    print("⚠️  puo-memo-npm already exists in config")

PYTHON_SCRIPT

echo ""
echo "📝 Next steps:"
echo "1. Quit Claude Desktop completely (Cmd+Q)"
echo "2. Start Claude Desktop again"
echo "3. Look for 'puo-memo-npm' in the MCP menu"
echo ""
echo "🧪 To test manually first:"
echo "PUO_MEMO_API_KEY=test-dev-puo-memo-xyz npx puo-memo-mcp"