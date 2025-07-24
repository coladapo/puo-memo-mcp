const axios = require('axios');

async function testV1Endpoints() {
  const apiKey = 'test-dev-puo-memo-xyz';
  const baseURL = 'https://puo-memo-production.up.railway.app';
  
  console.log('🧪 Testing V1 Endpoints...\n');
  
  // Test 1: Health Check
  try {
    const health = await axios.get(`${baseURL}/v1/health`);
    console.log('✅ /v1/health:', health.data);
  } catch (error) {
    console.log('❌ /v1/health failed:', error.message);
  }
  
  // Test 2: Create Memory
  try {
    const memory = await axios.post(
      `${baseURL}/v1/memory`,
      { content: 'Testing v1 endpoint fix!' },
      { headers: { 'X-API-Key': apiKey } }
    );
    console.log('✅ /v1/memory:', memory.data);
  } catch (error) {
    console.log('❌ /v1/memory failed:', error.response?.data || error.message);
  }
  
  // Test 3: Search (Recall)
  try {
    const search = await axios.get(`${baseURL}/v1/recall`, {
      params: { query: 'test' },
      headers: { 'X-API-Key': apiKey }
    });
    console.log('✅ /v1/recall: Found', search.data.length, 'results');
  } catch (error) {
    console.log('❌ /v1/recall failed:', error.response?.data || error.message);
  }
  
  // Test 4: Check DNS
  console.log('\n🌐 DNS Check:');
  try {
    const dnsHealth = await axios.get('https://api.puo-memo.com/health');
    console.log('✅ api.puo-memo.com is LIVE!');
  } catch (error) {
    console.log('⏱️  api.puo-memo.com still propagating...');
  }
}

testV1Endpoints();