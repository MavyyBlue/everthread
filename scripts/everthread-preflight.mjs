import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const args = new Set(process.argv.slice(2));
const deep = args.has('--deep');
const reportPath = resolve(process.env.EVERTHREAD_PREFLIGHT_REPORT ?? '.everthread/preflight-report.json');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const startedAt = new Date();
const stages = [];

function readPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    return String(pkg.version ?? 'unknown');
  } catch {
    return 'unknown';
  }
}

function gitHead() {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
  if (result.status === 0) return result.stdout.trim();
  return process.env.EVERTHREAD_BASELINE_COMMIT ?? process.env.GITHUB_SHA ?? 'unavailable';
}

function writeReport(status, failedStage) {
  const finishedAt = new Date();
  const report = {
    format: 1,
    product: 'Everthread',
    mode: deep ? 'deep' : 'standard',
    status,
    packageVersion: readPackageVersion(),
    commit: gitHead(),
    nodeVersion: process.version,
    platform: `${process.platform}-${process.arch}`,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    failedStage: failedStage ?? null,
    stages,
  };
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

function runStage(id, label, npmArgs) {
  const commandText = `npm ${npmArgs.join(' ')}`;
  const stageStart = Date.now();
  console.log(`\n=== Everthread Preflight: ${label} ===`);
  console.log(`$ ${commandText}`);
  const result = spawnSync(npmCommand, npmArgs, {
    stdio: 'inherit',
    env: process.env,
  });
  const durationMs = Date.now() - stageStart;
  const passed = result.status === 0 && !result.error;
  stages.push({
    id,
    label,
    command: commandText,
    status: passed ? 'passed' : 'failed',
    exitCode: result.status ?? null,
    durationMs,
    error: result.error ? String(result.error.message ?? result.error) : null,
  });
  if (!passed) {
    const report = writeReport('failed', id);
    console.error(`\nEVERTHREAD PREFLIGHT FAILED at ${label}.`);
    console.error(`Report: ${reportPath}`);
    process.exit(result.status && result.status !== 0 ? result.status : 1);
  }
}

console.log('Everthread canonical pre-deployment verification');
console.log(`Mode: ${deep ? 'deep' : 'standard'}`);
console.log(`Package: ${readPackageVersion()}`);
console.log(`Node: ${process.version}`);
console.log(`Commit/baseline: ${gitHead()}`);

runStage('typecheck-engine', 'Engine TypeScript', ['run', 'typecheck:engine']);
runStage('typecheck-tests', 'Test TypeScript', ['run', 'typecheck:tests']);
runStage('regressions', 'Complete Regression Wall', ['test']);

if (deep) {
  runStage('content-audit', 'Content Audit', ['run', 'content:audit']);
  runStage('simulation-1k', '1,000-Life Bulk Simulation', ['run', 'sim']);
}

runStage('production-build', 'Production Build', ['run', 'build']);

const report = writeReport('passed');
console.log(`\nEVERTHREAD PREFLIGHT GREEN — ${stages.length}/${stages.length} stages passed.`);
console.log(`Report: ${reportPath}`);
console.log(`Verified commit/baseline: ${report.commit}`);
