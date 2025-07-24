# PUO Memo MCP Client

[![npm version](https://badge.fury.io/js/puo-memo-mcp.svg)](https://www.npmjs.com/package/puo-memo-mcp)
[![npm downloads](https://img.shields.io/npm/dm/puo-memo-mcp.svg)](https://www.npmjs.com/package/puo-memo-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Model Context Protocol](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io)
[![GitHub stars](https://img.shields.io/github/stars/puo-memo/puo-memo-mcp?style=social)](https://github.com/puo-memo/puo-memo-mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Open source MCP client for [PUO Memo](https://puo-memo.com) - the universal memory system for AI assistants.

Give your AI assistants (Claude, ChatGPT, Cursor) permanent memory that persists across conversations.

## Features

- 🧠 **Persistent Memory**: Store information once, access it forever
- 🔍 **Intelligent Search**: Natural language search with semantic understanding
- 🏷️ **Smart Organization**: Automatic entity extraction and tagging
- 🌐 **Universal**: Works with any MCP-compatible AI assistant
- 📎 **Attachments**: Attach files, images, and documents to memories
- 🔗 **Knowledge Graph**: See connections between people, projects, and ideas

## Quick Start

### 1. Get Your API Key

Sign up for free at [puo-memo.com](https://puo-memo.com) to get your API key.

### 2. Install the Client

```bash
npm install -g puo-memo-mcp
```

### 3. Configure Your AI Assistant

#### For Claude Desktop

Add to your Claude Desktop configuration:

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

#### For Cursor IDE

```bash
# Run the configuration helper
npx puo-memo-mcp configure cursor
```

#### For Custom Integration

```typescript
import { PuoMemoClient } from 'puo-memo-mcp';

const client = new PuoMemoClient({
  apiKey: process.env.PUO_MEMO_API_KEY
});

// Store a memory
const memory = await client.store("Important meeting notes from today");

// Search memories
const results = await client.recall("meeting notes");
```

## Usage Examples

### With Claude Desktop

```
Human: Remember that our API deployment is scheduled for next Friday at 2 PM EST

Claude: I'll store that information for you.
[Uses PUO Memo to store the deployment schedule]

Human: What meetings did I have scheduled?

Claude: Let me search your memories for meeting information.
[Searches PUO Memo for meeting-related memories]
```

### Programmatic Usage

```typescript
// Initialize client
const client = new PuoMemoClient({
  apiKey: 'your-api-key',
  telemetry: true // Optional, helps us improve the service
});

// Store memories with metadata
await client.store('Project kickoff meeting notes', {
  title: 'Q1 Product Launch Meeting',
  tags: ['meetings', 'product', 'q1-2025'],
  metadata: {
    attendees: ['John', 'Sarah', 'Mike'],
    date: '2025-01-15',
    project: 'Mobile App v2.0'
  }
});

// Search with different strategies
const hybridResults = await client.recall('mobile app meetings', {
  searchType: 'hybrid', // Combines keyword and semantic search
  limit: 5
});

const semanticResults = await client.recall('discussions about user experience', {
  searchType: 'semantic', // AI-powered understanding
  tags: ['design', 'ux']
});

// Work with entities
const entities = await client.getEntities({ type: 'person' });
const graph = await client.getEntityGraph('John Doe', 3);

// Attach files
const attachment = await client.attachFile(
  memory.id,
  fileBuffer,
  'meeting-notes.pdf',
  'application/pdf'
);
```

## API Reference

### Client Configuration

```typescript
interface ClientConfig {
  apiKey: string;       // Required: Your PUO Memo API key
  endpoint?: string;    // Optional: Custom API endpoint
  telemetry?: boolean;  // Optional: Enable anonymous usage telemetry (default: true)
  timeout?: number;     // Optional: Request timeout in ms (default: 30000)
  retries?: number;     // Optional: Number of retries (default: 3)
  debug?: boolean;      // Optional: Enable debug logging (default: false)
}
```

### Core Methods

#### `store(content: string, options?: StoreOptions): Promise<Memory>`
Store a new memory with optional metadata.

#### `recall(query: string, options?: SearchOptions): Promise<Memory[]>`
Search memories using natural language.

#### `getMemory(id: string): Promise<Memory>`
Retrieve a specific memory by ID.

#### `updateMemory(id: string, updates: Partial<Memory>): Promise<Memory>`
Update an existing memory.

#### `deleteMemory(id: string): Promise<void>`
Delete a memory permanently.

#### `getEntities(options?: EntityOptions): Promise<Entity[]>`
List entities extracted from your memories.

#### `getEntityGraph(entityName: string, depth?: number): Promise<Graph>`
Get relationship graph for an entity.

#### `attachFile(memoryId: string, file: Buffer | Blob, filename: string): Promise<Attachment>`
Attach a file to a memory.

## Advanced Features

### Search Types

- **Keyword**: Traditional text matching
- **Semantic**: AI-powered meaning understanding
- **Hybrid**: Best of both worlds (recommended)
- **Entity**: Search by people, projects, or concepts
- **NLP**: Natural language processing for complex queries

### Smart Deduplication

PUO Memo automatically detects and merges duplicate memories:

```typescript
// These will be intelligently merged
await client.store("Meeting with John about the API design");
await client.store("Met with John to discuss API architecture");
// Results in one consolidated memory with merged context
```

### Knowledge Graph

Visualize connections between people, projects, and ideas:

```typescript
const graph = await client.getEntityGraph('Project Alpha', 2);
// Returns nodes and edges showing relationships
```

## Privacy & Security

- All data is encrypted in transit and at rest
- API keys are never logged or exposed
- Telemetry is anonymous and can be disabled
- SOC 2 Type II certified infrastructure
- GDPR compliant with data export/deletion

## Telemetry

This client collects anonymous usage telemetry to help improve the service. 
No personal data or memory content is ever collected.

What we collect:
- API methods used (store, search, etc.)
- Error types (not error messages)
- Client version and platform
- Session duration

To opt-out, set telemetry: false in your configuration:

```javascript
const client = new PuoMemoClient({
  apiKey: 'your-key',
  telemetry: false
});
```

## Error Handling

```typescript
try {
  await client.store('Important note');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof QuotaExceededError) {
    console.error('Memory quota exceeded. Upgrade your plan.');
  }
}
```

## Self-Hosting

While this client connects to the hosted PUO Memo platform by default, you can self-host the entire infrastructure. See our [self-hosting guide](./docs/SELF_HOSTING.md) for details.

> **Note**: Self-hosting is complex and requires significant resources. Most users should use the hosted platform.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/puo-memo/puo-memo-mcp.git
cd puo-memo-mcp

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Run in development mode
npm run dev
```

## Support

- 📧 Email: support@puo-memo.com
- 💬 Discord: [Join our community](https://discord.gg/puo-memo)
- 📖 Docs: [docs.puo-memo.com](https://docs.puo-memo.com)
- 🐛 Issues: [GitHub Issues](https://github.com/puo-memo/puo-memo-mcp/issues)

## License

MIT © PUO Memo Team

See [LICENSE](LICENSE) for details.

---

**Ready to give your AI perfect memory?** Get started at [puo-memo.com](https://puo-memo.com) 🚀