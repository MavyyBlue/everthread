import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const tsx=path.join(root,'node_modules','.bin',process.platform==='win32'?'tsx.cmd':'tsx');
const stages=[
  {id:'registered-regressions',label:'Registered regression suites',command:tsx,args:['src/tests/runRegression.ts']},
  {id:'new-life-layout',label:'New Life responsive layout',command:process.execPath,args:['scripts/new-life-layout-regression.mjs']},
  {id:'activity-minigames',label:'Activity-specific minigames',command:tsx,args:['src/tests/minigameArcadeRegression.ts']},
  {id:'feedback-reporting',label:'Activity feedback reporting',command:tsx,args:['src/tests/feedbackReportingRegression.ts']},
  {id:'feedback-remote',label:'Feedback central inbox',command:tsx,args:['src/tests/feedbackRemoteRegression.ts']},
];

const completed=[];
const wallStartedAt=Date.now();
for(const stage of stages){
  const startedAt=Date.now();
  const result=spawnSync(stage.command,stage.args,{cwd:root,stdio:'inherit',env:process.env});
  const durationMs=Date.now()-startedAt;
  const exitCode=typeof result.status==='number'?result.status:1;
  completed.push({id:stage.id,label:stage.label,durationMs,exitCode});
  if(result.error)console.error(result.error instanceof Error?result.error.message:String(result.error));
  if(exitCode!==0)break;
}

console.log(`Everthread regression-wall timing — ${completed.length}/${stages.length} stages completed in ${Date.now()-wallStartedAt} ms`);
for(const stage of completed){
  console.log(`WALL_TIMING ${stage.id} ${stage.durationMs}ms ${stage.exitCode===0?'PASS':'FAIL'} — ${stage.label}`);
}
const failed=completed.find(stage=>stage.exitCode!==0);
if(failed)process.exitCode=failed.exitCode||1;
