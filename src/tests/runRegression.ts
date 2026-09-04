import { formatRegressionReport, runRegressionSuite } from './regressionSuite';

declare const process:{exitCode?:number};
const report=runRegressionSuite();
console.log(formatRegressionReport(report));
if(report.failed)process.exitCode=1;
