import { useState } from 'react';
import { gameEngine } from '../stores/gameStore';
import './SecretCodePad.css';

const DIGITS=['1','2','3','4','5','6','7','8','9'] as const;
const MAX_CODE_LENGTH=8;

export function SecretCodePad(){
  const[value,setValue]=useState('');
  const[feedback,setFeedback]=useState('');
  const append=(digit:string)=>{setFeedback('');setValue(current=>(current+digit).slice(0,MAX_CODE_LENGTH));};
  const backspace=()=>{setFeedback('');setValue(current=>current.slice(0,-1));};
  const clear=()=>{setFeedback('');setValue('');};
  const submit=()=>{
    const result=gameEngine.redeemSecretCode(value);
    setFeedback(result.messages.map(message=>message.text).join(' '));
    if(result.success)setValue('');
  };

  return <div className="secret-code-pad" aria-label="Secret code keypad">
    <output className="secret-code-display" aria-live="polite" aria-label={value?`Entered code ${value}`:'No code entered'}>{value||'— — — —'}</output>
    <div className="secret-code-keys">
      {DIGITS.map(digit=><button type="button" key={digit} onClick={()=>append(digit)} disabled={value.length>=MAX_CODE_LENGTH}>{digit}</button>)}
      <button type="button" onClick={clear} aria-label="Clear code">Clear</button>
      <button type="button" onClick={()=>append('0')} disabled={value.length>=MAX_CODE_LENGTH}>0</button>
      <button type="button" onClick={backspace} disabled={!value} aria-label="Delete last digit">⌫</button>
    </div>
    <button type="button" className="secret-code-submit" onClick={submit} disabled={!value}>Enter Code</button>
    {feedback&&<p className="secret-code-feedback" aria-live="polite">{feedback}</p>}
  </div>;
}
