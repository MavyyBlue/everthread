import { readFileSync } from 'node:fs';

const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
let checks=0;
const verify=(condition,message)=>{checks+=1;if(!condition)throw new Error(`New Life layout regression failed: ${message}`);};

verify(css.includes('.form-stack,.settings-list{display:grid;gap:12px;min-width:0}'),'form stacks must be allowed to shrink inside mobile sheets');
verify(css.includes('.form-field{display:grid;gap:6px;font-size:.76rem;font-weight:750;min-width:0}'),'form fields must not impose intrinsic minimum width on their grid track');
verify(css.includes('.form-field input,.form-field select{width:100%;min-width:0;max-width:100%;'),'inputs and selects must stay inside their assigned mobile column');
verify(css.includes('.two-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;min-width:0}'),'two-column New Life rows must use zero-minimum responsive grid tracks');
verify(css.includes('.two-col>*{min-width:0}'),'two-column children must be allowed to shrink without forcing horizontal overflow');
verify(css.includes('@media(max-width:360px)')&&css.includes('.two-col{grid-template-columns:1fr}'),'small phones must retain the single-column fallback');
verify(css.includes('.creation-identity-preview>div{min-width:0;overflow-wrap:anywhere}'),'portrait copy must wrap rather than widen the sheet');
verify(css.includes('.info-card strong,.info-card small{display:block}'),'New Life home context should stack its heading and explanation cleanly');

console.log(`New Life responsive layout regression: ${checks}/${checks} checks passed.`);
