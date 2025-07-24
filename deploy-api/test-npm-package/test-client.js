#!/usr/bin/env node
/**
 * Ultra-deep test of PUO Memo npm package
 * Testing all aspects of the client library
 */

const { PuoMemoClient } = require('puo-memo-mcp');

// Test configuration combinations
const configs = [
  {
    name: "Direct Railway URL",
    apiKey: "test-dev-puo-memo-xyz",
    endpoint: "https://puo-memo-production.up.railway.app"
  },
  {
    name: "Custom Domain (DNS)",
    apiKey: "test-dev-puo-memo-xyz",
    endpoint: "https://api.puo-memo.com"
  },
  {
    name: "Invalid API Key",
    apiKey: "invalid-key-123",
    endpoint: "https://puo-memo-production.up.railway.app"
  }
];

async function deepTest() {
  console.log("🧪 Ultra-Deep PUO Memo NPM Package Test\n");
  
  for (const config of configs) {
    console.log(`\n📋 Testing: ${config.name}`);
    console.log(`   Endpoint: ${config.endpoint}`);
    console.log(`   API Key: ${config.apiKey}\n`);
    
    const client = new PuoMemoClient({
      apiKey: config.apiKey,
      endpoint: config.endpoint,
      timeout: 10000,
      retries: 2,
      debug: true
    });
    
    // Test 1: Health Check
    console.log("1️⃣ Testing health check...");
    try {
      const health = await client.healthCheck();
      console.log("   ✅ Health:", health);
    } catch (error) {
      console.log("   ❌ Health check failed:", error.message);
    }
    
    // Test 2: Store Memory
    console.log("\n2️⃣ Testing memory storage...");
    try {
      const memory = await client.store("Test memory from npm package deep test", {
        title: "NPM Package Test",
        tags: ["test", "npm", "validation"],
        metadata: {
          testTime: new Date().toISOString(),
          packageVersion: "0.1.1"
        }
      });
      console.log("   ✅ Memory stored:", memory.id);
      
      // Test 3: Retrieve Memory
      console.log("\n3️⃣ Testing memory retrieval...");
      const retrieved = await client.getMemory(memory.id);
      console.log("   ✅ Memory retrieved:", retrieved.content.substring(0, 50) + "...");
      
    } catch (error) {
      console.log("   ❌ Memory operation failed:", error.message);
    }
    
    // Test 4: Search
    console.log("\n4️⃣ Testing search...");
    try {
      const results = await client.recall("npm package test", {
        searchType: "hybrid",
        limit: 5
      });
      console.log("   ✅ Search returned", results.length, "results");
    } catch (error) {
      console.log("   ❌ Search failed:", error.message);
    }
    
    // Test 5: Entity Extraction
    console.log("\n5️⃣ Testing entity extraction...");
    try {
      const entities = await client.getEntities({ limit: 5 });
      console.log("   ✅ Found", entities.length, "entities");
    } catch (error) {
      console.log("   ❌ Entity extraction failed:", error.message);
    }
    
    // Test 6: Edge Cases
    console.log("\n6️⃣ Testing edge cases...");
    
    // Large content
    try {
      const largeContent = "x".repeat(5000);
      await client.store(largeContent);
      console.log("   ✅ Large content (5KB) handled");
    } catch (error) {
      console.log("   ⚠️  Large content failed:", error.message);
    }
    
    // Special characters
    try {
      await client.store("Test with emojis 🚀🧠✨ and unicode: 你好世界");
      console.log("   ✅ Special characters handled");
    } catch (error) {
      console.log("   ❌ Special characters failed:", error.message);
    }
    
    console.log("\n" + "=".repeat(50));
  }
  
  // Performance test
  console.log("\n⚡ Performance Test");
  const perfClient = new PuoMemoClient({
    apiKey: "test-dev-puo-memo-xyz",
    endpoint: "https://puo-memo-production.up.railway.app"
  });
  
  const start = Date.now();
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(perfClient.store(`Performance test memory ${i}`));
  }
  
  try {
    await Promise.all(promises);
    const duration = Date.now() - start;
    console.log(`   ✅ 5 concurrent operations in ${duration}ms`);
  } catch (error) {
    console.log("   ❌ Concurrent operations failed:", error.message);
  }
  
  console.log("\n✨ Test Complete!");
}

// Run the test
deepTest().catch(console.error);