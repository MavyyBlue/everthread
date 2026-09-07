import { formatRegressionReport, runRegressionSuite } from './regressionSuite';
import { runSpecialCareerWorldRegression } from './specialCareerWorldRegression';
import { runMusicCareerRegression } from './musicCareerRegression';
import { runSocialAffiliationRegression } from './socialAffiliationRegression';
import { runModelingCareerRegression } from './modelingCareerRegression';

declare const process:{exitCode?:number};
const report=runRegressionSuite();
console.log(formatRegressionReport(report));
try{const checks=runSpecialCareerWorldRegression();console.log(`Special-career world regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runMusicCareerRegression();console.log(`Music career regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runSocialAffiliationRegression();console.log(`Social-affiliation regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
try{const checks=runModelingCareerRegression();console.log(`Modeling career regression: ${checks}/${checks} checks passed.`);}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
if(report.failed)process.exitCode=1;
