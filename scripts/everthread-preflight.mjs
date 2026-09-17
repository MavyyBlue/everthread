import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import process from 'node:process';

const argv = process.argv.slice(2);
const deep = argv.includes('--deep');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const startedAt = new Date();

function argValue(name) {
  const exactIndex = argv.indexOf(name);
  if (exactIndex >= 0) {
    const value = argv[exactIndex + 1];
    if (value && !value.startsWith('--')) return value;
  }
  const prefix = `${name}=`;
  const inline = argv.find((arg) => arg.startsWith(prefix));
  return inline ? inline.slice(prefix.length) : undefined;
}

const selectedStageId = argValue('--stage');
const listStages = argv.includes('--list-stages');

const stageDefinitions = [
  {
    id: 'typecheck-engine',
    label: 'Engine TypeScript',
    npmArgs: ['run', 'typecheck:engine'],
    inputs: ['package.json', 'package-lock.json', 'tsconfig.engine.json'],
    deepOnly: false,
  },
  {
    id: 'typecheck-tests',
    label: 'Test TypeScript',
    npmArgs: ['run', 'typecheck:tests'],
    inputs: ['package.json', 'package-lock.json', 'tsconfig.tests.json'],
    deepOnly: false,
  },
  {
    id: 'typecheck-app',
    label: 'App TypeScript',
    npmArgs: ['run', 'typecheck:app'],
    inputs: ['package.json', 'package-lock.json', 'tsconfig.app.json'],
    deepOnly: false,
  },
  {
    id: 'typecheck-node',
    label: 'Node / Vite Config TypeScript',
    npmArgs: ['run', 'typecheck:node'],
    inputs: ['package.json', 'package-lock.json', 'tsconfig.node.json', 'vite.config.ts'],
    deepOnly: false,
  },
  {
    id: 'regressions',
    label: 'Complete Regression Wall',
    npmArgs: ['test'],
    inputs: ['package.json', 'package-lock.json', 'tsconfig.tests.json'],
    deepOnly: false,
  },
  {
    id: 'content-audit',
    label: 'Content Audit',
    npmArgs: ['run', 'content:audit'],
    inputs: ['package.json', 'package-lock.json', 'tsconfig.tests.json'],
    deepOnly: true,
  },
  {
    id: 'simulation-1k',
    label: '1,000-Life Bulk Simulation',
    npmArgs: ['run', 'sim'],
    inputs: ['package.json', 'package-lock.json', 'tsconfig.tests.json'],
    deepOnly: true,
  },
  {
    id: 'production-build',
    label: 'Production Build',
    npmArgs: ['run', 'build'],
    inputs: [
      'package.json',
      'package-lock.json',
      'tsconfig.json',
      'tsconfig.app.json',
      'tsconfig.node.json',
      'vite.config.ts',
    ],
    deepOnly: false,
  },
];

if (listStages) {
  console.log('Everthread preflight stages:');
  for (const stage of stageDefinitions) {
    console.log(`- ${stage.id}${stage.deepOnly ? ' (deep)' : ''}: ${stage.label}`);
  }
  process.exit(0);
}

const selectedStage = selectedStageId
  ? stageDefinitions.find((stage) => stage.id === selectedStageId)
  : undefined;

if (selectedStageId && !selectedStage) {
  console.error(`Unknown Everthread preflight stage: ${selectedStageId}`);
  console.error('Use --list-stages to see valid stage ids.');
  process.exit(2);
}

const reportPath = resolve(
  process.env.EVERTHREAD_PREFLIGHT_REPORT
    ?? (selectedStageId
      ? `.everthread/preflight-stage-${selectedStageId}.json`
      : '.everthread/preflight-report.json'),
);

const stages = [];

function readPackageVersion() {
  try {
    const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
    return String(pkg.version ?? 'unknown');
  } catch {
    return 'unknown';
  }
}

function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex');
}

function fileSha256(path) {
  try {
    return createHash('sha256').update(readFileSync(resolve(path))).digest('hex');
  } catch {
    return null;
  }
}

function gitResult(args) {
  return spawnSync('git', args, { encoding: 'utf8' });
}

function repositoryState() {
  const head = gitResult(['rev-parse', 'HEAD']);
  const status = gitResult(['status', '--porcelain=v1', '--untracked-files=all']);
  const commit = head.status === 0
    ? head.stdout.trim()
    : process.env.EVERTHREAD_BASELINE_COMMIT ?? process.env.GITHUB_SHA ?? 'unavailable';
  const statusText = status.status === 0 ? status.stdout : '';
  const dirty = status.status === 0 ? statusText.trim().length > 0 : null;

  return {
    commit,
    dirty,
    statusSha256: status.status === 0 ? sha256Text(statusText) : null,
    cacheReusable: dirty === false && commit !== 'unavailable',
  };
}

const sourceState = repositoryState();

function inputEvidence(paths) {
  return paths.map((path) => ({
    path,
    sha256: fileSha256(path),
  }));
}

function writeReport(status, failedStage) {
  const finishedAt = new Date();
  const report = {
    format: 1,
    product: 'Everthread',
    mode: selectedStageId ? 'stage' : deep ? 'deep' : 'standard',
    status,
    packageVersion: readPackageVersion(),
    commit: sourceState.commit,
    sourceState,
    nodeVersion: process.version,
    platform: `${process.platform}-${process.arch}`,
    selectedStage: selectedStageId ?? null,
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

function runStage(stage) {
  const { id, label, npmArgs, inputs } = stage;
  const commandText = `npm ${npmArgs.join(' ')}`;
  const stageStart = new Date();

  console.log(`\n=== Everthread Preflight: ${label} ===`);
  console.log(`$ ${commandText}`);

  const result = spawnSync(npmCommand, npmArgs, {
    stdio: 'inherit',
    env: process.env,
  });

  const stageFinish = new Date();
  const durationMs = stageFinish.getTime() - stageStart.getTime();
  const passed = result.status === 0 && !result.error;

  stages.push({
    id,
    label,
    command: commandText,
    status: passed ? 'passed' : 'failed',
    exitCode: result.status ?? null,
    startedAt: stageStart.toISOString(),
    finishedAt: stageFinish.toISOString(),
    durationMs,
    inputs: inputEvidence(inputs),
    error: result.error ? String(result.error.message ?? result.error) : null,
  });

  if (!passed) {
    writeReport('failed', id);
    console.error(`\nEVERTHREAD PREFLIGHT FAILED at ${label}.`);
    console.error(`Report: ${reportPath}`);
    process.exit(result.status && result.status !== 0 ? result.status : 1);
  }
}

console.log('Everthread canonical pre-deployment verification');
console.log(`Mode: ${selectedStageId ? `stage (${selectedStageId})` : deep ? 'deep' : 'standard'}`);
console.log(`Package: ${readPackageVersion()}`);
console.log(`Node: ${process.version}`);
console.log(`Commit/baseline: ${sourceState.commit}`);
if (sourceState.dirty === true) {
  console.log('Working tree: dirty (stage evidence is diagnostic only; not reusable certification evidence)');
} else if (sourceState.dirty === false) {
  console.log('Working tree: clean');
}

const executionStages = selectedStage
  ? [selectedStage]
  : stageDefinitions.filter((stage) => deep || !stage.deepOnly);

for (const stage of executionStages) {
  runStage(stage);
}

const report = writeReport('passed');
console.log(`\nEVERTHREAD PREFLIGHT GREEN — ${stages.length}/${stages.length} stages passed.`);
console.log(`Report: ${reportPath}`);
console.log(`Verified commit/baseline: ${report.commit}`);
if (selectedStageId) {
  console.log('Stage-only Green is bounded development evidence, not canonical certification.');
}
