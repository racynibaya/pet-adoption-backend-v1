import autocannon, { Options, Result } from 'autocannon';

const BASE_URL = 'http://localhost:3000/api/v1';

const ENDPOINTS: { name: string; path: string }[] = [
  {
    name: 'GET /pets (page 1, limit 10)',
    path: '/pets?page=1&limit=10',
  },
  {
    name: 'GET /pets (deep — page 50, limit 20)',
    path: '/pets?page=50&limit=20',
  },
  {
    name: 'GET /shelters (page 1, limit 10)',
    path: '/shelters?page=1&limit=10',
  },
];

// Wraps autocannon in a promise and shows a live progress bar.
// Uses the callback overload so we get an Instance back (needed for track()).
function runTest(opts: Options): Promise<Result> {
  return new Promise((resolve, reject) => {
    const instance = autocannon(opts, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    autocannon.track(instance, { renderProgressBar: true, renderResultsTable: false });
  });
}

async function main() {
  console.log('🔫  Autocannon load test\n');
  console.log('   connections : 10 concurrent');
  console.log('   duration    : 15 s per endpoint');
  console.log(`   target      : ${BASE_URL}`);
  console.log('\n   Make sure the server is running (npm run dev)\n');
  console.log('─'.repeat(65));

  type SummaryRow = {
    name: string;
    reqPerSec: number;
    latencyAvg: number;
    latencyP99: number;
    errors: number;
  };

  const summary: SummaryRow[] = [];

  for (const endpoint of ENDPOINTS) {
    console.log(`\n⏱  ${endpoint.name}`);

    const result = await runTest({
      url: `${BASE_URL}${endpoint.path}`,
      connections: 10,
      duration: 15,
    });

    summary.push({
      name: endpoint.name,
      reqPerSec: Math.round(result.requests.average),
      latencyAvg: Math.round(result.latency.mean * 10) / 10,
      latencyP99: result.latency.p99,
      errors: result.errors + result.non2xx,
    });
  }

  // ── Summary table ─────────────────────────────────────────────────────────
  const COL = { name: 36, rps: 10, avg: 10, p99: 10, err: 8 };
  const LINE = '─'.repeat(COL.name + COL.rps + COL.avg + COL.p99 + COL.err + 4);

  console.log('\n\n📊  Results summary\n');
  console.log(LINE);
  console.log(
    'Endpoint'.padEnd(COL.name) +
      'req/sec'.padEnd(COL.rps) +
      'avg ms'.padEnd(COL.avg) +
      'p99 ms'.padEnd(COL.p99) +
      'errors',
  );
  console.log(LINE);

  for (const row of summary) {
    const errLabel = row.errors > 0 ? `⚠️  ${row.errors}` : '0';
    console.log(
      row.name.padEnd(COL.name) +
        String(row.reqPerSec).padEnd(COL.rps) +
        String(row.latencyAvg).padEnd(COL.avg) +
        String(row.latencyP99).padEnd(COL.p99) +
        errLabel,
    );
  }

  console.log(LINE);
  console.log('\n✅  Done.\n');
}

main().catch((e) => {
  console.error('❌  Load test failed:', e);
  process.exit(1);
});
