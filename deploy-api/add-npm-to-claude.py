#!/usr/bin/env python3
import json
import os

config_path = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")

# Read existing config
with open(config_path, 'r') as f:
    config = json.load(f)

# Add puo-memo-npm
config['mcpServers']['puo-memo-npm'] = {
    "command": "npx",
    "args": ["puo-memo-mcp"],
    "env": {
        "PUO_MEMO_API_KEY": "test-dev-puo-memo-xyz"
    }
}

# Write back
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Added puo-memo-npm to Claude Desktop!")