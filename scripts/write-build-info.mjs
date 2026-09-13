import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const target=process.argv[2]??'dist/build-info.json';
const pkg=JSON.parse(readFileSync('package.json','utf8'));
let commit=process.env.EVERTHREAD_BASELINE_COMMIT??'';
if(!commit){try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{commit='unavailable';}}
const payload={format:1,version:String(pkg.version??'unknown'),commit:commit||'unavailable'};
mkdirSync(dirname(target),{recursive:true});
writeFileSync(target,JSON.stringify(payload,null,2)+'\n','utf8');
console.log(`Everthread build info: ${payload.version} · ${payload.commit}`);
