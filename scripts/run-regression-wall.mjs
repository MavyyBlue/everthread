import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';

const root=process.cwd();
const tsx=path.join(root,'node_modules','.bin',process.platform==='win32'?'tsx.cmd':'tsx');

function requestedWorkers(){
  const raw=process.argv.find(arg=>arg.startsWith('--workers='))?.slice('--workers='.length)??'2';
  const workers=Number(raw);
  if(!Number.isInteger(workers)||workers<1||workers>2)throw new Error(`Regression workers must be 1 or 2; received ${raw}`);
  return workers;
}

function runCaptured(command,args){
  const startedAt=Date.now();
  return new Promise(resolve=>{
    const child=spawn(command,args,{cwd:root,env:process.env,stdio:['ignore','pipe','pipe']});
    let stdout='',stderr='';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>{stdout+=chunk;});
    child.stderr.on('data',chunk=>{stderr+=chunk;});
    child.on('error',error=>resolve({exitCode:1,durationMs:Date.now()-startedAt,stdout,stderr,error}));
    child.on('close',code=>resolve({exitCode:typeof code==='number'?code:1,durationMs:Date.now()-startedAt,stdout,stderr,error:null}));
  });
}

function laneSummary(output){
  const line=output.split(/\r?\n/).findLast?.(entry=>entry.startsWith('REGRESSION_LANE_RESULT '))
    ??[...output.split(/\r?\n/)].reverse().find(entry=>entry.startsWith('REGRESSION_LANE_RESULT '));
  if(!line)return null;
  try{return JSON.parse(line.slice('REGRESSION_LANE_RESULT '.length));}
  catch{return null;}
}

function visibleLaneOutput(output){
  return output.split(/\r?\n/).filter(entry=>!entry.startsWith('REGRESSION_LANE_RESULT ')).join('\n').trimEnd();
}

function exactPartition(valuesA,valuesB,availableValues,label){
  const combined=[...valuesA,...valuesB];
  const unique=new Set(combined);
  const expected=new Set(availableValues);
  if(combined.length!==availableValues.length)throw new Error(`${label} shard coverage selected ${combined.length}/${availableValues.length}`);
  if(unique.size!==combined.length)throw new Error(`${label} shard coverage contains overlap`);
  if(unique.size!==expected.size||[...expected].some(value=>!unique.has(value)))throw new Error(`${label} shard coverage does not exactly match the available registry`);
}

async function runRegisteredShards(workers){
  const definitions=[
    {id:'standard',label:'Standard regression lane',args:['src/tests/runRegression.ts','--lane=standard']},
    {id:'heavy',label:'Heavy regression lane',args:['src/tests/runRegression.ts','--lane=heavy']},
  ];
  const startedAt=Date.now();
  let results=[];
  if(workers===2){
    results=await Promise.all(definitions.map(definition=>runCaptured(tsx,definition.args)));
  }else{
    for(const definition of definitions)results.push(await runCaptured(tsx,definition.args));
  }

  for(let index=0;index<definitions.length;index+=1){
    const definition=definitions[index],result=results[index];
    console.log(`--- ${definition.label} output ---`);
    const visibleStdout=visibleLaneOutput(result.stdout);
    if(visibleStdout)process.stdout.write(`${visibleStdout}\n`);
    if(result.stderr)process.stderr.write(result.stderr.endsWith('\n')?result.stderr:`${result.stderr}\n`);
    if(result.error)console.error(result.error instanceof Error?result.error.message:String(result.error));
    console.log(`SHARD_TIMING ${definition.id} ${result.durationMs}ms ${result.exitCode===0?'PASS':'FAIL'} — ${definition.label}`);
  }

  let coverageError=null;
  try{
    const summaries=results.map(result=>laneSummary(result.stdout));
    if(summaries.some(summary=>!summary))throw new Error('A regression shard did not emit its coverage summary');
    const [standard,heavy]=summaries;
    if(standard.lane!=='standard'||heavy.lane!=='heavy')throw new Error('Regression shard lane identities do not match the requested partition');
    if(standard.coreAvailable!==heavy.coreAvailable||standard.suitesAvailable!==heavy.suitesAvailable)throw new Error('Regression shards disagree about available coverage');
    exactPartition(standard.coreCaseIndexes,heavy.coreCaseIndexes,standard.coreAvailableIndexes,'Core case');
    exactPartition(standard.suiteIds,heavy.suiteIds,standard.suiteAvailableIds,'Specialized suite');
    console.log(`SHARD_COVERAGE core=${standard.coreSelected}+${heavy.coreSelected}/${standard.coreAvailable} specialized=${standard.suitesSelected}+${heavy.suitesSelected}/${standard.suitesAvailable} overlap=0`);
  }catch(error){coverageError=error instanceof Error?error:new Error(String(error));console.error(`Regression shard coverage verification failed: ${coverageError.message}`);}

  return {
    exitCode:coverageError||results.some(result=>result.exitCode!==0)?1:0,
    durationMs:Date.now()-startedAt,
  };
}

const auxiliaryStages=[
  {id:'new-life-layout',label:'New Life responsive layout',command:process.execPath,args:['scripts/new-life-layout-regression.mjs']},
  {id:'activity-minigames',label:'Activity-specific minigames',command:tsx,args:['src/tests/minigameArcadeRegression.ts']},
  {id:'feedback-reporting',label:'Activity feedback reporting',command:tsx,args:['src/tests/feedbackReportingRegression.ts']},
  {id:'feedback-remote',label:'Feedback central inbox',command:tsx,args:['src/tests/feedbackRemoteRegression.ts']},
];

let workers;
try{workers=requestedWorkers();}
catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=2;workers=0;}

const completed=[];
const wallStartedAt=Date.now();
if(workers){
  console.log(`Everthread regression process isolation — workers=${workers}, lanes=standard+heavy`);
  const registered=await runRegisteredShards(workers);
  completed.push({id:'registered-regressions',label:'Registered regression suites',durationMs:registered.durationMs,exitCode:registered.exitCode});

  if(registered.exitCode===0){
    for(const stage of auxiliaryStages){
      const startedAt=Date.now();
      const result=spawnSync(stage.command,stage.args,{cwd:root,stdio:'inherit',env:process.env});
      const durationMs=Date.now()-startedAt;
      const exitCode=typeof result.status==='number'?result.status:1;
      completed.push({id:stage.id,label:stage.label,durationMs,exitCode});
      if(result.error)console.error(result.error instanceof Error?result.error.message:String(result.error));
      if(exitCode!==0)break;
    }
  }
}

console.log(`Everthread regression-wall timing — ${completed.length}/${1+auxiliaryStages.length} stages completed in ${Date.now()-wallStartedAt} ms`);
for(const stage of completed){
  console.log(`WALL_TIMING ${stage.id} ${stage.durationMs}ms ${stage.exitCode===0?'PASS':'FAIL'} — ${stage.label}`);
}
const failed=completed.find(stage=>stage.exitCode!==0);
if(failed)process.exitCode=failed.exitCode||1;
