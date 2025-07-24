/**
 * MCP tool for searching memories
 */

import { PuoMemoClient } from '../../client/PuoMemoClient';

export async function recallTool(client: PuoMemoClient, args: any) {
  const { query, search_type, limit, tags, start_date, end_date } = args;

  if (!query) {
    throw new Error('Query is required to search memories');
  }

  try {
    const memories = await client.recall(query, {
      searchType: search_type,
      limit: limit || 10,
      tags,
      startDate: start_date,
      endDate: end_date
    });

    // Format response for MCP
    if (memories.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No memories found matching your query.'
          }
        ]
      };
    }

    // Format memories for display
    const formattedMemories = memories.map((memory, index) => {
      const header = `### ${index + 1}. ${memory.title || 'Untitled Memory'}`;
      const meta = `*Created: ${new Date(memory.created_at).toLocaleDateString()}*`;
      const tags = memory.tags.length > 0 ? `**Tags:** ${memory.tags.join(', ')}` : '';
      const content = memory.content.substring(0, 200) + (memory.content.length > 200 ? '...' : '');
      
      return `${header}\n${meta}\n${tags}\n\n${content}\n\n---`;
    }).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${memories.length} ${memories.length === 1 ? 'memory' : 'memories'}:\n\n${formattedMemories}`
        }
      ]
    };
  } catch (error: any) {
    throw error; // Let the server handle error formatting
  }
}