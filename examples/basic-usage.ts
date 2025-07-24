/**
 * Basic Usage Example for PUO Memo Client
 * 
 * This example demonstrates the core features of the PUO Memo client
 */

import { PuoMemoClient } from '../src';

async function main() {
  // Initialize the client
  const client = new PuoMemoClient({
    apiKey: process.env.PUO_MEMO_API_KEY || 'your-api-key-here',
    debug: true // Enable debug logging
  });

  try {
    // 1. Store a simple memory
    console.log('1. Storing a simple memory...');
    const memory1 = await client.store('The team meeting is scheduled for 3 PM tomorrow in Conference Room B');
    console.log('Stored memory:', memory1.id);

    // 2. Store a memory with metadata
    console.log('\n2. Storing a memory with metadata...');
    const memory2 = await client.store('Discussed Q1 roadmap and resource allocation', {
      title: 'Q1 Planning Meeting',
      tags: ['meetings', 'planning', 'q1-2025'],
      metadata: {
        attendees: ['Alice', 'Bob', 'Charlie'],
        date: '2025-01-15',
        duration: '2 hours'
      }
    });
    console.log('Stored memory with metadata:', memory2.id);

    // 3. Search memories
    console.log('\n3. Searching for memories...');
    const searchResults = await client.recall('meeting', {
      limit: 5,
      searchType: 'hybrid'
    });
    console.log(`Found ${searchResults.length} memories about meetings`);
    searchResults.forEach(result => {
      console.log(`- ${result.title || 'Untitled'}: ${result.content.substring(0, 50)}...`);
    });

    // 4. Get entities
    console.log('\n4. Getting extracted entities...');
    const entities = await client.getEntities({ type: 'person', limit: 10 });
    console.log(`Found ${entities.length} person entities:`);
    entities.forEach(entity => {
      console.log(`- ${entity.name} (mentioned ${entity.mention_count} times)`);
    });

    // 5. Update a memory
    console.log('\n5. Updating a memory...');
    const updated = await client.updateMemory(memory1.id, {
      tags: ['meetings', 'urgent'],
      metadata: { location: 'Conference Room B' }
    });
    console.log('Memory updated successfully');

    // 6. Get usage stats
    console.log('\n6. Getting usage statistics...');
    const stats = await client.getUsageStats();
    console.log('Usage stats:', {
      memories: stats.memories_count,
      searches: stats.searches_count,
      storage: `${stats.storage_used_mb} MB`
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    await client.close();
  }
}

// Run the example
main().catch(console.error);