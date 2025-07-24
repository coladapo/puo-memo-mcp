/**
 * MCP Server implementation for PUO Memo
 * This wraps the PUO Memo client in MCP protocol for use with Claude Desktop, Cursor, etc.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { PuoMemoClient } from '../client/PuoMemoClient';
import { memoryTool } from './tools/memory';
import { recallTool } from './tools/recall';
import { entitiesTool } from './tools/entities';
import { attachmentTool } from './tools/attachments';

const TOOL_DESCRIPTIONS: Record<string, Tool> = {
  memory: {
    name: 'memory',
    description: 'Store information in PUO Memo for later retrieval',
    inputSchema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The information to remember'
        },
        title: {
          type: 'string',
          description: 'Optional title for the memory'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for categorization'
        }
      },
      required: ['content']
    }
  },
  recall: {
    name: 'recall',
    description: 'Search and retrieve stored memories using natural language',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query in natural language'
        },
        search_type: {
          type: 'string',
          enum: ['keyword', 'semantic', 'hybrid', 'entity', 'nlp'],
          description: 'Type of search to perform (default: hybrid)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)'
        }
      },
      required: ['query']
    }
  },
  entities: {
    name: 'entities',
    description: 'List or explore entities (people, organizations, etc.) extracted from memories',
    inputSchema: {
      type: 'object',
      properties: {
        entity_name: {
          type: 'string',
          description: 'Specific entity to explore (optional)'
        },
        entity_type: {
          type: 'string',
          enum: ['person', 'organization', 'location', 'event', 'project', 'technology', 'concept', 'document'],
          description: 'Filter by entity type'
        },
        depth: {
          type: 'number',
          description: 'Depth for entity graph exploration (default: 2)'
        }
      }
    }
  },
  attach: {
    name: 'attach',
    description: 'Attach a file or URL to a memory',
    inputSchema: {
      type: 'object',
      properties: {
        memory_id: {
          type: 'string',
          description: 'ID of the memory to attach to'
        },
        url: {
          type: 'string',
          description: 'URL of the file to attach'
        },
        description: {
          type: 'string',
          description: 'Description of the attachment'
        }
      },
      required: ['memory_id', 'url']
    }
  }
};

export class PuoMemoMCPServer {
  private server: Server;
  private client: PuoMemoClient;

  constructor() {
    this.server = new Server(
      {
        name: 'puo-memo-mcp',
        vendor: 'PUO Memo',
        version: '1.0.0',
        description: 'Memory management system for AI assistants'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    // Initialize client from environment
    const apiKey = process.env.PUO_MEMO_API_KEY;
    if (!apiKey) {
      console.error('ERROR: PUO_MEMO_API_KEY environment variable is required');
      console.error('Get your API key at https://puo-memo.com');
      process.exit(1);
    }

    this.client = new PuoMemoClient({
      apiKey,
      endpoint: process.env.PUO_MEMO_ENDPOINT,
      telemetry: process.env.PUO_MEMO_TELEMETRY !== 'false',
      debug: process.env.DEBUG === 'true'
    });

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: Object.values(TOOL_DESCRIPTIONS)
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'memory':
            return await memoryTool(this.client, args);
          
          case 'recall':
            return await recallTool(this.client, args);
          
          case 'entities':
            return await entitiesTool(this.client, args);
          
          case 'attach':
            return await attachmentTool(this.client, args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        // Return error in a format MCP understands
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: true,
                message: error.message,
                code: error.errorCode,
                details: error.details
              }, null, 2)
            }
          ]
        };
      }
    });

    // Handle errors
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]', error);
    };
  }

  async run() {
    console.error('Starting PUO Memo MCP Server...');
    console.error(`API Endpoint: ${this.client['config'].endpoint}`);
    console.error('Ready for connections');

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Export function for CLI usage
export async function startServer() {
  const server = new PuoMemoMCPServer();
  await server.run();
}

// Auto-start if run directly
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}