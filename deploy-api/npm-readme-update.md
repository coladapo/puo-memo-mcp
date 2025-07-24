# PUO Memo MCP - npm Package README Update

Add this section to the npm package README:

## Getting Started

### 1. Create Your Account

Visit [puo-memo.com](https://api.puo-memo.com) to create your free account and get your API key.

### 2. Install the Package

```bash
npm install -g puo-memo-mcp
```

### 3. Configure Your AI Platform

#### For Claude Desktop

Add to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "puo-memo": {
      "command": "npx",
      "args": ["puo-memo-mcp"],
      "env": {
        "PUO_MEMO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### For Other MCP-Compatible Platforms

Set the `PUO_MEMO_API_KEY` environment variable and run:

```bash
PUO_MEMO_API_KEY=your-api-key npx puo-memo-mcp
```

## Usage

Once configured, you can use these MCP tools in your AI conversations:

- `memory` - Store information for later recall
- `recall` - Search and retrieve stored memories
- `entities` - View extracted entities from your memories

## Pricing

- **Free**: 1,000 memories/month
- **Pro** ($19/month): 10,000 memories/month + AI search
- **Enterprise**: Custom pricing for unlimited usage

## Security

Your memories are:
- Encrypted in transit and at rest
- Isolated by user with Row Level Security
- Never shared or used for training
- Fully exportable at any time

## Support

- Documentation: [docs.puo-memo.com](https://docs.puo-memo.com)
- Issues: [github.com/puo-memo/mcp-client/issues](https://github.com/puo-memo/mcp-client/issues)
- Email: support@puo-memo.com