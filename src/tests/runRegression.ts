import { formatRegressionReport, runRegressionSuite } from './regressionSuite';
import { runSpecialCareerWorldRegression } from './specialCareerWorldRegression';

declare const process:{exitCode?:number};
const report=runRegressionSuite();
console.log(formatRegressionReport(report));
try{
  const checks=runSpecialCareerWorldRegression();
  console.log(`Special-career world regression: ${checks}/${checks} checks passed.`);
}catch(error){
  console.error(error instanceof Error?error.message:String(error));
  process.exitCode=1;
}
if(report.failed)process.exitCode=1;
