const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

// To run this:
// npm install autocannon
// node run-load-test.js

async function runLoadTest() {
  console.log('Starting Baseline/Load Testing...');
  console.log('Target: 100 concurrent users for 60 seconds.');
  console.log('Please wait...\n');

  const result = await autocannon({
    url: 'http://localhost:5000/api/health', // Replace with the actual backend API URL
    connections: 100, // 100 virtual users
    duration: 60, // 1 minute
    pipelining: 1, // 1 request at a time per connection
  });

  console.log('--- LOAD TEST RESULTS ---');
  console.log(`Requests per second (RPS): ${result.requests.average} req/sec`);
  console.log(`Total requests sent: ${result.requests.total}`);
  
  console.log('\n--- RESPONSE TIMES ---');
  console.log(`Average: ${result.latency.average} ms`);
  console.log(`Min: ${result.latency.min} ms`);
  console.log(`Max: ${result.latency.max} ms`);

  // Output detailed report
  const reportPath = path.join(__dirname, 'LoadTest_Report.json');
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

runLoadTest().catch(console.error);
