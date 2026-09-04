import { useMemo, useState } from 'react';
import type { EngineResult } from '../types/game';
import { gameEngine } from '../stores/gameStore';

const banks={
  driving:[['A warning indicator appears while driving. What is the safest response?','Slow down and assess conditions','Speed up to clear the area','Ignore it',['Slow down and assess conditions']],['Visibility drops sharply. What should you prioritize?','Safe speed and visibility','Keeping exactly the same speed','Using your phone as a flashlight',['Safe speed and visibility']],['You feel too tired to drive safely.','Stop and rest','Open a window and continue indefinitely','Drive faster to finish sooner',['Stop and rest']]],
  boating:[['Weather worsens on the water.','Reduce risk and seek safe conditions','Continue because plans are plans','Stand on the bow for a better view',['Reduce risk and seek safe conditions']],['A safety check shows missing equipment.','Fix the issue before departure','Leave anyway','Hide the checklist',['Fix the issue before departure']],['Another craft has uncertain movement.','Give space and proceed cautiously','Assume it will move away','Race it',['Give space and proceed cautiously']]],
  pilot:[['A preflight check reveals an unresolved issue.','Do not depart until it is resolved','Depart and hope it clears','Skip the rest of the check',['Do not depart until it is resolved']],['Conditions exceed your safe limits.','Delay or divert','Continue to preserve schedule','Disable warnings',['Delay or divert']],['You are unsure about an instruction.','Clarify before acting','Guess immediately','Ignore all further instructions',['Clarify before acting']]],
} as const;

export function LicenseQuiz({kind,onResult,disabled=false}:{kind:'driving'|'boating'|'pilot';onResult:(r:EngineResult)=>void;disabled?:boolean}){const questions=useMemo(()=>banks[kind],[kind]);const[index,setIndex]=useState(0);const[correct,setCorrect]=useState(0);const done=index>=questions.length;const q=questions[index];
  if(done)return <div className="quiz-result"><strong>Quiz complete</strong><p>{correct}/{questions.length} safe decisions.</p><button disabled={disabled} onClick={()=>onResult(gameEngine.license(kind,Math.round(correct/questions.length*100)))}>{disabled?'Test unavailable this year':'Submit test'}</button></div>;
  return <div className="quiz"><p className="eyebrow">Question {index+1} of {questions.length}</p><h3>{q![0]}</h3><div className="action-grid">{(q![1] as string[]|string) instanceof Array?null:[q![1],q![2],q![3]].map(answer=><button key={String(answer)} onClick={()=>{if(q![4].includes(answer as never))setCorrect(c=>c+1);setIndex(i=>i+1);}}>{answer}</button>)}</div></div>;
}
