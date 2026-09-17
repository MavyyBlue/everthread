import { formatRegressionReport, formatRegressionTimingReport, runRegressionSuite } from './regressionSuite';
import { regressionRegistry } from './regressionRegistry';

declare const process:{exitCode?:number};

interface SuiteTiming {
  id:string;
  label:string;
  executionClass:'standard'|'heavy';
  status:'passed'|'failed';
  checks:number|null;
  durationMs:number;
}

const wallStartedAt=Date.now();
const baseReport=runRegressionSuite();
console.log(formatRegressionReport(baseReport));
console.log(formatRegressionTimingReport(baseReport));

const timings:SuiteTiming[]=[{
  id:'core-regression-suite',
  label:'Everthread regression suite',
  executionClass:'heavy',
  status:baseReport.failed?'failed':'passed',
  checks:baseReport.passed+baseReport.failed,
  durationMs:baseReport.durationMs,
}];

for(const suite of regressionRegistry){
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
console.log(`Everthread registered regression timing — ${timings.length} suites in ${wallDurationMs} ms`);
for(const timing of [...timings].sort((a,b)=>b.durationMs-a.durationMs||a.id.localeCompare(b.id))){
  const checks=timing.checks===null?'n/a':String(timing.checks);
  console.log(`SUITE_TIMING ${timing.id} ${timing.durationMs}ms ${timing.status.toUpperCase()} checks=${checks} class=${timing.executionClass} — ${timing.label}`);
}

if(baseReport.failed)process.exitCode=1;
