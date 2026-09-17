import { formatRegressionReport, formatRegressionTimingReport, regressionCases, runRegressionSuite } from './regressionSuite';
import { regressionRegistry } from './regressionRegistry';
import type { RegressionExecutionClass } from './regressionMetadata';

declare const process:{argv:string[];exitCode?:number};
type RegressionLane='all'|RegressionExecutionClass;

interface SuiteTiming {
  id:string;
  label:string;
  executionClass:RegressionExecutionClass;
  status:'passed'|'failed';
  checks:number|null;
  durationMs:number;
}

function selectedLane():RegressionLane{
  const raw=process.argv.find(arg=>arg.startsWith('--lane='))?.slice('--lane='.length)??'all';
  if(raw==='all'||raw==='standard'||raw==='heavy')return raw;
  throw new Error(`Unknown regression lane: ${raw}`);
}

const lane=selectedLane();
const caseClass=(test:(typeof regressionCases)[number]):RegressionExecutionClass=>test.executionClass??'standard';
const selectedCases=lane==='all'?regressionCases:regressionCases.filter(test=>caseClass(test)===lane);
const selectedSuites=lane==='all'?regressionRegistry:regressionRegistry.filter(suite=>suite.executionClass===lane);
const wallStartedAt=Date.now();

if(lane!=='all')console.log(`Everthread registered regression lane — ${lane}`);
const baseReport=runRegressionSuite(selectedCases);
console.log(formatRegressionReport(baseReport));
console.log(formatRegressionTimingReport(baseReport));

const timings:SuiteTiming[]=[{
  id:lane==='all'?'core-regression-suite':`core-regression-suite-${lane}`,
  label:lane==='all'?'Everthread regression suite':`Everthread regression suite (${lane} lane)`,
  executionClass:lane==='all'?'heavy':lane,
  status:baseReport.failed?'failed':'passed',
  checks:baseReport.passed+baseReport.failed,
  durationMs:baseReport.durationMs,
}];

for(const suite of selectedSuites){
  const startedAt=Date.now();
  try{
    const checks=await suite.run();
    timings.push({id:suite.id,label:suite.label,executionClass:suite.executionClass,status:'passed',checks,durationMs:Date.now()-startedAt});
    console.log(`${suite.label}: ${checks}/${checks} checks passed.`);
  }catch(error){
    timings.push({id:suite.id,label:suite.label,executionClass:suite.executionClass,status:'failed',checks:null,durationMs:Date.now()-startedAt});
    console.error(error instanceof Error?error.message:String(error));
    process.exitCode=1;
  }
}

const wallDurationMs=Date.now()-wallStartedAt;
const laneSuffix=lane==='all'?'':` [${lane}]`;
console.log(`Everthread registered regression timing${laneSuffix} — ${timings.length} suites in ${wallDurationMs} ms`);
for(const timing of [...timings].sort((a,b)=>b.durationMs-a.durationMs||a.id.localeCompare(b.id))){
  const checks=timing.checks===null?'n/a':String(timing.checks);
  console.log(`SUITE_TIMING ${timing.id} ${timing.durationMs}ms ${timing.status.toUpperCase()} checks=${checks} class=${timing.executionClass} — ${timing.label}`);
}

const summary={
  lane,
  coreAvailable:regressionCases.length,
  coreAvailableIndexes:regressionCases.map((_,index)=>index+1),
  coreSelected:selectedCases.length,
  corePassed:baseReport.passed,
  coreFailed:baseReport.failed,
  coreCaseIndexes:baseReport.results.map(result=>result.index),
  suitesAvailable:regressionRegistry.length,
  suiteAvailableIds:regressionRegistry.map(suite=>suite.id),
  suitesSelected:selectedSuites.length,
  suitesPassed:timings.slice(1).filter(timing=>timing.status==='passed').length,
  suitesFailed:timings.slice(1).filter(timing=>timing.status==='failed').length,
  suiteIds:selectedSuites.map(suite=>suite.id),
  durationMs:wallDurationMs,
};
console.log(`REGRESSION_LANE_RESULT ${JSON.stringify(summary)}`);
if(baseReport.failed)process.exitCode=1;
