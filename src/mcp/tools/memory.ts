/**
 * MCP tool for storing memories
 */

import { PuoMemoClient } from '../../client/PuoMemoClient';

export async function memoryTool(client: PuoMemoClient, args: any) {
  const { content, title, tags, metadata } = args;

  if (!content) {
    throw new Error('Content is required to store a memory');
  }

  try {
    const memory = await client.store(content, {
      title,
      tags: tags || [],
      metadata: metadata || {}
    });

    // Format response for MCP
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Memory stored successfully',
            memory: {
              id: memory.id,
              title: memory.title || 'Untitled',
              tags: memory.tags,
              created_at: memory.created_at
            }
          }, null, 2)
        }
      ]
    };
  } catch (error: any) {
    throw error; // Let the server handle error formatting
  }
}