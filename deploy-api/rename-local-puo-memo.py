#!/usr/bin/env python3
import json
import os

config_path = os.path.expanduser("~/Library/Application Support/Claude/claude_desktop_config.json")

# Read existing config
with open(config_path, 'r') as f:
    config = json.load(f)

# Rename local puo-memo to puo-memo-local
if 'puo-memo' in config['mcpServers']:
    config['mcpServers']['puo-memo-local'] = config['mcpServers']['puo-memo']
    del config['mcpServers']['puo-memo']
    
# Rename puo-memo-npm to puo-memo
if 'puo-memo-npm' in config['mcpServers']:
    config['mcpServers']['puo-memo'] = config['mcpServers']['puo-memo-npm']
    del config['mcpServers']['puo-memo-npm']

# Write back
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print("✅ Renamed local puo-memo to puo-memo-local")
print("✅ Renamed puo-memo-npm to puo-memo")
print("\nThe npm version is now the primary puo-memo!")