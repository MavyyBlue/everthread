import { formatSimulationReport, runSimulation, type SimulationMode, type SimulationPolicy } from './simulationHarness';

declare const process:{argv:string[]};
const raw=Number(process.argv[2]??1000);
const lives=Number.isFinite(raw)?Math.max(1,Math.floor(raw)):1000;
const requestedMode=process.argv[3];
const mode:SimulationMode=requestedMode==='full'||requestedMode==='bulk'?requestedMode:(lives>=1000?'bulk':'full');
const requestedPolicy=process.argv[4];const policy:SimulationPolicy|'mixed'=['neutral','conservative','reckless','social','family','career'].includes(requestedPolicy)?requestedPolicy as SimulationPolicy:'mixed';
const report=runSimulation({lives,mode,policy});
console.log(`${formatSimulationReport(report)}\nMode: ${mode} | Policy: ${policy}`);
