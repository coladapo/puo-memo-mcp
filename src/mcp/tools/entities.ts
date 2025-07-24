/**
 * MCP tool for entity management
 */

import { PuoMemoClient } from '../../client/PuoMemoClient';

export async function entitiesTool(client: PuoMemoClient, args: any) {
  const { entity_name, depth, entity_type } = args;

  try {
    if (entity_name && depth !== undefined) {
      // Get entity graph
      const graph = await client.getEntityGraph(entity_name, depth);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Entity graph for "${entity_name}"`,
              graph
            }, null, 2)
          }
        ]
      };
    } else {
      // List entities
      const entities = await client.getEntities({
        type: entity_type,
        limit: args.limit || 20
      });
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              message: `Found ${entities.length} entities`,
              entities: entities.map(e => ({
                name: e.name,
                type: e.type,
                memory_count: e.memory_count
              }))
            }, null, 2)
          }
        ]
      };
    }
  } catch (error: any) {
    throw error; // Let the server handle error formatting
  }
}