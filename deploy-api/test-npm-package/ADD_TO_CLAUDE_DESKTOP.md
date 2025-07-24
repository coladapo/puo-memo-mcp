# 🤖 Add PUO Memo to Claude Desktop

## Current Setup
You already have a local puo-memo server configured. To test the npm package version, you can add a second entry.

## Add NPM Package Version

Add this to your Claude Desktop config (after your existing puo-memo entry):

```json
"puo-memo-npm": {
  "command": "npx",
  "args": ["puo-memo-mcp"],
  "env": {
    "PUO_MEMO_API_KEY": "test-dev-puo-memo-xyz",
    "PUO_MEMO_API_ENDPOINT": "https://api.puo-memo.com"
  }
}
```

## Steps to Test

1. **Close Claude Desktop** completely

2. **Edit the config file** at:
   `/Users/wivak/Library/Application Support/Claude/claude_desktop_config.json`

3. **Add the npm version** (keep your existing puo-memo)

4. **Restart Claude Desktop**

5. **Check MCP connection**:
   - Look for the MCP icon in Claude Desktop
   - You should see both:
     - `puo-memo` (your local version)
     - `puo-memo-npm` (the npm package)

## Test Commands in Claude

Once connected, test these in a new Claude conversation:

1. "Store this: The PUO Memo npm package is now working perfectly with api.puo-memo.com"

2. "Search my memories for 'npm package'"

3. "What entities have I mentioned?"

## Expected Behavior

- ✅ Both MCP servers should connect
- ✅ The npm version uses the cloud API
- ✅ The local version uses your Supabase directly
- ✅ Memories are independent between them

## Troubleshooting

If the npm version doesn't appear:
1. Check Claude Desktop logs
2. Verify npm is installed globally
3. Try running manually first:
   ```bash
   PUO_MEMO_API_KEY=test-dev-puo-memo-xyz npx puo-memo-mcp
   ```

## Alternative: Replace Local Version

If you want to fully test the npm package, temporarily rename your local version:

```json
"puo-memo-local": {
  // your existing config
},
"puo-memo": {
  "command": "npx",
  "args": ["puo-memo-mcp"],
  "env": {
    "PUO_MEMO_API_KEY": "test-dev-puo-memo-xyz"
  }
}
```

This way Claude will use the npm package as the primary puo-memo.