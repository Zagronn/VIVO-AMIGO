import { GET as getSecurity } from '../app/api/admin/security/route';

async function runTest() {
  console.log('\n--- Testing GET /api/admin/security (Direct Route) ---');
  const secRes = await getSecurity(new Request('http://localhost/api/admin/security'));
  const secJson = await secRes.json();
  console.log('Result:', secJson);
}

runTest().catch(console.error);
export {};
